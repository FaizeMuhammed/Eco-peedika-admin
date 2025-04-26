'use client';
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppStore, Views } from '../store/app.store';
import {
  Check,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  Phone,
  ShoppingCart,
  Truck,
  MapPin,
  User,
  DollarSign,
  Clock,
  Plus,
  Minus,
  X,
  FileText,
  CheckCircle,
  ArrowLeft,
  Search,
  Star,
  Package,
  Clipboard
} from "lucide-react";

// Mock data for autocomplete
const customers = [
  { id: 1, name: "John Doe", phone: "9876543210", lastOrder: '3 days ago', totalOrders: 28, favoriteItems: ['Chicken Biriyani', 'Beef Roast'] },
  { id: 2, name: "Jane Smith", phone: "8765432109", lastOrder: '1 day ago', totalOrders: 42, favoriteItems: ['Fish Curry', 'Goat Stew'] },
  { id: 3, name: "Arun Kumar", phone: "7654321098", lastOrder: '1 week ago', totalOrders: 12, favoriteItems: ['Chicken Curry', 'Pork Chops'] },
  { id: 4, name: "Priya Sharma", phone: "6543210987", lastOrder: '2 days ago', totalOrders: 32, favoriteItems: ['Beef Steak', 'Fish Fry'] },
  { id: 5, name: "Mohammed Ali", phone: "5432109876", lastOrder: '5 days ago', totalOrders: 8, favoriteItems: ['Chicken Wings', 'Pork Ribs'] },
];

// Product catalog with prices and descriptions
const productCatalog = {
  chicken: [
    { id: 'c1', name: 'Chicken Breast', price: 180, unit: 'kg', description: 'Fresh boneless chicken breast' },
    { id: 'c2', name: 'Chicken Thigh', price: 160, unit: 'kg', description: 'Juicy chicken thighs' },
    { id: 'c3', name: 'Whole Chicken', price: 220, unit: 'pc', description: 'Farm fresh whole chicken' },
    { id: 'c4', name: 'Chicken Wings', price: 140, unit: 'kg', description: 'Perfect for frying or grilling' },
  ],
  beef: [
    { id: 'b1', name: 'Beef Sirloin', price: 450, unit: 'kg', description: 'Premium cut beef sirloin' },
    { id: 'b2', name: 'Ground Beef', price: 320, unit: 'kg', description: 'Fresh ground beef' },
    { id: 'b3', name: 'Beef Ribs', price: 380, unit: 'kg', description: 'Juicy beef ribs' },
  ],
  pork: [
    { id: 'p1', name: 'Pork Chops', price: 380, unit: 'kg', description: 'Tender pork chops' },
    { id: 'p2', name: 'Pork Belly', price: 420, unit: 'kg', description: 'Pork belly' },
  ],
  fish: [
    { id: 'f1', name: 'King Fish', price: 550, unit: 'kg', description: 'Fresh king fish steaks' },
    { id: 'f2', name: 'Prawns', price: 650, unit: 'kg', description: 'Jumbo prawns' },
    { id: 'f3', name: 'Pomfret', price: 600, unit: 'kg', description: 'Fresh white pomfret' },
  ],
  goat: [
    { id: 'g1', name: 'Goat Meat', price: 750, unit: 'kg', description: 'Fresh goat meat cuts' },
    { id: 'g2', name: 'Goat Ribs', price: 680, unit: 'kg', description: 'Tender goat ribs' },
  ],
};

const deliveryPersonnel = [
  { id: 1, name: 'YADHU', rating: 4.8, deliveries: 128, status: 'Available' },
  { id: 2, name: 'DON', rating: 4.9, deliveries: 215, status: 'Available' },
  { id: 3, name: 'Praveen', rating: 4.7, deliveries: 184, status: 'Available' },
  { id: 4, name: 'franko', rating: 4.6, deliveries: 95, status: 'Busy' },
  { id: 5, name: 'Milan', rating: 4.9, deliveries: 156, status: 'Available' },
  { id: 6, name: 'joseph', rating: 4.8, deliveries: 172, status: 'Available' },
];

const locations = [
  { id: 1, name: 'PAZOOKARA', deliveryTime: '25-30 min', distance: '3.2 km' },
  { id: 2, name: 'THRISSUR', deliveryTime: '35-40 min', distance: '5.8 km' },
  { id: 3, name: 'KOCHI', deliveryTime: '50-60 min', distance: '12.5 km' },
];

