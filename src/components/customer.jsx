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
  Users,
  Filter,
  PlusCircle,
  ChevronRight,
  Mail,
  CheckCircle,
  X,
  Phone,
  RefreshCcw,
  UserPlus,
  MapPin,
  CalendarDays,
  ArrowUpDown,
  ChevronDown,
  User
} from "lucide-react";
import { useAppStore, Views } from '../store/app.store';
import axios from 'axios';
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Custom Indian Rupee Icon component for consistency
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

const CustomersList = () => {
  // Store state
  const { 
    navigateTo,
    viewCustomer,
    createNewCustomer
  } = useAppStore();
  
  // Refs for dropdowns
  const sortMenuRef = useRef(null);
  
  // State for customers data
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name_asc', 'name_desc', 'location'
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFiltersOnMobile, setShowFiltersOnMobile] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);
  const [animateRefresh, setAnimateRefresh] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [locationCounts, setLocationCounts] = useState({});
  const [userTypeCounts, setUserTypeCounts] = useState({
    all: 0,
    admin: 0,
    customer: 0
  });

  // State for new customer form
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    email: '',
    phone: '',
    address: '',
    location: '',
    latitude: '',
    longtitude: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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

  // Fetch customers from API
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    setAnimateRefresh(true);
    
    try {
      const response = await axios.get('https://ecopeedika.com/api/users');
      
      if (response.data.status && response.data.data) {
        setCustomers(response.data.data);
        
        // Calculate location counts
        const locations = {};
        response.data.data.forEach(customer => {
          if (customer.location) {
            locations[customer.location] = (locations[customer.location] || 0) + 1;
          }
        });
        setLocationCounts(locations);
        
        // Calculate user type counts
        const userTypes = {
          all: response.data.data.length,
          admin: response.data.data.filter(customer => customer.userType === '1').length,
          customer: response.data.data.filter(customer => customer.userType === '0').length
        };
        setUserTypeCounts(userTypes);
      } else {
        setError("Failed to fetch customers data");
      }
    } catch (err) {
      setError("Error connecting to the server");
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
      setTimeout(() => setAnimateRefresh(false), 800);
    }
  };

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search, location, and user type
  const filteredCustomers = customers.filter(customer => {
    // Base search filter
    const baseSearchMatch = !searchTerm || 
      customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(customer.phone).toLowerCase().includes(searchTerm.toLowerCase());
    
    // Location filter
    const locationMatch = !locationFilter || 
      customer.location?.toLowerCase().includes(locationFilter.toLowerCase());
    
    // User type filter
    const userTypeMatch = userTypeFilter === 'all' || 
      (userTypeFilter === 'admin' && customer.userType === '1') ||
      (userTypeFilter === 'customer' && customer.userType === '0');
    
    return baseSearchMatch && locationMatch && userTypeMatch;
  });

  // Sort filtered customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch(sortBy) {
      case 'newest':
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      case 'oldest':
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      case 'name_asc':
        return (a.firstName || '').localeCompare(b.firstName || '');
      case 'name_desc':
        return (b.firstName || '').localeCompare(a.firstName || '');
      case 'location':
        return (a.location || '').localeCompare(b.location || '');
      default:
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }
  });

  // Sort options
  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'Location (A-Z)', value: 'location' }
  ];

  // Get sort label from value
  const getSortLabel = (value) => {
    const option = sortOptions.find(opt => opt.value === value);
    return option ? option.label : 'Sort';
  };

  // Get unique locations for filter dropdown
  const uniqueLocations = [...new Set(customers
    .filter(customer => customer.location && customer.location.trim() !== '')
    .map(customer => customer.location))];

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setUserTypeFilter('all');
    setSortBy('newest');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Handle input change for new customer form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({
      ...newCustomer,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!newCustomer.firstName.trim()) {
      errors.firstName = "Name is required";
    }
    
    if (!newCustomer.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10,12}$/.test(newCustomer.phone.trim())) {
      errors.phone = "Enter a valid phone number";
    }
    
    if (newCustomer.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.email.trim())) {
      errors.email = "Enter a valid email address";
    }
    
    if (!newCustomer.address.trim()) {
      errors.address = "Address is required";
    }
    
    if (!newCustomer.location.trim()) {
      errors.location = "Location is required";
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('https://ecopeedika.com/api/register', newCustomer);
      
      if (response.data.status) {
        // Success! Close modal and refresh customer list
        setShowAddCustomerModal(false);
        fetchCustomers();
        
        // Reset form
        setNewCustomer({
          firstName: '',
          email: '',
          phone: '',
          address: '',
          location: '',
          latitude: '',
          longtitude: ''
        });
        setFormErrors({});
      } else {
        // API returned error
        setError("Failed to add customer: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      setError("Error connecting to the server");
      console.error("Error adding customer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get user type badge
  const getUserTypeBadge = (userType) => {
    switch(String(userType)) {
      case '1':
        return <Badge className="bg-purple-100 text-purple-600 border-purple-200">Admin</Badge>;
      case '0':
        return <Badge className="bg-blue-100 text-blue-600 border-blue-200">Customer</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Guest</Badge>;
    }
  };

  return (
    <div className="pb-20 main-content">
      <Card className="bg-white shadow-lg border-none rounded-lg overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0a2b1d] to-[#104732] text-white p-4 sticky top-0 z-20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-[#00FF80]" />
                <h3 className="font-medium">Customers</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  className="bg-[#00FF80] hover:bg-[#00cc66] text-[#0a2b1d]"
                  onClick={() => setShowAddCustomerModal(true)}
                >
                  <UserPlus size={16} className="mr-1" />
                  <span className="hidden sm:inline">Add Customer</span>
                  <span className="sm:hidden">Add</span>
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
                  placeholder="Search by name, email, phone..." 
                  className="pl-10 bg-gray-50 border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {/* Sort Dropdown with Fixed Positioning for Mobile */}
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
                          <h3 className="text-sm font-medium text-gray-700">Sort Customers</h3>
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
                  onClick={fetchCustomers}
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
            
            {/* Advanced Search */}
            {advancedSearch && (
              <div className="mt-3 flex flex-col md:flex-row gap-3 animate-fadeDown">
                <div className="relative flex-grow">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    className="w-full pl-10 bg-gray-50 border-gray-200 rounded-md px-3 py-2 appearance-none"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    <option value="">All Locations</option>
                    {uniqueLocations.map(location => (
                      <option key={location} value={location}>
                        {location} ({locationCounts[location] || 0})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative flex-grow">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    className="w-full pl-10 bg-gray-50 border-gray-200 rounded-md px-3 py-2 appearance-none"
                    value={userTypeFilter}
                    onChange={(e) => setUserTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types ({userTypeCounts.all})</option>
                    <option value="admin">Admin ({userTypeCounts.admin})</option>
                    <option value="customer">Customer ({userTypeCounts.customer})</option>
                  </select>
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
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-500 mb-1">Location</label>
                    <select 
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white shadow-sm"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    >
                      <option value="">All Locations</option>
                      {uniqueLocations.map(location => (
                        <option key={location} value={location}>
                          {location} ({locationCounts[location] || 0})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-500 mb-1">User Type</label>
                    <select 
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white shadow-sm"
                      value={userTypeFilter}
                      onChange={(e) => setUserTypeFilter(e.target.value)}
                    >
                      <option value="all">All Types ({userTypeCounts.all})</option>
                      <option value="admin">Admin ({userTypeCounts.admin})</option>
                      <option value="customer">Customer ({userTypeCounts.customer})</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="p-10 text-center text-gray-500">
              <div className={`mx-auto mb-5 text-[#00FF80] ${animateRefresh ? 'animate-spin' : 'animate-pulse'}`}>
                <RefreshCcw size={48} />
              </div>
              <p className="font-medium">Loading customers...</p>
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
                onClick={fetchCustomers}
              >
                <RefreshCcw size={16} className="mr-1" />
                Try Again
              </Button>
            </div>
          )}
          
          {/* Empty State */}
          {!loading && !error && sortedCustomers.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Users size={40} className="text-gray-300" />
              </div>
              <p className="font-medium">No customers found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or add a new customer</p>
              {(searchTerm || locationFilter || userTypeFilter !== 'all') && (
                <Button 
                  className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700"
                  onClick={clearFilters}
                >
                  <X size={16} className="mr-1" />
                  Clear Filters
                </Button>
              )}
              <div className="mt-4">
                <Button 
                  className="bg-[#00FF80] hover:bg-[#00cc66] text-[#0a2b1d]"
                  onClick={() => setShowAddCustomerModal(true)}
                >
                  <UserPlus size={16} className="mr-1" />
                  Add New Customer
                </Button>
              </div>
            </div>
          )}
          
          {/* Customers List */}
          {!loading && !error && sortedCustomers.length > 0 && (
            <>
              <div className="p-2 md:p-0 bg-gray-50 md:bg-white">
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {/* Mobile card layout */}
                  {sortedCustomers
                    .slice((currentPage - 1) * customersPerPage, currentPage * customersPerPage)
                    .map((customer) => (
                      <div 
                        key={customer.id}
                        onClick={() => viewCustomer && viewCustomer(customer.id)}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 active:bg-gray-50 transition-all duration-150 cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-[#104732] truncate max-w-[160px]">
                                {customer.firstName || 'Unknown'}
                              </h4>
                              {getUserTypeBadge(customer.userType)}
                            </div>
                            
                            {customer.email && customer.email.trim() !== ' ' && (
                              <div className="mt-1 flex items-center text-xs text-gray-500">
                                <Mail size={12} className="mr-1" />
                                {customer.email}
                              </div>
                            )}
                            
                            <div className="mt-1 flex items-center text-xs text-gray-500">
                              <Phone size={12} className="mr-1" />
                              {customer.phone}
                            </div>
                            
                            {customer.location && (
                              <div className="mt-1 flex items-center text-xs text-gray-500">
                                <MapPin size={12} className="mr-1" />
                                {customer.location}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center">
                            <ChevronRight size={16} className="text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="flex items-center pt-2 mt-2 border-t border-gray-100 text-xs text-gray-500">
                          <CalendarDays size={12} className="mr-1" />
                          {customer.created_at ? 'Joined: ' + formatDate(customer.created_at) : 'No join date'}
                        </div>
                      </div>
                    ))}
                </div>
                
                {/* Desktop table layout */}
                <div className="hidden md:block divide-y divide-gray-100">
                  {sortedCustomers
                    .slice((currentPage - 1) * customersPerPage, currentPage * customersPerPage)
                    .map((customer) => (
                      <div 
                        key={customer.id}
                        onClick={() => viewCustomer && viewCustomer(customer.id)}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-[#104732]">
                                {customer.firstName || 'Unknown'}
                              </h4>
                              {getUserTypeBadge(customer.userType)}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mt-2">
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone size={14} className="mr-1 text-gray-400" />
                                {customer.phone}
                              </div>
                              
                              {customer.email && customer.email.trim() !== ' ' && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <Mail size={14} className="mr-1 text-gray-400" />
                                  {customer.email}
                                </div>
                              )}
                              
                              {customer.location && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <MapPin size={14} className="mr-1 text-gray-400" />
                                  {customer.location}
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-2 text-sm text-gray-500">
                              <span className="text-xs font-medium text-gray-400 mr-1">Address:</span>
                              {customer.address || 'No address'}
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="text-right text-sm text-gray-500 mr-2">
                              <div className="flex items-center justify-end">
                                <CalendarDays size={14} className="mr-1 text-gray-400" />
                                {formatDate(customer.created_at)}
                              </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              
              {/* Pagination - Enhanced version */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{Math.min((currentPage - 1) * customersPerPage + 1, sortedCustomers.length)}</span> to <span className="font-medium">{Math.min(currentPage * customersPerPage, sortedCustomers.length)}</span> of <span className="font-medium">{sortedCustomers.length}</span> customers
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
                      {Array.from({ length: Math.min(5, Math.ceil(sortedCustomers.length / customersPerPage)) }, (_, i) => {
                        // Calculate the page number to display
                        let pageNum;
                        const totalPages = Math.ceil(sortedCustomers.length / customersPerPage);
                        
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
                        onClick={() => setCurrentPage(old => Math.min(old + 1, Math.ceil(sortedCustomers.length / customersPerPage)))}
                        disabled={currentPage === Math.ceil(sortedCustomers.length / customersPerPage)}
                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 ${currentPage === Math.ceil(sortedCustomers.length / customersPerPage) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
                
                {/* Mobile pagination */}
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
                    {currentPage} / {Math.ceil(sortedCustomers.length / customersPerPage)}
                  </div>
                  
                  <Button
                    onClick={() => setCurrentPage(old => Math.min(old + 1, Math.ceil(sortedCustomers.length / customersPerPage)))}
                    disabled={currentPage === Math.ceil(sortedCustomers.length / customersPerPage)}
                    variant="outline"
                    className={`rounded-lg flex items-center gap-1 ${
                      currentPage === Math.ceil(sortedCustomers.length / customersPerPage) 
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
      
      {/* Add Customer Modal */}
      <Dialog open={showAddCustomerModal} onOpenChange={setShowAddCustomerModal}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-[#0a2b1d] to-[#104732] text-white p-4">
            <DialogTitle className="flex items-center text-white">
              <UserPlus size={18} className="mr-2 text-[#00FF80]" />
              Add New Customer
            </DialogTitle>
            <DialogDescription className="text-gray-200 text-sm">
              Enter the details to register a new customer
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid gap-5 py-2">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Customer name"
                    value={newCustomer.firstName}
                    onChange={handleInputChange}
                    className={`bg-gray-50 ${formErrors.firstName ? 'border-red-300' : ''}`}
                  />
                  {formErrors.firstName && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>
                  )}
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={newCustomer.phone}
                    onChange={handleInputChange}
                    className={`bg-gray-50 ${formErrors.phone ? 'border-red-300' : ''}`}
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email address (optional)"
                    value={newCustomer.email}
                    onChange={handleInputChange}
                    className={`bg-gray-50 ${formErrors.email ? 'border-red-300' : ''}`}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                  )}
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter location"
                    value={newCustomer.location}
                    onChange={handleInputChange}
                    className={`bg-gray-50 ${formErrors.location ? 'border-red-300' : ''}`}
                  />
                  {formErrors.location && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.location}</p>
                  )}
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    placeholder="Enter full address"
                    value={newCustomer.address}
                    onChange={handleInputChange}
                    rows={3}
                    className={`bg-gray-50 w-full rounded-md border px-3 py-2 text-sm ${formErrors.address ? 'border-red-300' : 'border-gray-200'}`}
                  ></textarea>
                  {formErrors.address && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="latitude" className="text-sm font-medium text-gray-700">
                      Latitude
                    </label>
                    <Input
                      id="latitude"
                      name="latitude"
                      placeholder="Optional"
                      value={newCustomer.latitude}
                      onChange={handleInputChange}
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="longtitude" className="text-sm font-medium text-gray-700">
                      Longitude
                    </label>
                    <Input
                      id="longtitude"
                      name="longtitude"
                      placeholder="Optional"
                      value={newCustomer.longtitude}
                      onChange={handleInputChange}
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6 flex gap-2 justify-between sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddCustomerModal(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#00FF80] hover:bg-[#00cc66] text-[#0a2b1d]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Customer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
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
  }
`;

// Add the styles to the component
const StyleInjector = () => (
  <style jsx global>{styles}</style>
);

// Export the component with styles
export default function CustomersListWithStyles() {
  return (
    <>
      <StyleInjector />
      <CustomersList />
    </>
  );
}