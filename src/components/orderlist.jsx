'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingBag,
  Filter,
  PlusCircle,
  ChevronRight,
  Clock,
  CheckCircle,
  X,
  Truck,
  RefreshCcw,
  Calendar,
  ArrowUpDown,
  MapPin,
  Menu,
  CircleDollarSign,
  ChevronDown,
  MoreHorizontal,
  Sparkles
} from "lucide-react";
import { useAppStore, Views } from '../store/app.store';
import axios from 'axios';

// Custom Rupee Icon component
const RupeeIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 3h12"></path>
    <path d="M6 8h12"></path>
    <path d="M6 13l8.5 8"></path>
    <path d="M6 13h3"></path>
    <path d="M9 13c6.667 0 6.667-10 0-10"></path>
  </svg>
);

const OrdersList = () => {
  const { 
    orderFilters, 
    setSearchTerm, 
    setStatusFilter, 
    setStaffFilter,
    navigateTo,
    viewOrder,
    createNewOrder
  } = useAppStore();
  
  const { searchTerm, statusFilter, staffFilter } = orderFilters;
  
  // Refs for dropdowns
  const sortMenuRef = useRef(null);
  
  // State for orders data
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('today'); // 'today' or 'all'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'amount_high', 'amount_low', 'location'
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFiltersOnMobile, setShowFiltersOnMobile] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    new: 0,
    '4': 0, // Processing
    '5': 0, // Out for Delivery
    delivered: 0,
    cancelled: 0
  });
  const [animateRefresh, setAnimateRefresh] = useState(false);

  // Handle clicks outside dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sortMenuRef]);

  // Fetch orders from API
  const fetchOrders = async (mode = 'today') => {
    setLoading(true);
    setError(null);
    setAnimateRefresh(true);
    
    try {
      const endpoint = mode === 'today' 
        ? 'https://ecopeedika.com/api/orders/today' 
        : 'https://ecopeedika.com/api/allorders';
      
      const response = await axios.get(endpoint);
      
      if (response.data.status && response.data.data) {
        setOrders(response.data.data);
        // Calculate status counts
        const counts = {
          all: response.data.data.length,
          new: response.data.data.filter(order => String(order.order_status) === '1').length,
          '4': response.data.data.filter(order => String(order.order_status) === '4').length,
          '5': response.data.data.filter(order => String(order.order_status) === '5').length,
          delivered: response.data.data.filter(order => String(order.order_status) === '6').length,
          cancelled: response.data.data.filter(order => String(order.order_status) === '7').length
        };
        setStatusCounts(counts);
      } else {
        setError("Failed to fetch orders data");
      }
    } catch (err) {
      setError("Error connecting to the server");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
      setTimeout(() => setAnimateRefresh(false), 800);
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders(viewMode);
  }, [viewMode]);

  // Map order status to readable text and badge style
  const getStatusBadge = (status) => {
    switch(String(status)) {
      case '1':
        return <Badge className="bg-blue-100 text-blue-600 border-blue-200">New Order</Badge>;
      case '2':
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Hold</Badge>;
      case '3':
        return <Badge className="bg-yellow-100 text-yellow-600 border-yellow-200">Pending Payment</Badge>;
      case '4':
        return <Badge className="bg-purple-100 text-purple-600 border-purple-200">Processing</Badge>;
      case '5':
        return <Badge className="bg-orange-100 text-orange-600 border-orange-200">Out for Delivery</Badge>;
      case '6':
        return <Badge className="bg-green-100 text-green-600 border-green-200">Delivered</Badge>;
      case '7':
        return <Badge className="bg-red-100 text-red-600 border-red-200">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Unknown</Badge>;
    }
  };

  // Map payment status to readable text and badge style
  const getPaymentBadge = (status) => {
    switch(String(status)) {
      case '1':
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Not Set</Badge>;
      case '2':
        return <Badge className="bg-yellow-100 text-yellow-600 border-yellow-200">Partial</Badge>;
      case '3':
        return <Badge className="bg-yellow-100 text-yellow-600 border-yellow-200">Pending</Badge>;
      case '4':
        return <Badge className="bg-green-100 text-green-600 border-green-200">Paid</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Unknown</Badge>;
    }
  };

  // Format timestamp to date and time
  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp * 1000);
    return {
      date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  // Extract order items from invoice_details
  const getOrderItems = (invoice_details) => {
    if (!invoice_details || !Array.isArray(invoice_details)) return [];
    
    return invoice_details.map(item => ({
      id: item.id,
      name: item.value,
      product: item.product?.name || 'Unknown Product'
    }));
  };

  // Filter orders based on search, status, and staff
  const filteredOrders = orders.filter(order => {
    // Base search filter
    const baseSearchMatch = !searchTerm || 
      order.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Location search filter
    const locationMatch = !locationSearch || 
      order.location?.toLowerCase().includes(locationSearch.toLowerCase());
    
    // Item search filter
    const orderItems = getOrderItems(order.invoice_details);
    const itemMatch = !itemSearch || orderItems.some(item => 
      item.name.toLowerCase().includes(itemSearch.toLowerCase()) || 
      item.product.toLowerCase().includes(itemSearch.toLowerCase())
    );
    
    // Status filter - statusFilter is a string like 'new', '1', etc.
    // We need to map it to the numeric values used in the API
    let mappedStatusFilter = statusFilter;
    if (statusFilter === 'new') mappedStatusFilter = '1';
    if (statusFilter === 'ready') mappedStatusFilter = '5';
    if (statusFilter === 'delivered') mappedStatusFilter = '6';
    if (statusFilter === 'cancelled') mappedStatusFilter = '7';
    
    const statusMatch = statusFilter === 'all' || 
      String(order.order_status) === String(mappedStatusFilter);
    
    // Staff filter - staffFilter is a string like 'praveen', etc.
    const deliveryPerson = order.deliver_by !== '0' ? order.deliver_by : '';
    const staffMatch = staffFilter === 'all' || 
      (deliveryPerson && deliveryPerson.toLowerCase() === staffFilter.toLowerCase());
    
    return baseSearchMatch && locationMatch && itemMatch && statusMatch && staffMatch;
  });

  // Sort filtered orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch(sortBy) {
      case 'newest':
        return (b.order_time || 0) - (a.order_time || 0);
      case 'oldest':
        return (a.order_time || 0) - (b.order_time || 0);
      case 'amount_high':
        return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      case 'amount_low':
        return (Number(a.amount) || 0) - (Number(b.amount) || 0);
      case 'location':
        return (a.location || '').localeCompare(b.location || '');
      default:
        return (b.order_time || 0) - (a.order_time || 0);
    }
  });

  // Sort options
  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Amount (High to Low)', value: 'amount_high' },
    { label: 'Amount (Low to High)', value: 'amount_low' },
    { label: 'Location (A-Z)', value: 'location' }
  ];

  // Get sort label from value
  const getSortLabel = (value) => {
    const option = sortOptions.find(opt => opt.value === value);
    return option ? option.label : 'Sort';
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setLocationSearch('');
    setItemSearch('');
    setStatusFilter('all');
    setStaffFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="pb-20 main-content">
      <Card className="bg-white shadow-lg border-none rounded-lg overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0a2b1d] to-[#104732] text-white p-4 sticky top-0 z-20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#00FF80]" />
                <h3 className="font-medium">All Orders</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white/20 hover:text-white"
                  onClick={() => {
                    setViewMode(viewMode === 'today' ? 'all' : 'today');
                  }}
                >
                  {viewMode === 'today' ? (
                    <><Calendar size={14} className="mr-1" /> Today</>
                  ) : (
                    <><Calendar size={14} className="mr-1" /> All Time</>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  className="bg-[#00FF80] hover:bg-[#00cc66] text-[#0a2b1d]"
                  onClick={() => createNewOrder()}
                >
                  <PlusCircle size={16} className="mr-1" />
                  <span className="hidden sm:inline">New Order</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Search and Action Buttons */}
          <div className="p-4 border-b border-gray-100 bg-white sticky top-14 z-10 shadow-sm">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search by ID, customer..." 
                  className="pl-10 bg-gray-50 border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {/* FIXED SORT DROPDOWN COMPONENT */}
                <div className="relative" ref={sortMenuRef}>
                  <Button 
                    variant="outline" 
                    size="default"
                    className="border-gray-200 text-gray-700 flex items-center gap-1"
                    onClick={() => setShowSortMenu(!showSortMenu)}
                  >
                    <ArrowUpDown size={14} className="text-gray-500" />
                    <span className="text-sm hidden md:inline">{getSortLabel(sortBy)}</span>
                    <span className="text-sm md:hidden">Sort</span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </Button>
                  
                  {/* Sort Menu - Fixed for mobile */}
                  {showSortMenu && (
                    <div className="fixed md:absolute top-1/4 left-1/2 md:left-auto transform -translate-x-1/2 md:translate-x-0 md:top-full md:right-0 mt-1 w-4/5 md:w-48 max-w-xs bg-white shadow-xl rounded-lg z-50 border border-gray-100 overflow-hidden">
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                          <h3 className="text-sm font-medium text-gray-700">Sort Orders</h3>
                          <button 
                            className="text-gray-500 hover:text-gray-700 md:hidden"
                            onClick={() => setShowSortMenu(false)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                        {sortOptions.map(option => (
                          <button
                            key={option.value}
                            className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-50 flex items-center justify-between transition-colors ${
                              sortBy === option.value ? 'text-[#00cc66] bg-gray-50/80' : 'text-gray-700'
                            }`}
                            onClick={() => {
                              setSortBy(option.value);
                              setShowSortMenu(false);
                            }}
                          >
                            {option.label}
                            {sortBy === option.value && <CheckCircle size={16} className="text-[#00cc66]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  className={`border-gray-200 relative ${animateRefresh ? 'animate-spin text-[#00cc66]' : ''}`}
                  onClick={() => fetchOrders(viewMode)}
                  title="Refresh"
                  disabled={animateRefresh}
                >
                  <RefreshCcw size={18} />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  className={`border-gray-200 ${showFiltersOnMobile || advancedSearch ? 'bg-gray-100 text-[#104732]' : ''}`}
                  title="Filter"
                  onClick={() => {
                    setShowFiltersOnMobile(!showFiltersOnMobile);
                    setAdvancedSearch(!advancedSearch);
                  }}
                >
                  <Filter size={18} />
                </Button>
              </div>
            </div>
            
            {/* Advanced Search (shown when advanced search is enabled) */}
            {advancedSearch && (
              <div className="mt-3 flex flex-col md:flex-row gap-3 animate-fadeDown">
                <div className="relative flex-grow">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    placeholder="Filter by location..." 
                    className="pl-10 bg-gray-50 border-gray-200"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                  />
                </div>
                <div className="relative flex-grow">
                  <ShoppingBag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    placeholder="Filter by item..." 
                    className="pl-10 bg-gray-50 border-gray-200"
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                  />
                </div>
                <Button 
                  variant="ghost" 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
          
          {/* Mobile filters toggle */}
          <div className="md:hidden">
            {showFiltersOnMobile && (
              <div className="p-4 border-b border-gray-100 bg-gray-50 animate-fadeDown">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-500 mb-1">Status</label>
                    <select 
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white shadow-sm"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Orders</option>
                      <option value="new">New</option>
                      <option value="4">Processing</option>
                      <option value="5">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-500 mb-1">Staff</label>
                    <select 
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white shadow-sm"
                      value={staffFilter}
                      onChange={(e) => setStaffFilter(e.target.value)}
                    >
                      <option value="all">All Staff</option>
                      <option value="praveen">Praveen</option>
                      <option value="milan">Milan</option>
                      <option value="joseph">Joseph</option>
                      <option value="franko">Franko</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Status filter tabs (hidden on small screens) */}
          <div className="hidden md:flex overflow-x-auto hide-scrollbar border-b border-gray-100 bg-gray-50 shadow-inner">
            <StatusTab 
              label="All Orders" 
              value="all"
              count={statusCounts.all}
            />
            <StatusTab 
              label="New" 
              value="new"
              count={statusCounts.new}
            />
            <StatusTab 
              label="Processing" 
              value="4"
              count={statusCounts['4']}
            />
            <StatusTab 
              label="Out for Delivery" 
              value="5"
              count={statusCounts['5']}
            />
            <StatusTab 
              label="Delivered" 
              value="delivered"
              count={statusCounts.delivered}
            />
            <StatusTab 
              label="Cancelled" 
              value="cancelled"
              count={statusCounts.cancelled}
            />
          </div>
          
          {/* Staff filter tabs (hidden on small screens) */}
          <div className="hidden md:flex overflow-x-auto hide-scrollbar border-b border-gray-100 px-2 py-2">
            <StaffTab 
              label="All Staff" 
              value="all"
            />
            <StaffTab 
              label="Praveen" 
              value="praveen"
            />
            <StaffTab 
              label="Milan" 
              value="milan"
            />
            <StaffTab 
              label="Joseph" 
              value="joseph"
            />
            <StaffTab 
              label="Franko" 
              value="franko"
            />
          </div>
          
          {/* Mobile View Status Quick Filters - FIXED to ensure badges stay within container */}
          <div className="md:hidden flex overflow-x-auto hide-scrollbar px-2 py-2 bg-gray-50 border-b border-gray-100">
            <QuickFilterTab 
              label="All" 
              value="all"
              count={statusCounts.all}
              color="#104732"
            />
            <QuickFilterTab 
              label="New" 
              value="new"
              count={statusCounts.new}
              color="#2563eb"
            />
            <QuickFilterTab 
              label="Processing" 
              value="4"
              count={statusCounts['4']}
              color="#7c3aed"
            />
            <QuickFilterTab 
              label="Delivering" 
              value="5"
              count={statusCounts['5']}
              color="#d97706"
            />
            <QuickFilterTab 
              label="Delivered" 
              value="delivered"
              count={statusCounts.delivered}
              color="#059669"
            />
            <QuickFilterTab 
              label="Cancelled" 
              value="cancelled"
              count={statusCounts.cancelled}
              color="#dc2626"
            />
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="p-10 text-center text-gray-500">
              <div className={`mx-auto mb-5 text-[#00FF80] ${animateRefresh ? 'animate-spin' : 'animate-pulse'}`}>
                <RefreshCcw size={48} />
              </div>
              <p className="font-medium">Loading orders...</p>
              <p className="text-sm text-gray-400 mt-1">This might take a moment</p>
            </div>
          )}
          
          {/* Error State */}
          {!loading && error && (
            <div className="p-8 text-center text-red-500">
              <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <X size={40} className="text-red-500" />
              </div>
              <p className="font-medium">{error}</p>
              <Button 
                className="mt-4 bg-[#00FF80] hover:bg-[#00cc66] text-[#0a2b1d]"
                onClick={() => fetchOrders(viewMode)}
              >
                <RefreshCcw size={16} className="mr-1" />
                Try Again
              </Button>
            </div>
          )}
          
          {/* Empty State */}
          {!loading && !error && sortedOrders.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={40} className="text-gray-300" />
              </div>
              <p className="font-medium">No orders found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              {(searchTerm || locationSearch || itemSearch || statusFilter !== 'all' || staffFilter !== 'all') && (
                <Button 
                  className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700"
                  onClick={clearFilters}
                >
                  <X size={16} className="mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}
          
          {/* Orders List - Card Based Layout for Mobile */}
          {!loading && !error && sortedOrders.length > 0 && (
            <>
              <div className="p-2 md:p-0 bg-gray-50 md:bg-white">
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {/* Mobile card layout */}
                  {sortedOrders
                    .slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage)
                    .map((order) => {
                      const { date, time } = formatDateTime(order.order_time);
                      const orderItems = getOrderItems(order.invoice_details);
                      
                      return (
                        <div 
                          key={order.id}
                          onClick={() => viewOrder(order.order_id)}
                          className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 active:bg-gray-50 transition-all duration-150 cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-[#104732] truncate max-w-[160px]">{order.customer}</h4>
                                <Badge className="bg-[#0a2b1d]/10 text-[#104732] border-none">
                                  {order.order_id}
                                </Badge>
                              </div>
                              
                              <div className="mt-1 flex items-center text-xs text-gray-500">
                                <Clock size={12} className="mr-1" />
                                {date} • {time}
                              </div>
                              
                              <div className="mt-1 flex items-center text-xs text-gray-500">
                                <MapPin size={12} className="mr-1" />
                                {order.location}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end">
                              <div className="flex items-center bg-[#0a2b1d]/5 px-2 py-1 rounded-lg">
                                <RupeeIcon size={14} className="text-[#104732] mr-1" />
                                <span className="font-semibold text-[#104732]">{order.amount}</span>
                              </div>
                              
                              {order.deliver_by && order.deliver_by !== '0' && (
                                <Badge className="mt-2 bg-[#0a2b1d]/10 text-[#0a2b1d] border-[#0a2b1d]/20">
                                  {order.deliver_by}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-3 mb-2">
                            {orderItems.slice(0, 3).map((item, i) => (
                              <Badge key={i} variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                                {item.name.length > 30 ? item.name.substring(0, 30) + '...' : item.name}
                              </Badge>
                            ))}
                            {orderItems.length > 3 && (
                              <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-xs">
                                +{orderItems.length - 3} more
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center">
                              {getStatusBadge(order.order_status)}
                            </div>
                            
                            <div className="flex items-center">
                              {getPaymentBadge(order.payment_status)}
                              <ChevronRight size={16} className="text-gray-400 ml-1" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                {/* Desktop table layout */}
                <div className="hidden md:block divide-y divide-gray-100">
                  {sortedOrders
                    .slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage)
                    .map((order) => {
                      const { date, time } = formatDateTime(order.order_time);
                      const orderItems = getOrderItems(order.invoice_details);
                      
                      return (
                        <div 
                          key={order.id}
                          onClick={() => viewOrder(order.order_id)}
                          className="p-4 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-[#104732]">{order.customer}</h4>
                                <Badge variant="outline" className="bg-gray-100">{order.order_id}</Badge>
                              </div>
                              <div className="flex items-center mt-1">
                                <p className="text-sm text-gray-500">{date} • {time}</p>
                                <div className="mx-1 text-gray-300">•</div>
                                <div className="flex items-center">
                                  <MapPin size={12} className="text-gray-400 mr-1" />
                                  <p className="text-sm text-gray-500">{order.location}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="text-right mr-2">
                                <div className="flex items-center justify-end">
                                  <RupeeIcon size={14} className="text-gray-600 mr-1" />
                                  <p className="font-medium">{order.amount}</p>
                                </div>
                              </div>
                              <ChevronRight size={18} className="text-gray-400" />
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 my-2">
                            {orderItems.map((item, i) => (
                              <Badge key={i} variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                {item.name}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center flex-wrap gap-2 mt-2">
                            <div className="flex items-center gap-1">
                              <Clock size={14} className="text-gray-400" />
                              <span className="text-xs text-gray-500">Status:</span>
                            </div>
                            {getStatusBadge(order.order_status)}
                            
                            <div className="mx-2 text-gray-300">•</div>
                            
                            <div className="flex items-center gap-1">
                              <RupeeIcon size={14} className="text-gray-400" />
                              <span className="text-xs text-gray-500">Payment:</span>
                            </div>
                            {getPaymentBadge(order.payment_status)}
                            
                            <div className="flex-grow"></div>
                            
                            {order.deliver_by && order.deliver_by !== '0' && (
                              <Badge className="bg-[#0a2b1d]/10 text-[#0a2b1d] border-[#0a2b1d]/20">
                                {order.deliver_by}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              
              {/* Pagination - Enhanced version */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{Math.min((currentPage - 1) * ordersPerPage + 1, sortedOrders.length)}</span> to <span className="font-medium">{Math.min(currentPage * ordersPerPage, sortedOrders.length)}</span> of <span className="font-medium">{sortedOrders.length}</span> orders
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(old => Math.max(old - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, Math.ceil(sortedOrders.length / ordersPerPage)) }, (_, i) => {
                        // Calculate the page number to display
                        let pageNum;
                        const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);
                        
                        if (totalPages <= 5) {
                          // If there are 5 or fewer pages, show all page numbers
                          pageNum = i + 1;
                        } else {
                          // For more than 5 pages, create a sliding window
                          if (currentPage <= 3) {
                            // Near the start
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            // Near the end
                            pageNum = totalPages - 4 + i;
                          } else {
                            // In the middle
                            pageNum = currentPage - 2 + i;
                          }
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              currentPage === pageNum
                                ? 'z-10 bg-[#0a2b1d] text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF80]'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(old => Math.min(old + 1, Math.ceil(sortedOrders.length / ordersPerPage)))}
                        disabled={currentPage === Math.ceil(sortedOrders.length / ordersPerPage)}
                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 ${currentPage === Math.ceil(sortedOrders.length / ordersPerPage) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
                
                {/* Mobile pagination - Enhanced */}
                <div className="flex items-center justify-between sm:hidden px-2">
                  <Button
                    onClick={() => setCurrentPage(old => Math.max(old - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className={`rounded-lg flex items-center gap-1 ${
                      currentPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-[#0a2b1d] hover:bg-[#0a2b1d]/5 hover:border-[#0a2b1d]/20'
                    }`}
                    size="sm"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                    Previous
                  </Button>
                  
                  <div className="bg-[#0a2b1d]/5 rounded-lg px-3 py-1 font-medium text-[#0a2b1d]">
                    {currentPage} / {Math.ceil(sortedOrders.length / ordersPerPage)}
                  </div>
                  
                  <Button
                    onClick={() => setCurrentPage(old => Math.min(old + 1, Math.ceil(sortedOrders.length / ordersPerPage)))}
                    disabled={currentPage === Math.ceil(sortedOrders.length / ordersPerPage)}
                    variant="outline"
                    className={`rounded-lg flex items-center gap-1 ${
                      currentPage === Math.ceil(sortedOrders.length / ordersPerPage) 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-[#0a2b1d] hover:bg-[#0a2b1d]/5 hover:border-[#0a2b1d]/20'
                    }`}
                    size="sm"
                  >
                    Next
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Status tab component with count indicator
const StatusTab = ({ label, value, count = 0 }) => {
  const { orderFilters, setStatusFilter } = useAppStore();
  const active = orderFilters.statusFilter === value;
  
  return (
    <button 
      className={`px-5 py-3 whitespace-nowrap text-sm font-medium border-b-2 ${
        active 
          ? 'border-[#00FF80] text-[#104732]' 
          : 'border-transparent text-gray-500 hover:text-[#104732] hover:border-gray-200'
      }`}
      onClick={() => setStatusFilter(value)}
    >
      <div className="flex items-center gap-2">
        {label}
        {count > 0 && (
          <span className={`rounded-full text-xs px-1.5 py-0.5 ${
            active 
              ? 'bg-[#00FF80] text-[#0a2b1d]' 
              : 'bg-gray-200 text-gray-700'
          }`}>
            {count}
          </span>
        )}
      </div>
    </button>
  );
};

// Staff tab component 
const StaffTab = ({ label, value }) => {
  const { orderFilters, setStaffFilter } = useAppStore();
  const active = orderFilters.staffFilter === value;
  
  return (
    <button 
      className={`px-4 py-1.5 m-1 rounded-full text-xs font-medium ${
        active 
          ? 'bg-[#00FF80] text-[#0a2b1d]' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      onClick={() => setStaffFilter(value)}
    >
      {label}
    </button>
  );
};

// Quick Filter Tab for Mobile View - FIXED to keep badges inside container
const QuickFilterTab = ({ label, value, count = 0, color = "#104732" }) => {
  const { orderFilters, setStatusFilter } = useAppStore();
  const active = orderFilters.statusFilter === value;
  
  // Fix the color interpolation by using inline styles instead of Tailwind classes
  const activeStyles = active ? {
    backgroundColor: `rgba(${hexToRgb(color)}, 0.1)`,
    borderColor: `rgba(${hexToRgb(color)}, 0.2)`
  } : {};
  
  const activeTextStyles = active ? {
    color: color
  } : {};
  
  const badgeStyles = active ? {
    backgroundColor: `rgba(${hexToRgb(color)}, 0.2)`,
    color: color
  } : {};
  
  return (
    <button 
      className={`flex flex-col items-center justify-center px-3 py-2 m-1 rounded-lg ${
        active ? '' : 'bg-white border border-gray-200'
      }`}
      style={active ? activeStyles : {}}
      onClick={() => setStatusFilter(value)}
    >
      <span className={`text-xs font-medium ${active ? '' : 'text-gray-700'}`} style={active ? activeTextStyles : {}}>
        {label}
      </span>
      {count > 0 && (
        <span 
          className={`mt-1 rounded-full text-xs px-1.5 py-0.5 text-center min-w-[20px] ${
            active ? '' : 'bg-gray-100 text-gray-600'
          }`}
          style={active ? badgeStyles : {}}
        >
          {count}
        </span>
      )}
    </button>
  );
};

// Helper function to convert hex to rgb for rgba color values
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

// Add CSS to hide scrollbar and other global styles
const styles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* Add slight animation for card hover */
  .main-content .p-4.hover\\:bg-gray-50 {
    transition: all 0.2s ease;
  }
  
  /* Add subtle shadow effect on card hover */
  .main-content .p-4.hover\\:bg-gray-50:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }
  
  /* Improved focus styles for better accessibility */
  button:focus-visible, input:focus-visible {
    outline: 2px solid #00FF80;
    outline-offset: 2px;
  }
  
  /* Add responsive padding for better mobile view */
  @media (max-width: 640px) {
    .p-4.hover\\:bg-gray-50 {
      padding: 1rem 0.75rem;
    }
  }
  
  /* Pagination styles */
  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  /* Active pagination button pulsing animation */
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(0, 255, 128, 0.4);
    }
    70% {
      box-shadow: 0 0 0 5px rgba(0, 255, 128, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(0, 255, 128, 0);
    }
  }
  
  .z-10.bg-\\[\\#0a2b1d\\] {
    animation: pulse 2s infinite;
  }
  
  /* Mobile card animations */
  .bg-white.rounded-xl {
    transition: all 0.15s ease-in-out;
  }
  
  .bg-white.rounded-xl:active {
    transform: scale(0.98);
  }
  
  /* Fade down animation for filters */
  @keyframes fadeDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeDown {
    animation: fadeDown 0.3s ease-out;
  }
  
  /* Premium touches */
  .bg-gradient-to-r {
    background-size: 150% 150%;
    animation: gradientShift 8s ease infinite;
  }
  
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  /* Highlight new orders animation */
  @keyframes highlight {
    0% {
      background-color: rgba(0, 255, 128, 0.2);
    }
    100% {
      background-color: transparent;
    }
  }
  
  .highlight-new {
    animation: highlight 2s ease-out;
  }
  
  /* Mobile optimization */
  @media (max-width: 640px) {
    .rounded-xl {
      border-radius: 0.75rem;
    }
    
    /* Improve spacing in cards */
    .p-3 {
      padding: 0.875rem;
    }
    
    /* Add bounce effect to tap */
    .active\\:bg-gray-50:active {
      transform: scale(0.97);
    }
    
    /* Fix for sort dropdown modal on mobile */
    .fixed.transform {
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    
    /* Add backdrop for sort dropdown on mobile */
    body.sort-modal-open::after {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 40;
    }
  }
`;

// Add the styles to the component
const StyleInjector = () => (
  <style jsx global>{styles}</style>
);

// Export the component with styles
export default function OrdersListWithStyles() {
  return (
    <>
      <StyleInjector />
      <OrdersList />
    </>
  );
}