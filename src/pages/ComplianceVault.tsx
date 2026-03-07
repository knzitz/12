import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, FileText, Upload, Calendar, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComplianceDocument {
  id: string;
  type: 'tax_clearance' | 'nssf' | 'trading_license' | 'insurance' | 'business_registration';
  documentName: string;
  uploadedDate: string;
  expiryDate: string;
  status: 'ok' | 'warning' | 'critical' | 'expired';
  documentUrl: string;
  renewal?: {
    available: boolean;
    fee: number;
  };
}

const DOCUMENT_TYPES = [
  {
    id: 'tax_clearance',
    label: 'Tax Clearance Certificate',
    description: 'Required for government contracts',
    renewalDays: 365,
    isCritical: true,
  },
  {
    id: 'nssf',
    label: 'NSSF Clearance',
    description: 'Social security compliance',
    renewalDays: 30,
    isCritical: true,
  },
  {
    id: 'trading_license',
    label: 'Trading License',
    description: 'Business operation permit',
    renewalDays: 365,
    isCritical: true,
  },
  {
    id: 'insurance',
    label: 'Business Insurance',
    description: 'Liability and coverage',
    renewalDays: 365,
    isCritical: false,
  },
  {
    id: 'business_registration',
    label: 'Business Registration',
    description: 'Company registration certificate',
    renewalDays: 365,
    isCritical: false,
  },
];

export default function ComplianceVault() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<ComplianceDocument[]>([
    // Mock data for demo
    {
      id: '1',
      type: 'tax_clearance',
      documentName: 'Tax Clearance Certificate',
      uploadedDate: '2024-06-15',
      expiryDate: '2025-06-15',
      status: 'ok',
      documentUrl: '#',
      renewal: { available: true, fee: 150000 },
    },
    {
      id: '2',
      type: 'nssf',
      documentName: 'NSSF Clearance - July 2024',
      uploadedDate: '2024-07-01',
      expiryDate: '2024-08-01',
      status: 'critical',
      documentUrl: '#',
      renewal: { available: true, fee: 0 },
    },
  ]);

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ComplianceDocument | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'expired':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-red-700" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const handleRenewClick = (doc: ComplianceDocument) => {
    setSelectedDocument(doc);
    setShowRenewalModal(true);
  };

  const handleRenewalSubmit = () => {
    // This would trigger payment flow
    alert(`Renewal initiated for ${selectedDocument?.documentName}`);
    setShowRenewalModal(false);
  };

  const missingDocuments = DOCUMENT_TYPES.filter(
    (type) => !documents.find((doc) => doc.type === type.id)
  );

  const criticalAlerts = documents.filter((doc) => doc.status === 'critical' || doc.status === 'expired');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Compliance Vault</h1>
          <p className="text-lg text-slate-600">
            Manage all your compliance documents in one secure place. Get automatic reminders before
            expiry.
          </p>
        </div>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-300 rounded-xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Immediate Action Required</h3>
                <ul className="space-y-2">
                  {criticalAlerts.map((doc) => (
                    <li key={doc.id} className="text-red-800">
                      <span className="font-semibold">{doc.documentName}</span> expires in{' '}
                      <span className="font-bold">{getDaysUntilExpiry(doc.expiryDate)} days</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowRenewalModal(true)}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Renew Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {documents.map((doc) => {
            const daysLeft = getDaysUntilExpiry(doc.expiryDate);
            return (
              <div key={doc.id} className={`border-2 rounded-lg p-6 ${getStatusColor(doc.status)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(doc.status)}
                    <div>
                      <h3 className="font-semibold text-slate-900">{doc.documentName}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Uploaded {new Date(doc.uploadedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">
                      Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-current border-opacity-20">
                    {daysLeft < 0 ? (
                      <div className="text-sm font-semibold text-red-700">
                        ⚠️ EXPIRED - Immediate renewal required
                      </div>
                    ) : daysLeft <= 7 ? (
                      <div className="text-sm font-semibold text-red-600">
                        🔴 Critical: {daysLeft} day(s) left
                      </div>
                    ) : daysLeft <= 30 ? (
                      <div className="text-sm font-semibold text-yellow-700">
                        🟡 Warning: {daysLeft} days left
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-green-700">
                        ✅ OK: {daysLeft} days left
                      </div>
                    )}
                  </div>
                </div>

                {doc.renewal?.available && (
                  <button
                    onClick={() => handleRenewClick(doc)}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                  >
                    {doc.renewal.fee > 0 ? `Renew (UGX ${doc.renewal.fee.toLocaleString()})` : 'Renew for Free'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Upload New Document */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Upload Document</h2>
          <div className="bg-white border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-500 transition cursor-pointer">
            <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Compliance Document</h3>
            <p className="text-slate-600 mb-4">Drag and drop your document or click to browse</p>
            <select
              value={selectedType || ''}
              onChange={(e) => setSelectedType(e.target.value)}
              className="mx-auto block px-4 py-2 border border-slate-300 rounded-lg mb-4"
            >
              <option value="">Select document type</option>
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
              Choose File
            </button>
          </div>
        </div>

        {/* Missing Documents Alert */}
        {missingDocuments.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Missing Critical Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missingDocuments.filter((doc) => doc.isCritical).map((doc) => (
                <div key={doc.id} className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">{doc.label}</h4>
                    <p className="text-sm text-blue-800">{doc.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-blue-800 mt-4">
              ⚠️ You cannot bid on tenders without these critical documents. Please upload them as soon as
              possible.
            </p>
          </div>
        )}
      </div>

      {/* Renewal Modal */}
      {showRenewalModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Renew Document</h3>
            <p className="text-slate-600 mb-6">{selectedDocument.documentName}</p>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Statutory Fee</span>
                  <span className="font-semibold">UGX {(selectedDocument.renewal?.fee || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Service Fee (Empowise)</span>
                  <span className="font-semibold">UGX 50,000</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-blue-600">
                    UGX {((selectedDocument.renewal?.fee || 0) + 50000).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  ✅ Our team will handle the renewal process with the relevant authorities. You'll receive
                  the renewed document within 3-5 business days.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRenewalModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRenewalSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                Pay & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
