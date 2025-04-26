'use client';
import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Home, 
  Users, 
  ShoppingBag, 
  Settings,
  PlusCircle
} from "lucide-react";
import { useAppStore, Views } from '../store/app.store';

const Nav = () => {
  // Add state to track if sheet is open
  const [sheetOpen, setSheetOpen] = useState(false);
  const { currentView, navigateTo, createNewOrder } = useAppStore();
  
  // Function to close the sheet and navigate
  const handleNavigation = (view) => {
    setSheetOpen(false); // Close the sheet
    navigateTo(view); // Navigate to the selected view
  };
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a2b1d] text-white shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#104732]">
                <Menu size={22} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#0a2b1d] text-white border-r border-[#104732] p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-[#104732]">
                  <h2 className="text-xl font-bold">Eco Peedika</h2>
                  <p className="text-sm text-[#66B895]">Admin Dashboard</p>
                </div>
                <nav className="flex-1">
                  <ul className="py-2">
                    <NavItem view={Views.DASHBOARD} icon={<Home size={18} />} label="Dashboard" onSelect={handleNavigation} />
                    <NavItem view={Views.CREATE_ORDER} icon={<PlusCircle size={18} />} label="Create Order" onSelect={handleNavigation} />
                    <NavItem view={Views.ORDERS_LIST} icon={<ShoppingBag size={18} />} label="Orders" onSelect={handleNavigation} />
                    <NavItem view={Views.CUSTOMERS} icon={<Users size={18} />} label="Customers" onSelect={handleNavigation} />
                    <NavItem view={Views.SETTINGS} icon={<Settings size={18} />} label="Settings" onSelect={handleNavigation} />
                  </ul>
                </nav>
                <div className="p-4 border-t border-[#104732]">
                  <p className="text-xs text-[#66B895]">Eco Peedika v1.0</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <h1 className="text-lg font-medium">Eco Peedika</h1>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            className="rounded-full w-10 h-10 p-0 bg-[#00FF80] hover:bg-[#00cc66] shadow-lg shadow-[#00FF80]/20"
            onClick={() => createNewOrder()}
          >
            <PlusCircle size={22} className="text-[#0a2b1d]" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ view, icon, label, onSelect }) => {
  const { currentView } = useAppStore();
  const active = currentView === view;
  
  return (
    <li>
      <button 
        onClick={() => onSelect(view)}
        className={`flex w-full items-center gap-3 px-4 py-3 hover:bg-[#104732] transition-colors ${active ? 'bg-[#104732] border-l-4 border-[#00FF80]' : ''}`}
      >
        <span className="text-[#66B895]">{icon}</span>
        <span className="text-white">{label}</span>
      </button>
    </li>
  );
};

export default Nav;