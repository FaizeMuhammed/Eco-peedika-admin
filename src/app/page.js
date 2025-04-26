'use client';
import React from 'react';
import Nav from '../components/nav';
import CreateOrder from '../components/orderconfirmaion';
import OrdersList from '../components/orderlist';
import { Button } from "@/components/ui/button"; 
import { PlusCircle } from "lucide-react";
import { useAppStore, Views } from '../store/app.store';
import CustomersList from '@/components/customer';
import Dashboard from '@/components/dashboard';

// Additional CSS for custom styling
const styles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* Add top padding to the main content container to account for fixed nav */
  .main-content {
    padding-top: 80px; /* Adjust this value based on your nav height */
  }
  
  /* Make the tab bar sticky and positioned properly */
  .tab-sticky {
    position: sticky;
    top: 140px;
    z-index: 20;
  }
  
  /* Make the order summary sticky and positioned properly */
  .summary-sticky {
    position: sticky;
    top: 190px;
    z-index: 10;
  }
`;

export default function Home() {
  const { currentView, createNewOrder } = useAppStore();
  
  // Render component based on current view
  const renderContent = () => {
    switch (currentView) {
      case Views.CREATE_ORDER:
        return <CreateOrder />;
      case Views.ORDERS_LIST:
        return <OrdersList />;
      case Views.DASHBOARD:
        return <Dashboard />;
      case Views.CUSTOMERS:
        return <CustomersList/>
      case Views.SETTINGS:
        return <div className="p-8 text-center">Settings (Coming Soon)</div>;
      default:
        return <OrdersList />;
    }
  };
  
  // Show FAB only in orders list view
  const showFAB = currentView === Views.ORDERS_LIST;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add custom styles */}
      <style jsx global>{styles}</style>
      
      {/* Navigation */}
      <Nav />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20 ">
        {renderContent()}
      </div>
      
      {/* Floating Action Button for mobile */}
      {showFAB && (
        <div className="fixed bottom-6 right-6 sm:hidden z-40">
          <Button 
            className="rounded-full w-16 h-16 p-0 bg-[#00FF80] hover:bg-[#00cc66] shadow-xl shadow-[#00FF80]/30"
            onClick={() => createNewOrder()}
          >
            <PlusCircle size={28} className="text-[#0a2b1d]" />
          </Button>
        </div>
      )}
    </div>
  );
}