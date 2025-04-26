'use client';
import { create } from 'zustand';
import axios from 'axios';

// Define the types of views/pages we have in our app
export const Views = {
  DASHBOARD: 'dashboard',
  CREATE_ORDER: 'create-order',
  ORDERS_LIST: 'orders-list',
  ORDER_DETAILS: 'order-details',
  CUSTOMERS: 'customers',
  SETTINGS: 'settings',
};

// Define order status mapping
export const OrderStatusMap = {
  1: { label: 'New Order', value: 'new' },
  2: { label: 'Hold', value: 'hold' },
  3: { label: 'Pending Payment', value: 'pending_payment' },
  4: { label: 'Processing', value: 'processing' },
  5: { label: 'Out for Delivery', value: 'ready' },
  6: { label: 'Delivered', value: 'delivered' },
  7: { label: 'Cancelled', value: 'cancelled' },
};

// Define payment status mapping
export const PaymentStatusMap = {
  1: { label: 'Not Set', value: 'not_set' },
  2: { label: 'Partial', value: 'partial' },
  3: { label: 'Pending', value: 'pending' },
  4: { label: 'Paid', value: 'paid' },
};

// Define the store
export const useAppStore = create((set, get) => ({
  // Current view/page
  currentView: Views.ORDERS_LIST,
  
  // Current order ID (if viewing/editing a specific order)
  currentOrderId: null,
  
  // Current order data (if viewing/editing a specific order)
  currentOrder: null,
  
  // Orders data
  orders: [],
  loadingOrders: false,
  ordersError: null,
  
  // Order filters
  orderFilters: {
    statusFilter: 'all',
    staffFilter: 'all',
    searchTerm: '',
    viewMode: 'today', // 'today' or 'all'
  },
  
  // API integration
  fetchOrders: async () => {
    set({ loadingOrders: true, ordersError: null });
    
    try {
      const viewMode = get().orderFilters.viewMode;
      const endpoint = viewMode === 'today' 
        ? 'https://ecopeedika.com/api/orders/today' 
        : 'https://ecopeedika.com/api/allorders';
      
      const response = await axios.get(endpoint);
      
      if (response.data.status && Array.isArray(response.data.data)) {
        set({ orders: response.data.data });
      } else {
        set({ ordersError: "Failed to fetch orders data" });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      set({ ordersError: "Error connecting to the server" });
    } finally {
      set({ loadingOrders: false });
    }
  },
  
  fetchOrderById: async (orderId) => {
    set({ loadingOrders: true, ordersError: null });
    
    try {
      // Try to find the order in the existing orders array first
      const existingOrder = get().orders.find(order => order.order_id === orderId);
      
      if (existingOrder) {
        set({ currentOrder: existingOrder });
      } else {
        // If not found, fetch from API (you'll need to create this endpoint)
        const response = await axios.get(`https://ecopeedika.com/api/orders/${orderId}`);
        
        if (response.data.status && response.data.data) {
          set({ currentOrder: response.data.data });
        } else {
          set({ ordersError: "Failed to fetch order details" });
        }
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      set({ ordersError: "Error connecting to the server" });
    } finally {
      set({ loadingOrders: false });
    }
  },
  
  // Navigation actions
  navigateTo: (view) => set({ currentView: view, currentOrderId: null }),
  
  // Order specific actions
  viewOrder: (orderId) => {
    set({ currentView: Views.ORDER_DETAILS, currentOrderId: orderId });
    get().fetchOrderById(orderId);
  },
  
  createNewOrder: () => set({ currentView: Views.CREATE_ORDER, currentOrderId: null }),
  
  // Update order filters
  setStatusFilter: (filter) => set((state) => ({
    orderFilters: { ...state.orderFilters, statusFilter: filter }
  })),
  
  setStaffFilter: (filter) => set((state) => ({
    orderFilters: { ...state.orderFilters, staffFilter: filter }
  })),
  
  setSearchTerm: (term) => set((state) => ({
    orderFilters: { ...state.orderFilters, searchTerm: term }
  })),
  
  setViewMode: (mode) => set((state) => ({
    orderFilters: { ...state.orderFilters, viewMode: mode }
  })),
  
  // Initialize app - call this when the app starts
  initApp: () => {
    get().fetchOrders();
  }
}));