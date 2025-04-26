'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ShoppingBag,
  Calendar,
  TrendingUp,
  Truck,
  RefreshCcw,
  ChevronRight,
  Clock,
  Package,
  CheckCheck,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  CircleDollarSign,
} from "lucide-react";
import { useAppStore } from '../store/app.store';
import axios from 'axios';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Custom Rupee Icon component for consistency
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

const Dashboard = () => {
  // State for data
  const [customers, setCustomers] = useState([]);
  const [todayOrders, setTodayOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'

  // Fetch data from APIs
  const fetchData = async () => {
    setRefreshing(true);
    setLoading(true);
    setError(null);
    
    try {
      // Fetch customers
      const customersResponse = await axios.get('https://ecopeedika.com/api/users');
      if (customersResponse.data.status && customersResponse.data.data) {
        setCustomers(customersResponse.data.data);
      } else {
        console.error("Failed to fetch customers data");
      }
      
      // Fetch today's orders
      const todayOrdersResponse = await axios.get('https://ecopeedika.com/api/orders/today');
      if (todayOrdersResponse.data.status && todayOrdersResponse.data.data) {
        setTodayOrders(todayOrdersResponse.data.data);
      } else {
        console.error("Failed to fetch today's orders data");
      }
      
      // Fetch all orders
      const allOrdersResponse = await axios.get('https://ecopeedika.com/api/allorders');
      if (allOrdersResponse.data.status && allOrdersResponse.data.data) {
        setAllOrders(allOrdersResponse.data.data);
      } else {
        console.error("Failed to fetch all orders data");
      }
    } catch (err) {
      setError("Error connecting to the server");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Calculate key metrics
  const calculateMetrics = () => {
    // Today's revenue
    const todayRevenue = todayOrders.reduce((total, order) => {
      return total + (parseFloat(order.amount) || 0);
    }, 0);
    
    // Total revenue (all orders)
    const totalRevenue = allOrders.reduce((total, order) => {
      return total + (parseFloat(order.amount) || 0);
    }, 0);
    
    // Average order value
    const avgOrderValue = allOrders.length > 0 
      ? totalRevenue / allOrders.length 
      : 0;
      
    // Delivery performance (% of orders delivered on time)
    const deliveredOrders = allOrders.filter(order => order.order_status === 6);
    const deliveryPerformance = allOrders.length > 0 
      ? (deliveredOrders.length / allOrders.length) * 100 
      : 0;
      
    // Orders by status
    const orderStatusCounts = {
      new: allOrders.filter(order => String(order.order_status) === '1').length,
      processing: allOrders.filter(order => String(order.order_status) === '4').length,
      delivering: allOrders.filter(order => String(order.order_status) === '5').length,
      delivered: allOrders.filter(order => String(order.order_status) === '6').length,
      cancelled: allOrders.filter(order => String(order.order_status) === '7').length,
      other: allOrders.filter(order => !['1', '4', '5', '6', '7'].includes(String(order.order_status))).length
    };
    
    // Top locations
    const locationCounts = {};
    allOrders.forEach(order => {
      if (order.location) {
        locationCounts[order.location] = (locationCounts[order.location] || 0) + 1;
      }
    });
    
    // Sort locations by count
    const topLocations = Object.keys(locationCounts)
      .map(location => ({
        name: location,
        value: locationCounts[location]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
      
    // Most recent orders
    const recentOrders = [...allOrders]
      .sort((a, b) => (b.order_time || 0) - (a.order_time || 0))
      .slice(0, 5);
      
    // Order trend data (for line chart)
    const orderDates = {};
    
    allOrders.forEach(order => {
      if (order.order_time) {
        const date = new Date(order.order_time * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        if (!orderDates[dateStr]) {
          orderDates[dateStr] = {
            date: dateStr,
            count: 0,
            revenue: 0
          };
        }
        
        orderDates[dateStr].count += 1;
        orderDates[dateStr].revenue += parseFloat(order.amount) || 0;
      }
    });
    
    // Convert to array and sort by date
    const orderTrend = Object.values(orderDates)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // Last 7 days
      
    return {
      totalCustomers: customers.length,
      totalOrders: allOrders.length,
      todayOrders: todayOrders.length,
      todayRevenue,
      totalRevenue,
      avgOrderValue,
      deliveryPerformance,
      orderStatusCounts,
      topLocations,
      recentOrders,
      orderTrend
    };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format timestamp to date and time
  const formatDateTime = (timestamp) => {
    if (!timestamp) return { date: '', time: '' };
    
    const date = new Date(timestamp * 1000);
    return {
      date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  // Map order status to badge
  const getStatusBadge = (status) => {
    switch(String(status)) {
      case '1':
        return <Badge className="bg-blue-100 text-blue-600 border-blue-200">New Order</Badge>;
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

  // Calculate metrics
  const metrics = loading ? null : calculateMetrics();

  // Colors for charts
  const COLORS = ['#00cc66', '#3b82f6', '#7c3aed', '#f59e0b', '#ef4444', '#6b7280'];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-md border border-gray-100">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Pie chart data for order status
  const orderStatusData = loading || !metrics ? [] : [
    { name: 'New', value: metrics.orderStatusCounts.new },
    { name: 'Processing', value: metrics.orderStatusCounts.processing },
    { name: 'Delivering', value: metrics.orderStatusCounts.delivering },
    { name: 'Delivered', value: metrics.orderStatusCounts.delivered },
    { name: 'Cancelled', value: metrics.orderStatusCounts.cancelled },
    { name: 'Other', value: metrics.orderStatusCounts.other }
  ].filter(item => item.value > 0);

  return (
    <div className="pb-20 main-content">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0a2b1d]">Dashboard</h1>
          <p className="text-gray-500">Welcome to your business overview</p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={fetchData}
          disabled={refreshing}
        >
          <RefreshCcw size={16} className={`${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Loading State */}
      {loading && !refreshing && (
        <div className="p-10 text-center text-gray-500">
          <div className="mx-auto mb-5 text-[#00FF80] animate-pulse">
            <RefreshCcw size={48} />
          </div>
          <p className="font-medium">Loading dashboard data...</p>
          <p className="text-sm text-gray-400 mt-1">This might take a moment</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-8 text-center text-red-500">
          <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <XCircle size={40} className="text-red-500" />
          </div>
          <p className="font-medium">{error}</p>
          <Button 
            className="mt-4 bg-[#00FF80] hover:bg-[#00cc66] text-[#0a2b1d]"
            onClick={fetchData}
          >
            <RefreshCcw size={16} className="mr-1" />
            Try Again
          </Button>
        </div>
      )}

      {/* Dashboard Content */}
      {!loading && !error && metrics && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Customers */}
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Customers</p>
                    <h3 className="text-2xl font-bold mt-1">{metrics.totalCustomers}</h3>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <div className="flex items-center text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>12%</span>
                  </div>
                  <span className="text-gray-500 ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>

            {/* Today's Orders */}
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Today's Orders</p>
                    <h3 className="text-2xl font-bold mt-1">{metrics.todayOrders}</h3>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <div className="flex items-center text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>8%</span>
                  </div>
                  <span className="text-gray-500 ml-2">from yesterday</span>
                </div>
              </CardContent>
            </Card>

            {/* Today's Revenue */}
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(metrics.todayRevenue)}</h3>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CircleDollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <div className="flex items-center text-red-500">
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                    <span>5%</span>
                  </div>
                  <span className="text-gray-500 ml-2">from yesterday</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Rate */}
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Delivery Rate</p>
                    <h3 className="text-2xl font-bold mt-1">{metrics.deliveryPerformance.toFixed(1)}%</h3>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Truck className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <div className="flex items-center text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>3%</span>
                  </div>
                  <span className="text-gray-500 ml-2">from last week</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Revenue Trend Chart */}
            <Card className="lg:col-span-2 border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-[#0a2b1d]">Revenue Trend</CardTitle>
                <CardDescription>Daily revenue for the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={metrics.orderTrend}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                        }}
                        angle={-45}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value).split('.')[0]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        name="Revenue" 
                        stroke="#00cc66" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        name="Orders" 
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-[#0a2b1d]">Order Status</CardTitle>
                <CardDescription>Distribution of orders by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} orders`, null]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location Chart and Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Locations */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-[#0a2b1d]">Top Locations</CardTitle>
                <CardDescription>Orders by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.topLocations}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 60, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        width={100}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="value" 
                        name="Orders" 
                        fill="#3b82f6" 
                        radius={[0, 4, 4, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="lg:col-span-2 border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-[#0a2b1d]">Recent Orders</CardTitle>
                <CardDescription>Latest 5 orders received</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b border-gray-100">
                        <th className="pb-2 pl-0 text-left font-medium">Order ID</th>
                        <th className="pb-2 text-left font-medium">Customer</th>
                        <th className="pb-2 text-left font-medium">Date</th>
                        <th className="pb-2 text-left font-medium">Amount</th>
                        <th className="pb-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {metrics.recentOrders.map(order => {
                        const { date, time } = formatDateTime(order.order_time);
                        return (
                          <tr key={order.id} className="text-sm">
                            <td className="py-3 pl-0 text-[#0a2b1d] font-medium">{order.order_id}</td>
                            <td className="py-3">{order.customer}</td>
                            <td className="py-3 whitespace-nowrap">{date}</td>
                            <td className="py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <RupeeIcon size={14} className="mr-1 text-gray-500" />
                                {order.amount || 0}
                              </div>
                            </td>
                            <td className="py-3">{getStatusBadge(order.order_status)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    className="text-[#0a2b1d] hover:bg-[#0a2b1d]/5"
                    onClick={() => useAppStore.getState().navigateTo('orders_list')}
                  >
                    View All Orders
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;