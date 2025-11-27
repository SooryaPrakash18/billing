import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import Invoices from './Invoices';
import Stocks from './Stocks';
import Purchases from './Purchases';
import Quotations from './Quotations';
import Assets from './Assets';
import GST from './GST';
import Revenue from './Revenue';
import AddUser from './AddUser';
import Settings from './Settings';
import '../css/AdminDashboard.css';

const AdminDashboard = ({ setIsAuthenticated }) => {
  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="main-content">
        <Header setIsAuthenticated={setIsAuthenticated} />
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/gst" element={<GST />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/add-user" element={<AddUser />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;