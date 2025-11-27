import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Stocks.css';

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    productCode: '',
    category: '',
    quantity: 0,
    price: 0,
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://billing-ki8l.onrender.com/api/stocks');
      setStocks(response.data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      alert('Failed to fetch stocks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.productName || !formData.productCode || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editMode && currentStock) {
        await axios.put(`https://billing-ki8l.onrender.com/api/stocks/${currentStock._id}`, formData);
      } else {
        await axios.post('https://billing-ki8l.onrender.com/api/stocks', formData);
      }
      
      resetForm();
      fetchStocks();
    } catch (error) {
      console.error('Error saving stock:', error);
      alert('Failed to save stock. Please try again.');
    }
  };

  const handleEdit = (stock) => {
    setFormData({
      productName: stock.productName,
      productCode: stock.productCode,
      category: stock.category,
      quantity: stock.quantity,
      price: stock.price,
      description: stock.description
    });
    setCurrentStock(stock);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this stock?')) {
      try {
        await axios.delete(`https://billing-ki8l.onrender.com/api/stocks/${id}`);
        fetchStocks();
      } catch (error) {
        console.error('Error deleting stock:', error);
        alert('Failed to delete stock. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      productCode: '',
      category: '',
      quantity: 0,
      price: 0,
      description: ''
    });
    setShowForm(false);
    setEditMode(false);
    setCurrentStock(null);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Get unique categories
  const categories = ['all', ...new Set(stocks.map(stock => stock.category))];

  // Filter stocks
  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.productCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || stock.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="stocks-container">
      {/* Header Section */}
      <div className="stocks-header">
        <div className="header-content">
          <h2>Stock Management</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <span className="btn-icon">+</span> Add Stock
          </button>
        </div>

        {/* Search and Filter */}
        <div className="stocks-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="filter-box">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-control"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="stock-form-overlay" onClick={resetForm}>
          <div className="stock-form-container" onClick={(e) => e.stopPropagation()}>
            <div className="stock-form-header">
              <h3>{editMode ? 'Edit Stock' : 'Add New Stock'}</h3>
              <button className="btn-close" onClick={resetForm}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Enter product name"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Product Code *</label>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Enter product code"
                    value={formData.productCode}
                    onChange={(e) => handleInputChange('productCode', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Category *</label>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Enter category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-control mb-3"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    className="form-control mb-3"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control mb-3"
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows="1"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  {editMode ? 'Update' : 'Save'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading stocks...</p>
        </div>
      ) : (
        <>
          {/* Stock Statistics */}
          <div className="stock-stats">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h4>{stocks.length}</h4>
                <p>Total Products</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h4>{stocks.reduce((sum, stock) => sum + stock.quantity, 0)}</h4>
                <p>Total Quantity</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h4>₹{stocks.reduce((sum, stock) => sum + (stock.price * stock.quantity), 0).toFixed(2)}</h4>
                <p>Total Value</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏷️</div>
              <div className="stat-content">
                <h4>{new Set(stocks.map(s => s.category)).size}</h4>
                <p>Categories</p>
              </div>
            </div>
          </div>

          {/* Stocks Grid */}
          {filteredStocks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No stocks found</h3>
              <p>{searchTerm || filterCategory !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Add your first stock to get started!'}</p>
            </div>
          ) : (
            <div className="stocks-grid">
              {filteredStocks.map((stock) => (
                <div key={stock._id} className="stock-card">
                  <div className="stock-card-header">
                    <h5>{stock.productName}</h5>
                    <span className={`stock-badge ${stock.quantity < 10 ? 'low-stock' : ''}`}>
                      {stock.quantity < 10 ? '⚠️ Low Stock' : '✓ In Stock'}
                    </span>
                  </div>
                  
                  <div className="stock-details">
                    <div className="detail-row">
                      <span className="detail-label">Code:</span>
                      <span className="detail-value">{stock.productCode}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Category:</span>
                      <span className="detail-value">{stock.category}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Quantity:</span>
                      <span className="detail-value quantity">{stock.quantity} units</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value price">₹{stock.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {stock.description && (
                    <div className="stock-description">
                      <p>{stock.description}</p>
                    </div>
                  )}

                  <div className="stock-card-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(stock)}
                      title="Edit"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(stock._id)}
                      title="Delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Stocks;