import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  Star,
  MapPin,
  Truck,
  AlertCircle,
  Filter,
  X,
  ChevronDown,
  Plus,
  Minus,
  Check,
  Clock,
  Package,
  DollarSign,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSupplies, Supply, CartItem } from '../hooks/useSupplies';

const SUPPLY_CATEGORIES = [
  'All',
  'Equipment',
  'Materials',
  'Tools',
  'Parts',
  'Safety Gear',
  'Consumables',
  'Other',
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export default function Supplies() {
  const { user } = useAuth();
  const {
    supplies,
    filteredSupplies,
    loading,
    error,
    fetchSupplies,
    cartItems,
    fetchCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    createOrder,
    toggleFavorite,
  } = useSupplies();

  const [activeTab, setActiveTab] = useState<'browse' | 'cart' | 'orders' | 'sell'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating' | 'price-low' | 'price-high'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  // Initialize
  useEffect(() => {
    fetchSupplies({ category: selectedCategory, search: searchQuery, sortBy });
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchCart();
    }
  }, [user?.id]);

  // Handle search and filters
  useEffect(() => {
    fetchSupplies({
      category: selectedCategory,
      search: searchQuery,
      sortBy,
    });
  }, [searchQuery, selectedCategory, sortBy]);

  const handleAddToCart = async (supply: Supply) => {
    const success = await addToCart(supply.id);
    if (success) {
      alert(`${supply.name} added to cart!`);
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    return sum + ((item.supplies?.unit_price || 0) * item.quantity);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Supplies Marketplace</h1>
          <p className="text-lg opacity-90">Find equipment, materials, tools, and supplies for your projects</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {['browse', 'cart', 'orders', 'sell'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'browse' && 'Browse Supplies'}
                {tab === 'cart' && `Shopping Cart (${cartItems.length})`}
                {tab === 'orders' && 'My Orders'}
                {tab === 'sell' && 'List Supplies'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* BROWSE TAB */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
              <div className="bg-white rounded-lg shadow p-6 sticky top-32">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-sm text-gray-900 mb-3">Category</h4>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SUPPLY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-3">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search Bar */}
              <div className="mb-8">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search supplies, equipment, materials..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Filter className="w-5 h-5" />
                    Filters
                  </button>
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-6 text-sm text-gray-600">
                Showing {filteredSupplies.length} supplies
              </div>

              {/* Supplies Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-gray-500">Loading supplies...</div>
                </div>
              ) : filteredSupplies.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No supplies found</h3>
                  <p className="text-gray-600 mt-2">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSupplies.map((supply) => (
                    <SupplyCard
                      key={supply.id}
                      supply={supply}
                      onAddToCart={() => handleAddToCart(supply)}
                      onViewDetails={() => {
                        setSelectedSupply(supply);
                        setShowDetails(true);
                      }}
                      onFavorite={() => toggleFavorite(supply.id, false)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CART TAB */}
        {activeTab === 'cart' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {cartItems.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
                  <p className="text-gray-600 mt-2">Add supplies to get started</p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onRemove={() => removeFromCart(item.id)}
                      onUpdateQuantity={(qty) => updateCartQuantity(item.id, qty)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Cart Summary */}
            {cartItems.length > 0 && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6 sticky top-32">
                  <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                  <div className="space-y-3 pb-4 border-b">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">UGX {cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">UGX 0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">UGX 0</span>
                    </div>
                  </div>
                  <div className="flex justify-between font-semibold text-lg mt-4 mb-6">
                    <span>Total</span>
                    <span>UGX {cartTotal.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">My Orders</h2>
            {userOrders.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                <p className="text-gray-600 mt-2">Start shopping to place your first order</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold">{order.order_number}</p>
                        <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-lg font-semibold">UGX {order.total_amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SELL TAB */}
        {activeTab === 'sell' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">List Your Supplies</h2>
            <div className="bg-white rounded-lg shadow p-8">
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold mb-4">Add New Supply</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Supply Name"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Select Category</option>
                      {SUPPLY_CATEGORIES.slice(1).map((cat) => (
                        <option key={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    placeholder="Description"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="number" placeholder="Unit Price (UGX)" className="px-4 py-2 border border-gray-300 rounded-lg" />
                    <input type="number" placeholder="Stock Quantity" className="px-4 py-2 border border-gray-300 rounded-lg" />
                    <select className="px-4 py-2 border border-gray-300 rounded-lg">
                      <option>Unit Type (Piece, Box, Kg...)</option>
                      <option>Piece</option>
                      <option>Box</option>
                      <option>Kg</option>
                      <option>Liter</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                    List Supply
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Supply Details Modal */}
      {showDetails && selectedSupply && (
        <SupplyDetailsModal
          supply={selectedSupply}
          onClose={() => setShowDetails(false)}
          onAddToCart={() => handleAddToCart(selectedSupply)}
        />
      )}
    </div>
  );
}

// Supply Card Component
function SupplyCard({
  supply,
  onAddToCart,
  onViewDetails,
  onFavorite,
}: {
  supply: Supply;
  onAddToCart: () => void;
  onViewDetails: () => void;
  onFavorite: () => void;
}) {
  const inStock = supply.stock_quantity > 0;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {supply.image_url ? (
          <img src={supply.image_url} alt={supply.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
            <Package className="w-12 h-12" />
          </div>
        )}
        {supply.is_featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Featured
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{supply.category}</p>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{supply.name}</h3>

        {/* Rating */}
        {supply.review_count > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(supply.average_rating) ? 'fill-current' : ''}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({supply.review_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="mb-4">
          <p className="text-lg font-bold text-gray-900">
            UGX {supply.unit_price.toLocaleString()}
          </p>
          <p className="text-xs text-gray-600">per {supply.unit_type || 'unit'}</p>
        </div>

        {/* Stock Info */}
        <div className="mb-4">
          <p className={`text-xs font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
            {inStock ? `${supply.stock_quantity} in stock` : 'Out of stock'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onAddToCart}
            disabled={!inStock}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 text-sm font-medium flex items-center justify-center gap-1"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
          <button
            onClick={onViewDetails}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-medium"
          >
            Details
          </button>
          <button
            onClick={onFavorite}
            className="px-3 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Cart Item Row Component
function CartItemRow({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}) {
  if (!item.supplies) return null;

  const lineTotal = item.supplies.unit_price * item.quantity;

  return (
    <div className="bg-white rounded-lg shadow p-4 flex gap-4">
      {/* Image */}
      <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
        {item.supplies.image_url ? (
          <img src={item.supplies.image_url} alt={item.supplies.name} className="w-full h-full object-cover rounded" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <Package className="w-6 h-6 text-gray-600" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{item.supplies.name}</h4>
        <p className="text-sm text-gray-600 mb-2">UGX {item.supplies.unit_price.toLocaleString()} each</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
            className="p-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-3 font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="p-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price & Remove */}
      <div className="text-right">
        <p className="font-semibold text-gray-900 mb-2">UGX {lineTotal.toLocaleString()}</p>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

// Supply Details Modal Component
function SupplyDetailsModal({
  supply,
  onClose,
  onAddToCart,
}: {
  supply: Supply;
  onClose: () => void;
  onAddToCart: () => void;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image */}
            <div>
              <div className="h-96 bg-gray-200 rounded-lg overflow-hidden">
                {supply.image_url ? (
                  <img src={supply.image_url} alt={supply.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <Package className="w-20 h-20 text-gray-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div>
              <p className="text-sm text-gray-600 mb-2">{supply.category}</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{supply.name}</h2>

              {/* Rating */}
              {supply.review_count > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(supply.average_rating) ? 'fill-current' : ''}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({supply.review_count} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">
                  UGX {supply.unit_price.toLocaleString()}
                </p>
                <p className="text-gray-600">per {supply.unit_type || 'unit'}</p>
              </div>

              {/* Description */}
              {supply.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{supply.description}</p>
                </div>
              )}

              {/* Stock */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className={`font-semibold ${supply.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {supply.stock_quantity > 0 ? `${supply.stock_quantity} in stock` : 'Out of stock'}
                </p>
              </div>

              {/* Delivery Info */}
              {supply.delivery_time_days && (
                <div className="mb-6 flex items-center gap-2 text-gray-700">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span>Estimated delivery: {supply.delivery_time_days} days</span>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(supply.minimum_order_quantity || 1, quantity - 1))}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={supply.minimum_order_quantity || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(supply.minimum_order_quantity || 1, parseInt(e.target.value) || 1))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {supply.minimum_order_quantity && (
                  <p className="text-xs text-gray-600 mt-1">Minimum order: {supply.minimum_order_quantity}</p>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={onAddToCart}
                disabled={supply.stock_quantity === 0}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
