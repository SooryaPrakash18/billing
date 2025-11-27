import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingQuotations: 0,
    lowStockItems: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [invoicesRes, quotationsRes, stocksRes] = await Promise.all([
        axios.get('https://billing-ki8l.onrender.com/api/invoices'),
        axios.get('https://billing-ki8l.onrender.com/api/quotations'),
        axios.get('https://billing-ki8l.onrender.com/api/stocks')
      ]);

      const invoices = invoicesRes.data;
      const quotations = quotationsRes.data;
      const stocks = stocksRes.data;

      // Calculate statistics
      const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      const pendingQuotations = quotations.filter(q => q.status === 'Pending').length;
      const lowStockItems = stocks.filter(stock => stock.quantity < 10).length;

      setStats({
        totalInvoices: invoices.length,
        totalRevenue,
        pendingQuotations,
        lowStockItems
      });

      // Recent invoices (last 5)
      setRecentInvoices(invoices.slice(0, 5));

      // Recent activities (mock data - in real app, you'd have an activities API)
      setRecentActivities([
        { type: 'invoice', description: 'New invoice created #04052025001', time: '2 hours ago' },
        { type: 'quotation', description: 'Quotation approved for Client A', time: '4 hours ago' },
        { type: 'purchase', description: 'New stock purchase recorded', time: '1 day ago' },
        { type: 'user', description: 'New user account created', time: '1 day ago' },
        { type: 'invoice', description: 'Invoice #04052025000 paid', time: '2 days ago' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'invoice': return '🧾';
      case 'quotation': return '📋';
      case 'purchase': return '🛒';
      case 'user': return '👥';
      default: return '📢';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'invoice': return '#007bff';
      case 'quotation': return '#28a745';
      case 'purchase': return '#ffc107';
      case 'user': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const handleQuickAction = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header mb-4">
        <h1>Dashboard Overview</h1>
        <p className="text-muted">Welcome to your billing system dashboard</p>
      </div>

      {/* Statistics Cards */}
      {/* Statistics Cards - Horizontal Single Row */}
<div className="stats-grid">
  <div className="stat-card revenue">
    <div className="stat-icon">💰</div>
    <div className="stat-content">
      <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
      <p>Total Revenue</p>
    </div>
  </div>
  <div className="stat-card invoices">
    <div className="stat-icon">🧾</div>
    <div className="stat-content">
      <h3>{stats.totalInvoices}</h3>
      <p>Total Invoices</p>
    </div>
  </div>
  <div className="stat-card quotations">
    <div className="stat-icon">📋</div>
    <div className="stat-content">
      <h3>{stats.pendingQuotations}</h3>
      <p>Pending Quotations</p>
    </div>
  </div>
  <div className="stat-card stock">
    <div className="stat-icon">📦</div>
    <div className="stat-content">
      <h3>{stats.lowStockItems}</h3>
      <p>Low Stock Items</p>
    </div>
  </div>
</div>

      <div className="dashboard-content row">
        {/* Recent Invoices */}
        <div className="col-lg-6 mb-4">
          <div className="dashboard-card">
            <div className="card-header">
              <h5>Recent Invoices</h5>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleQuickAction('/dashboard/invoices')}
              >
                View All
              </button>
            </div>
            <div className="card-body">
              {recentInvoices.length > 0 ? (
                <div className="recent-list">
                  {recentInvoices.map((invoice) => (
                    <div key={invoice._id} className="recent-item">
                      <div className="item-info">
                        <h6>#{invoice.invoiceNumber}</h6>
                        <span className="company-name">{invoice.companyInfo?.name}</span>
                      </div>
                      <div className="item-amount">
                        <strong>₹{invoice.totalAmount?.toLocaleString()}</strong>
                        <small className="text-muted d-block">
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">No invoices found</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="col-lg-6 mb-4">
          <div className="dashboard-card">
            <div className="card-header">
              <h5>Recent Activities</h5>
            </div>
            <div className="card-body">
              <div className="activities-list">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div 
                      className="activity-icon"
                      style={{ backgroundColor: `${getActivityColor(activity.type)}20` }}
                    >
                      <span style={{ color: getActivityColor(activity.type) }}>
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>
                    <div className="activity-content">
                      <p className="activity-description">{activity.description}</p>
                      <small className="activity-time">{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-12">
          <div className="dashboard-card">
            <div className="card-header">
              <h5>Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="quick-actions-grid">
                <button 
                  className="quick-action"
                  onClick={() => handleQuickAction('/dashboard/invoices')}
                >
                  <div className="action-icon">🧾</div>
                  <span>Create Invoice</span>
                </button>
                <button 
                  className="quick-action"
                  onClick={() => handleQuickAction('/dashboard/quotations')}
                >
                  <div className="action-icon">📋</div>
                  <span>Create Quotation</span>
                </button>
                <button 
                  className="quick-action"
                  onClick={() => handleQuickAction('/dashboard/stocks')}
                >
                  <div className="action-icon">📦</div>
                  <span>Manage Stock</span>
                </button>
                <button 
                  className="quick-action"
                  onClick={() => handleQuickAction('/dashboard/purchases')}
                >
                  <div className="action-icon">🛒</div>
                  <span>Record Purchase</span>
                </button>
                <button 
                  className="quick-action"
                  onClick={() => handleQuickAction('/dashboard/assets')}
                >
                  <div className="action-icon">💼</div>
                  <span>Manage Assets</span>
                </button>
                {/* <button 
                  className="quick-action"
                  onClick={() => handleQuickAction('/dashboard/add-user')}
                >
                  <div className="action-icon">👥</div>
                  <span>Add User</span>
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;