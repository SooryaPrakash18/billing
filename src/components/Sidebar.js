import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/dashboard/invoices', icon: '🧾', label: 'Invoices' },
    { path: '/dashboard/stocks', icon: '📦', label: 'Stocks' },
    { path: '/dashboard/purchases', icon: '🛒', label: 'Purchases' },
    { path: '/dashboard/quotations', icon: '📋', label: 'Quotations' },
    { path: '/dashboard/assets', icon: '💼', label: 'Assets' },
    { path: '/dashboard/gst', icon: '🏛️', label: 'GST' },
    { path: '/dashboard/revenue', icon: '💰', label: 'Revenue' },
    // { path: '/dashboard/add-user', icon: '👥', label: 'Add User' },
    // { path: '/dashboard/settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Billing System</h3>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
              <Link to={item.path} onClick={() => setIsOpen(false)}>
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;