const CreateOrder = () => {
  const { navigateTo, Views } = useAppStore();
  const [activeTab, setActiveTab] = useState('details');
  const [formProgress, setFormProgress] = useState(0);
  const [formData, setFormData] = useState({
    customer: '',
    mobile: '',
    chicken: '',
    beef: '',
    pork: '',
    fish: '',
    goat: '',
    items: '',
    deliveryCharge: '40',
    orderDetails: '',
    billAmount: '',
    location: 'PAZOOKARA',
    deliveryBy: '',
    paymentStatus: 'Not paid',
    orderStatus: 'New Order'
  });
  
  // UI state
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Theme colors
  const theme = {
    primary: 'bg-[#00FF80]',
    secondary: 'bg-[#0a2b1d]',
    accent: 'bg-[#00FF80]',
    highlightColor: 'bg-[#00FF80]',
    productColor: 'bg-[#00FF80]',
    deliveryColor: 'bg-[#00FF80]',
  };
  
  // Calculate form completion progress
  useEffect(() => {
    const requiredFields = ['customer', 'mobile', 'location', 'deliveryBy'];
    const optionalFields = ['chicken', 'beef', 'pork', 'fish', 'goat', 'items', 'orderDetails', 'deliveryCharge'];
    
    let filledRequired = 0;
    let filledOptional = 0;
    
    requiredFields.forEach(field => {
      if (formData[field]) filledRequired++;
    });
    
    optionalFields.forEach(field => {
      if (formData[field]) filledOptional++;
    });
    
    // At least one product category must be filled
    const hasProduct = ['chicken', 'beef', 'pork', 'fish', 'goat', 'items'].some(field => formData[field]);
    
    // Calculate progress - required fields contribute 70%, optional contribute 30%
    const requiredProgress = (filledRequired / requiredFields.length) * 70;
    const optionalProgress = (filledOptional / optionalFields.length) * 30;
    
    // If no product is selected, cap progress at 40%
    const totalProgress = hasProduct ? 
      Math.min(100, Math.round(requiredProgress + optionalProgress)) : 
      Math.min(40, Math.round(requiredProgress + optionalProgress));
    
    setFormProgress(totalProgress);
  }, [formData]);
  
  // Calculate total bill amount
  useEffect(() => {
    let total = 0;
    
    // Add product costs
    selectedProducts.forEach(product => {
      total += product.price * product.quantity;
    });
    
    // Add delivery charge
    if (formData.deliveryCharge) {
      total += parseInt(formData.deliveryCharge);
    }
    
    if (total > 0) {
      setFormData(prev => ({
        ...prev,
        billAmount: total.toString()
      }));
    }
  }, [selectedProducts, formData.deliveryCharge]);
  
  // Filter customers based on input
  useEffect(() => {
    if (formData.customer.length > 0) {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(formData.customer.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setShowCustomerSuggestions(filtered.length > 0);
    } else {
      setShowCustomerSuggestions(false);
    }
  }, [formData.customer]);
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Show product suggestions when typing in product fields
    if (['chicken', 'beef', 'pork', 'fish', 'goat'].includes(name) && value) {
      setShowProductSuggestions(name);
    } else if (name === 'customer' && !value) {
      setFormData(prev => ({
        ...prev,
        mobile: '' // Clear phone when customer is cleared
      }));
    }
  };
  
  // Select customer from suggestions
  const selectCustomer = (customer) => {
    setFormData({
      ...formData,
      customer: customer.name,
      mobile: customer.phone
    });
    setShowCustomerSuggestions(false);
  };
  
  // Add product to order
  const addProduct = (product, category) => {
    // Check if product already exists in selection
    const existingIndex = selectedProducts.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      // Update quantity if already exists
      const newProducts = [...selectedProducts];
      newProducts[existingIndex].quantity += 1;
      setSelectedProducts(newProducts);
    } else {
      // Add new product
      setSelectedProducts([
        ...selectedProducts,
        { ...product, category, quantity: 1 }
      ]);
    }
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [category]: prev[category] ? `${prev[category]}, ${product.name}` : product.name
    }));
    
    setShowProductSuggestions(false);
  };
  
  // Remove product from order
  const removeProduct = (productId) => {
    const product = selectedProducts.find(p => p.id === productId);
    if (!product) return;
    
    const newProducts = selectedProducts.filter(p => p.id !== productId);
    setSelectedProducts(newProducts);
    
    // Update form data for the relevant category
    const categoryProducts = selectedProducts
      .filter(p => p.category === product.category && p.id !== productId)
      .map(p => p.name)
      .join(', ');
    
    setFormData(prev => ({
      ...prev,
      [product.category]: categoryProducts
    }));
  };
  
  // Update product quantity
  const updateProductQuantity = (productId, change) => {
    const newProducts = selectedProducts.map(product => {
      if (product.id === productId) {
        const newQuantity = Math.max(1, product.quantity + change);
        return { ...product, quantity: newQuantity };
      }
      return product;
    });
    
    setSelectedProducts(newProducts);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Only proceed with submission if we're in the delivery tab
    if (activeTab !== 'delivery') {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simple validation
    const isValid = formData.customer && formData.mobile && selectedProducts.length > 0;
    
    if (!isValid) {
      // Don't show error, just delay and stop loading
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
      return;
    }
    
    // Show success message after completing submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1000);
  };
  
  // Get the currently selected location details
  const selectedLocation = locations.find(loc => loc.name === formData.location) || locations[0];

  return (
    <div className="pb-20 pt-[90px]">
      {/* Progress Bar */}
      <div className="bg-white px-4 py-2 rounded-t-lg border border-gray-200 mb-1 shadow-sm">
        <div className="flex justify-between items-center mb-1 text-sm text-black">
          <span>Form Progress</span>
          <span>{formProgress}% complete</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div 
            className={`${theme.highlightColor} h-2 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${formProgress}%` }}
          />
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex justify-around px-2 py-2 bg-white border border-gray-200 sticky top-0 z-10 mb-4 rounded-lg shadow-sm">
        <button 
          onClick={() => setActiveTab('details')}
          className={`text-sm font-medium px-4 py-2 rounded transition-all duration-200 ${
            activeTab === 'details' 
              ? `${theme.highlightColor} text-[#0a2b1d] shadow-sm` 
              : 'text-[#0a2b1d] bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <User size={16} className={`inline mr-1.5 ${activeTab === 'details' ? 'text-[#0a2b1d]' : 'text-[#0a2b1d]'}`} />
          Details
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`text-sm font-medium px-4 py-2 rounded transition-all duration-200 ${
            activeTab === 'products' 
              ? `${theme.productColor} text-[#0a2b1d] shadow-sm`
              : 'text-[#0a2b1d] bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <ShoppingCart size={16} className={`inline mr-1.5 ${activeTab === 'products' ? 'text-[#0a2b1d]' : 'text-[#0a2b1d]'}`} />
          Products
        </button>
        <button 
          onClick={() => setActiveTab('delivery')}
          className={`text-sm font-medium px-4 py-2 rounded transition-all duration-200 ${
            activeTab === 'delivery' 
              ? `${theme.deliveryColor} text-[#0a2b1d] shadow-sm`
              : 'text-[#0a2b1d] bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <Truck size={16} className={`inline mr-1.5 ${activeTab === 'delivery' ? 'text-[#0a2b1d]' : 'text-[#0a2b1d]'}`} />
          Delivery
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Form Section - 2/3 width on desktop */}
        <div className="md:w-2/3 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Customer Details */}
            <div className={`${activeTab === 'details' ? 'block' : 'hidden'}`}>
              <Card className="bg-white shadow-sm border-gray-200">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-[#0a2b1d] to-[#104732] text-white p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-white bg-opacity-20 p-1.5 rounded-md">
                          <User size={18} className="text-white" />
                        </div>
                        <h3 className="font-medium">Customer Information</h3>
                      </div>
                      {formData.customer && (
                        <div className="flex items-center bg-white text-[#00FF80] px-2 py-1 rounded-full shadow-sm text-xs">
                          <CheckCircle size={12} className="mr-1" />
                          Customer Selected
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {/* Customer Name with Enhanced Suggestions */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-[#0a2b1d] mb-1">Customer Name</label>
                      <div className={`flex rounded overflow-hidden border transition-all duration-200 ${
                        focusedField === 'customer' ? 'border-[#0a2b1d]' : 'border-gray-300'
                      }`}>
                        <div className="bg-gray-100 p-2 flex items-center border-r border-gray-300 text-[#0a2b1d]">
                          <User size={18} />
                        </div>
                        <input
                          type="text"
                          name="customer"
                          value={formData.customer}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('customer')}
                          onBlur={() => setTimeout(() => setFocusedField(null), 200)}
                          className="flex-1 p-2 outline-none text-[#0a2b1d] placeholder-gray-500"
                          placeholder="Enter customer name..."
                        />
                        {formData.customer && (
                          <button 
                            type="button" 
                            className="p-2 text-[#0a2b1d] hover:bg-gray-100"
                            onClick={() => setFormData({...formData, customer: ''})}
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                      
                      {showCustomerSuggestions && (
                        <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-md max-h-64 overflow-auto border border-gray-200 divide-y divide-gray-100">
                          {filteredCustomers.map((customer) => (
                            <div 
                              key={customer.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                              onClick={() => selectCustomer(customer)}
                            >
                              <div className="flex items-center p-1">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                                  <User size={24} className="text-gray-500" />
                                </div>
                                <div className="ml-3 flex-1">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-[#0a2b1d]">{customer.name}</span>
                                  </div>
                                  <div className="flex justify-between text-sm text-gray-600">
                                    <span>{customer.phone}</span>
                                    <span>Last order: {customer.lastOrder}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col md:flex-row w-full gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-[#0a2b1d] mb-1">Mobile Number</label>
                        <div className={`flex rounded overflow-hidden border transition-all duration-200 ${
                          focusedField === 'mobile' ? 'border-[#0a2b1d]' : 'border-gray-300'
                        }`}>
                          <div className="bg-gray-100 p-2 flex items-center border-r border-gray-300 text-[#0a2b1d]">
                            <Phone size={18} />
                          </div>
                          <input
                            type="text"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('mobile')}
                            onBlur={() => setFocusedField(null)}
                            className="flex-1 p-2 outline-none text-[#0a2b1d] placeholder-gray-500"
                            placeholder="Enter mobile number"
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-[#0a2b1d] mb-1">Delivery Location</label>
                        <div className={`flex rounded overflow-hidden border transition-all duration-200 ${
                          focusedField === 'location' ? 'border-[#0a2b1d]' : 'border-gray-300'
                        }`}>
                          <div className="bg-gray-100 p-2 flex items-center border-r border-gray-300 text-[#0a2b1d]">
                            <MapPin size={18} />
                          </div>
                          <select
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('location')}
                            onBlur={() => setFocusedField(null)}
                            className="flex-1 p-2 outline-none appearance-none text-[#0a2b1d]"
                          >
                            {locations.map(location => (
                              <option key={location.id} value={location.name}>{location.name}</option>
                            ))}
                          </select>
                          <div className="p-2 flex items-center text-[#0a2b1d] bg-gray-100 border-l border-gray-300">
                            <ChevronDown size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Location info */}
                    {selectedLocation && (
                      <div className="mt-3 flex justify-between items-center text-sm text-[#0a2b1d] px-3 py-2 bg-gray-100 rounded border border-gray-200">
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2 text-[#0a2b1d]" /> 
                          <span>Est. delivery: {selectedLocation.deliveryTime}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2 text-[#0a2b1d]" /> 
                          <span>Distance: {selectedLocation.distance}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Step 2: Products Section */}
            <div className={`${activeTab === 'products' ? 'block' : 'hidden'}`}>
              <Card className="bg-white shadow-sm border-gray-200">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-[#0a2b1d] to-[#104732] text-white p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-white bg-opacity-20 p-1.5 rounded-md">
                          <Package size={18} className="text-white" />
                        </div>
                        <h3 className="font-medium">Product Selection</h3>
                      </div>
                      {selectedProducts.length > 0 && (
                        <div className="flex items-center bg-white text-[#00FF80] px-2 py-1 rounded-full shadow-sm text-xs">
                          <CheckCircle size={12} className="mr-1" />
                          {selectedProducts.length} items selected
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {/* Products grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Chicken Products */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-[#0a2b1d] mb-1">Chicken</label>
                        <div className={`flex rounded overflow-hidden border transition-all duration-200 ${
                          focusedField === 'chicken' || showProductSuggestions === 'chicken' ? 'border-[#0a2b1d]' : 'border-gray-300'
                        }`}>
                          <input
                            type="text"
                            name="chicken"
                            value={formData.chicken}
                            onChange={handleInputChange}
                            onFocus={() => {
                              setFocusedField('chicken');
                              setShowProductSuggestions('chicken');
                            }}
                            className="flex-1 p-2 outline-none text-[#0a2b1d] placeholder-gray-500"
                            placeholder="Select chicken products"
                          />
                          <div className="p-2 flex items-center text-[#0a2b1d] cursor-pointer border-l border-gray-300 bg-gray-100"
                            onClick={() => setShowProductSuggestions(prev => prev === 'chicken' ? false : 'chicken')}>
                            <Search size={16} />
                          </div>
                        </div>
                        
                        {/* Product suggestions */}
                        {showProductSuggestions === 'chicken' && (
                          <div className="absolute z-20 mt-1 w-full bg-white rounded shadow-md max-h-64 overflow-auto border border-gray-200">
                            {productCatalog.chicken.map((product) => (
                              <div 
                                key={product.id}
                                className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                                onClick={() => addProduct(product, 'chicken')}
                              >
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                                    <Package size={16} className="text-gray-500" />
                                  </div>
                                  <div className="ml-2 flex-1">
                                    <div className="font-medium text-[#0a2b1d] text-sm">{product.name}</div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">{product.description}</span>
                                      <span className="font-medium text-[#0a2b1d]">₹{product.price}/{product.unit}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Beef Products */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-[#0a2b1d] mb-1">Beef</label>
                        <div className={`flex rounded overflow-hidden border transition-all duration-200 ${
                          focusedField === 'beef' || showProductSuggestions === 'beef' ? 'border-[#0a2b1d]' : 'border-gray-300'
                        }`}>
                          <input
                            type="text"
                            name="beef"
                            value={formData.beef}
                            onChange={handleInputChange}
                            onFocus={() => {
                              setFocusedField('beef');
                              setShowProductSuggestions('beef');
                            }}
                            className="flex-1 p-2 outline-none text-[#0a2b1d] placeholder-gray-500"
                            placeholder="Select beef products"
                          />
                          <div className="p-2 flex items-center text-[#0a2b1d] cursor-pointer border-l border-gray-300 bg-gray-100"
                            onClick={() => setShowProductSuggestions(prev => prev === 'beef' ? false : 'beef')}>
                            <Search size={16} />
                          </div>
                        </div>
                        
                        {/* Product suggestions */}
                        {showProductSuggestions === 'beef' && (
                          <div className="absolute z-20 mt-1 w-full bg-white rounded shadow-md max-h-64 overflow-auto border border-gray-200">
                            {productCatalog.beef.map((product) => (
                              <div 
                                key={product.id}
                                className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                                onClick={() => addProduct(product, 'beef')}
                              >
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                                    <Package size={16} className="text-gray-500" />
                                  </div>
                                  <div className="ml-2 flex-1">
                                    <div className="font-medium text-[#0a2b1d] text-sm">{product.name}</div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">{product.description}</span>
                                      <span className="font-medium text-[#0a2b1d]">₹{product.price}/{product.unit}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Pork Products */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-[#0a2b1d] mb-1">Pork</label>
                        <div className={`flex rounded overflow-hidden border transition-all duration-200 ${
                          focusedField === 'pork' || showProductSuggestions === 'pork' ? 'border-[#0a2b1d]' : 'border-gray-300'
                        }`}>
                          <input
                            type="text"
                            name="pork"
                            value={formData.pork}
                            onChange={handleInputChange}
                            onFocus={() => {
                              setFocusedField('pork');
                              setShowProductSuggestions('pork');
                            }}
                            className="flex-1 p-2 outline-none text-[#0a2b1d] placeholder-gray-500"
                            placeholder="Select pork products"
                          />
                          <div className="p-2 flex items-center text-[#0a2b1d] cursor-pointer border-l border-gray-300 bg-gray-100"
                            onClick={() => setShowProductSuggestions(prev => prev === 'pork' ? false : 'pork')}>
                            <Search size={16} />
                          </div>
                        </div>
                        
                        {/* Product suggestions */}
                        {showProductSuggestions === 'pork' && (
                          <div className="absolute z-20 mt-1 w-full bg-white rounded shadow-md max-h-64 overflow-auto border border-gray-200">
                            {productCatalog.pork.map((product) => (
                              <div 
                                key={product.id}
                                className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                                onClick={() => addProduct(product, 'pork')}
                              >
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                                    <Package size={16} className="text-gray-500" />
                                  </div>
                                  <div className="ml-2 flex-1">
                                    <div className="font-medium text-[#0a2b1d] text-sm">{product.name}</div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">{product.description}</span>
                                      <span className="font-medium text-[#0a2b1d]">₹{product.price}/{product.unit}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Fish Products */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-[#0a2b1d] mb-1">Fish</label>
                        <div className={`flex rounded overflow-hidden border transition-all duration-200 ${
                          focusedField === 'fish' || showProductSuggestions === 'fish' ? 'border-[#0a2b1d]' : 'border-gray-300'
                        }`}>
                          <input
                            type="text"
                            name="fish"
                            value={formData.fish}
                            onChange={handleInputChange}
                            onFocus={() => {
                              setFocusedField('fish');
                              setShowProductSuggestions('fish');
                            }}
                            className="flex-1 p-2 outline-none text-[#0a2b1d] placeholder-gray-500"
                            placeholder="Select fish products"
                          />
                          <div className="p-2 flex items-center text-[#0a2b1d] cursor-pointer border-l border-gray-300 bg-gray-100"
                            onClick={() => setShowProductSuggestions(prev => prev === 'fish' ? false : 'fish')}>
                            <Search size={16} />
                          </div>
                        </div>
                        
                        {/* Product suggestions */}
                        {showProductSuggestions === 'fish' && (
                          <div className="absolute z-20 mt-1 w-full bg-white rounded shadow-md max-h-64 overflow-auto border border-gray-200">
                            {productCatalog.fish.map((product) => (
                              <div 
                                key={product.id}
                                className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                                onClick={() => addProduct(product, 'fish')}
                              >
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                                    <Package size={16} className="text-gray-500" />
                                  </div>
                                  <div className="ml-2 flex-1">
                                    <div className="font-medium text-[#0a2b1d] text-sm">{product.name}</div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">{product.description}</span>
                                      <span className="font-medium text-[#0a2b1d]">₹{product.price}/{product.unit}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Goat Products */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-[#0a2b1d] mb-1">Goat</label>
                        <div className={`flex rounded overflow-hidden border transition-all duration-200 ${
                          focusedField === 'goat' || showProductSuggestions === 'goat' ? 'border-[#0a2b1d]' : 'border-gray-300'
                        }`}>
                          <input
                            type="text"
                            name="goat"
                            value={formData.goat}
                            onChange={handleInputChange}
                            onFocus={() => {
                              setFocusedField('goat');
                              setShowProductSuggestions('goat');
                            }}
                            className="flex-1 p-2 outline-none text-[#0a2b1d] placeholder-gray-500"
                            placeholder="Select goat products"
                          />
                          <div className="p-2 flex items-center text-[#0a2b1d] cursor-pointer border-l border-gray-300 bg-gray-100"
                            onClick={() => setShowProductSuggestions(prev => prev === 'goat' ? false : 'goat')}>
                            <Search size={16} />
                          </div>
                        </div>
                        
                        {/* Product suggestions */}
                        {showProductSuggestions === 'goat' && (
                          <div className="absolute z-20 mt-1 w-full bg-white rounded shadow-md max-h-64 overflow-auto border border-gray-200">
                            {productCatalog.goat.map((product) => (
                              <div 
                                key={product.id}
                                className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                                onClick={() => addProduct(product, 'goat')}
                              >
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                                    <Package size={16} className="text-gray-500" />
                                  </div>
                                  <div className="ml-2 flex-1">
                                    <div className="font-medium text-[#0a2b1d] text-sm">{product.name}</div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">{product.description}</span>
                                      <span className="font-medium text-[#0a2b1d]">₹{product.price}/{product.unit}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Additional Items */}
                      <div>
                        <label className="block text-sm font-medium text-[#0a2b1d] mb-1">Additional Items</label>
                        <div className={`flex rounded overflow-hidden border transition-all duration-200 ${
                          focusedField === 'items' ? 'border-[#0a2b1d]' : 'border-gray-300'
                        }`}>
                          <input
                            type="text"
                            name="items"
                            value={formData.items}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('items')}
                            onBlur={() => setFocusedField(null)}
                            className="flex-1 p-2 outline-none text-[#0a2b1d] placeholder-gray-500"
                            placeholder="Any other items"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Selected Products List */}
                    {selectedProducts.length > 0 && (
                      <div className="mt-3">
                        <h3 className="text-sm font-medium text-[#0a2b1d] mb-1">Selected Products</h3>
                        <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden">
                          <div className="divide-y divide-gray-200">
                            {selectedProducts.map((product) => (
                              <div key={product.id} className="p-2 flex items-center">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                                  <Package size={16} className="text-gray-500" />
                                </div>
                                <div className="ml-2 flex-1">
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium text-[#0a2b1d]">{product.name}</span>
                                    <span className="text-sm font-medium text-[#0a2b1d]">₹{product.price * product.quantity}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center border border-gray-300 rounded bg-white">
                                      <button 
                                        type="button"
                                        className="p-1 text-[#0a2b1d] hover:bg-gray-100"
                                        onClick={() => updateProductQuantity(product.id, -1)}
                                      >
                                        <Minus size={12} />
                                      </button>
                                      <span className="px-2 text-xs text-[#0a2b1d]">{product.quantity}</span>
                                      <button 
                                        type="button"
                                        className="p-1 text-[#0a2b1d] hover:bg-gray-100"
                                        onClick={() => updateProductQuantity(product.id, 1)}
                                      >
                                        <Plus size={12} />
                                      </button>
                                    </div>
                                    <button 
                                      type="button"
                                      className="p-1 text-[#0a2b1d] hover:bg-gray-100 rounded"
                                      onClick={() => removeProduct(product.id)}
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Delivery Charge */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-[#0a2b1d] mb-1">Delivery Charge</label>
                      <div className={`flex rounded overflow-hidden border transition-all duration-200 ${
                        focusedField === 'deliveryCharge' ? 'border-[#0a2b1d]' : 'border-gray-300'
                      }`}>
                        <div className="bg-gray-100 p-2 flex items-center border-r border-gray-300 text-[#0a2b1d]">₹</div>
                        <input
                          type="text"
                          name="deliveryCharge"
                          value={formData.deliveryCharge}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('deliveryCharge')}
                          onBlur={() => setFocusedField(null)}
                          className="flex-1 p-2 outline-none text-[#0a2b1d] placeholder-gray-500"
                          placeholder="Delivery charge"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Step 3: Delivery Details */}
            <div className={`${activeTab === 'delivery' ? 'block' : 'hidden'}`}>
              <Card className="bg-white shadow-sm border-gray-200">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-[#0a2b1d] to-[#104732] text-white p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-white bg-opacity-20 p-1.5 rounded-md">
                          <Truck size={18} className="text-white" />
                        </div>
                        <h3 className="font-medium">Delivery & Payment</h3>
                      </div>
                      {formData.deliveryBy && (
                        <div className="flex items-center bg-white text-[#00FF80] px-2 py-1 rounded-full shadow-sm text-xs">
                          <CheckCircle size={12} className="mr-1" />
                          Delivery Ready
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {/* Delivery Person Selection */}
                    <div>
                      <label className="block text-sm font-medium text-[#0a2b1d] mb-1">Delivery Executive</label>
                      <div className={`rounded overflow-hidden border transition-all duration-200 ${
                        focusedField === 'deliveryBy' ? 'border-[#0a2b1d]' : 'border-gray-300'
                      }`}>
                        <select
                          name="deliveryBy"
                          value={formData.deliveryBy}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('deliveryBy')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full p-2 outline-none appearance-none text-[#0a2b1d]"
                        >
                          <option value="">SELECT DELIVERY EXECUTIVE</option>
                          {deliveryPersonnel.map(person => (
                            <option key={person.id} value={person.name}>{person.name} - ⭐ {person.rating}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Delivery Executive Cards */}
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {deliveryPersonnel.slice(0, 4).map(person => (
                        <div 
                          key={person.id}
                          className={`border rounded p-2 cursor-pointer transition-all duration-200 ${
                            formData.deliveryBy === person.name 
                              ? 'border-[#0a2b1d] bg-gray-100' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData({...formData, deliveryBy: person.name})}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                              <User size={16} className="text-gray-500" />
                            </div>
                            <div className="ml-2 flex-1">
                              <div className="flex justify-between">
                                <span className="font-medium text-[#0a2b1d]">{person.name}</span>
                                <span className={`text-xs px-1 py-0.5 rounded text-[#0a2b1d] ${
                                  person.status === 'Available' 
                                    ? 'bg-gray-100' 
                                    : 'bg-gray-200'
                                }`}>
                                  {person.status}
                                </span>
                              </div>
                              <div className="flex items-center mt-0.5">
                                <div className="flex items-center">
                                  <Star size={12} className="text-[#0a2b1d]" />
                                  <span className="text-xs ml-0.5 text-[#0a2b1d]">{person.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Order Details */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-[#0a2b1d] mb-1">Order Notes</label>
                      <div className={`rounded overflow-hidden border transition-all duration-200 ${
                        focusedField === 'orderDetails' ? 'border-[#0a2b1d]' : 'border-gray-300'
                      }`}>
                        <textarea
                          name="orderDetails"
                          value={formData.orderDetails}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('orderDetails')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full p-2 outline-none min-h-24 text-[#0a2b1d] placeholder-gray-500"
                          placeholder="Add any special instructions for the order..."
                        />
                      </div>
                    </div>
                    
                    {/* Payment Status */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-[#0a2b1d] mb-1">Payment Status</label>
                      <div className={`rounded overflow-hidden border transition-all duration-200 ${
                        focusedField === 'paymentStatus' ? 'border-[#0a2b1d]' : 'border-gray-300'
                      }`}>
                        <select
                          name="paymentStatus"
                          value={formData.paymentStatus}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('paymentStatus')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full p-2 outline-none appearance-none text-[#0a2b1d]"
                        >
                          <option value="Not paid">Not paid</option>
                          <option value="Paid">Paid</option>
                          <option value="Paid account eco homeshop">Paid account eco homeshop</option>
                          <option value="Paid cash">Paid cash</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Order Status */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-[#0a2b1d] mb-1">Order Status</label>
                      <div className={`rounded overflow-hidden border transition-all duration-200 ${
                        focusedField === 'orderStatus' ? 'border-[#0a2b1d]' : 'border-gray-300'
                      }`}>
                        <select
                          name="orderStatus"
                          value={formData.orderStatus}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('orderStatus')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full p-2 outline-none appearance-none text-[#0a2b1d]"
                        >
                          <option value="New Order">New Order</option>
                          <option value="Hold">Hold</option>
                          <option value="Pending payment">Pending payment</option>
                          <option value="Processing">Processing</option>
                          <option value="Out for delivery">Out for delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Navigation and Submit */}
            <div className="mt-4 flex justify-between">
              {activeTab === 'details' ? (
                <button 
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`px-4 py-2 ${theme.highlightColor} text-[#0a2b1d] rounded font-medium flex items-center justify-center hover:opacity-90 transition-opacity duration-200 w-full shadow-sm`}
                >
                  Continue to Products <ChevronRight size={16} className="ml-1" />
                </button>
              ) : activeTab === 'products' ? (
                <div className="flex w-full gap-2">
                  <button 
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className="px-4 py-2 bg-gray-200 text-[#0a2b1d] rounded font-medium flex items-center justify-center hover:bg-gray-300 transition-colors duration-200 flex-1"
                  >
                    Back
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveTab('delivery')}
                    className={`px-4 py-2 ${theme.productColor} text-[#0a2b1d] rounded font-medium flex items-center justify-center hover:opacity-90 transition-opacity duration-200 flex-1 shadow-sm`}
                  >
                    Continue to Delivery <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              ) : (
                <div className="flex w-full gap-2">
                  <button 
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="px-4 py-2 bg-gray-200 text-[#0a2b1d] rounded font-medium flex items-center justify-center hover:bg-gray-300 transition-colors duration-200 flex-1"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded font-medium flex items-center justify-center transition-all duration-200 flex-1 ${
                      isSubmitting 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : `${theme.productColor} text-[#0a2b1d] hover:opacity-90 shadow-sm`
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0a2b1d]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <CheckCircle size={18} className="mr-2" />
                        Place Order
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
        
        {/* Order Summary - 1/3 width on desktop */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4">
            <div onClick={() => setOrderSummaryOpen(!orderSummaryOpen)} 
              className={`${theme.secondary} px-4 py-3 text-white font-medium flex justify-between items-center cursor-pointer rounded-t-lg`}>
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-1.5 rounded-md mr-2">
                  <FileText size={18} className="text-white" />
                </div>
                Order Summary
              </div>
              <div className="flex items-center">
                {orderSummaryOpen ? (
                  <ChevronDown size={18} />
                ) : (
                  <div className="flex items-center bg-white text-[#00FF80] px-2 py-1 rounded-full text-sm shadow-sm font-medium">
                    <DollarSign size={14} className="mr-1" />
                    ₹{formData.billAmount || '0'}
                  </div>
                )}
              </div>
            </div>
            
            {orderSummaryOpen && (
              <div className="p-4">
                {selectedProducts.length > 0 ? (
                  <>
                    {/* Products in cart */}
                    <div className="divide-y divide-gray-100">
                      {selectedProducts.map((product) => (
                        <div key={product.id} className="py-2 flex justify-between items-center">
                          <div className="flex items-center flex-1">
                            <div className="font-medium text-sm text-[#0a2b1d]">{product.name}</div>
                            <div className="text-xs text-gray-600 ml-1">x{product.quantity}</div>
                          </div>
                          <div className="text-sm font-medium text-[#0a2b1d]">₹{product.price * product.quantity}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Order subtotal */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#0a2b1d]">Subtotal</span>
                        <span className="font-medium text-[#0a2b1d]">
                          ₹{selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-[#0a2b1d]">Delivery Fee</span>
                        <span className="font-medium text-[#0a2b1d]">₹{formData.deliveryCharge || '0'}</span>
                      </div>
                      
                      {/* Total */}
                      <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                        <span className="font-bold text-[#0a2b1d]">Total</span>
                        <span className="font-bold text-lg text-[#0a2b1d]">₹{formData.billAmount || '0'}</span>
                      </div>
                    </div>
                    
                    {/* Customer and Delivery Info */}
                    {formData.customer && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="text-sm font-medium text-[#0a2b1d] mb-2">Order Information</div>
                        
                        <div className="text-sm flex">
                          <User size={14} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium text-[#0a2b1d]">{formData.customer}</div>
                            <div className="text-[#0a2b1d]">{formData.mobile}</div>
                          </div>
                        </div>
                        
                        {formData.location && (
                          <div className="text-sm flex mt-2">
                            <MapPin size={14} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-[#0a2b1d]">{formData.location}</div>
                              <div className="text-[#0a2b1d]">{selectedLocation.deliveryTime} estimated delivery</div>
                            </div>
                          </div>
                        )}
                        
                        {formData.deliveryBy && (
                          <div className="text-sm flex mt-2">
                            <Truck size={14} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-[#0a2b1d]">Delivery by {formData.deliveryBy}</div>
                              <div className="text-[#0a2b1d]">
                                {deliveryPersonnel.find(p => p.name === formData.deliveryBy)?.status || 'Available'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <div className="text-gray-400 mb-2">
                      <ShoppingCart size={40} className="mx-auto" />
                    </div>
                    <p className="text-[#0a2b1d]">Your cart is empty</p>
                    <p className="text-gray-600 text-sm mt-1">Add products to see the summary</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Success Message - Premium Popup */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-5 max-w-md w-full mx-4 transition-all duration-300 border-l-4 border-[#00FF80]">
            <div className="flex items-center mb-4">
              <div className="bg-[#00FF80]/10 p-2 rounded-full mr-3">
                <CheckCircle size={28} className="text-[#00FF80]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0a2b1d]">Order Confirmed</h3>
              <div className="ml-auto text-gray-400 cursor-pointer hover:text-[#0a2b1d]" onClick={() => setShowSuccess(false)}>
                <X size={20} />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="bg-[#00FF80]/10 rounded-lg p-3 mb-3 border border-[#00FF80]/20">
                <div className="flex items-center">
                  <Clipboard size={16} className="text-[#00FF80] mr-2" />
                  <div className="text-sm font-medium text-[#0a2b1d]">Order ID: <span className="font-bold">A38686</span></div>
                </div>
              </div>
              
              <p className="text-[#0a2b1d] mb-3">
                Thank you for your order. Your items are being prepared for delivery.
              </p>
              
              <div className="border-t border-b border-gray-200 py-3 my-3">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600 text-sm">Items Total:</span>
                  <span className="text-[#0a2b1d] font-medium">₹{formData.billAmount ? parseInt(formData.billAmount) - parseInt(formData.deliveryCharge) : 0}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600 text-sm">Delivery Fee:</span>
                  <span className="text-[#0a2b1d] font-medium">₹{formData.deliveryCharge}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-[#0a2b1d]">Total:</span>
                  <span className="text-[#00FF80]">₹{formData.billAmount || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Clock size={14} className="mr-2" />
                <span>Estimated delivery: {selectedLocation.deliveryTime}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Truck size={14} className="mr-2" />
                <span>Delivery by: {formData.deliveryBy}</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setShowSuccess(false);
                // Reset form and redirect back to order list
                navigateTo(Views.ORDERS_LIST);
              }}
              className="w-full bg-[#00FF80] text-[#0a2b1d] py-2.5 px-4 rounded-lg hover:opacity-90 shadow-sm font-medium"
            >
              Back to Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;