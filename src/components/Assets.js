import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Assets.css';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [viewingAsset, setViewingAsset] = useState(null);
  const [stats, setStats] = useState({
    totalValue: 0,
    hardwareCount: 0,
    softwareCount: 0,
    totalItems: 0
  });

  const [formData, setFormData] = useState({
    assetName: '',
    assetType: '',
    category: '',
    quantity: 1,
    value: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Company Information
  const companyInfo = {
    name: 'E I O Digital Solutions',
    legalName: 'Private Limited',
    address: '1A/1-G9 Wavoo Centre, Madurai Road, Tirunelveli-627001',
    contact: 'Phone: +91 9840624407, +91 9444224407',
    email: 'Email: myeiokln@mail.com',
    website: 'Website: https.myeio.in',
    gstin: 'GSTIN: 32AAAF012344125'
  };

  // Logo path - assuming logo.png is in public folder
  const companyLogo = '/logo.png';

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [assets]);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  const fetchAssets = async () => {
    try {
      const response = await axios.get('https://billing-ki8l.onrender.com/api/assets');
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      showAlert('Error fetching assets', 'error');
    }
  };

  const calculateStats = () => {
    const totalValue = assets.reduce((sum, asset) => sum + (asset.value * asset.quantity), 0);
    const hardwareCount = assets.filter(asset => asset.category === 'Hardware').length;
    const softwareCount = assets.filter(asset => asset.category === 'Software').length;
    const totalItems = assets.reduce((sum, asset) => sum + asset.quantity, 0);

    setStats({
      totalValue,
      hardwareCount,
      softwareCount,
      totalItems
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const assetData = {
        ...formData,
        totalValue: formData.quantity * formData.value
      };

      if (editingAsset) {
        await axios.put(`https://billing-ki8l.onrender.com/api/assets/${editingAsset._id}`, assetData);
        showAlert('Asset updated successfully!', 'success');
      } else {
        await axios.post('https://billing-ki8l.onrender.com/api/assets', assetData);
        showAlert('Asset created successfully!', 'success');
      }

      setShowForm(false);
      setEditingAsset(null);
      resetForm();
      fetchAssets();
    } catch (error) {
      console.error('Error saving asset:', error);
      showAlert('Error saving asset', 'error');
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      assetName: asset.assetName,
      assetType: asset.assetType,
      category: asset.category,
      quantity: asset.quantity,
      value: asset.value,
      purchaseDate: asset.purchaseDate.split('T')[0],
      description: asset.description || ''
    });
    setShowForm(true);
  };

  const handleView = (asset) => {
    setViewingAsset(asset);
  };

  const handleDelete = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await axios.delete(`https://billing-ki8l.onrender.com/api/assets/${assetId}`);
        showAlert('Asset deleted successfully!', 'success');
        fetchAssets();
      } catch (error) {
        console.error('Error deleting asset:', error);
        showAlert('Error deleting asset', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      assetName: '',
      assetType: '',
      category: '',
      quantity: 1,
      value: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      description: ''
    });
    setEditingAsset(null);
  };

  const generatePDF = (asset = null) => {
    const pdfWindow = window.open('', '_blank');
    
    // Company information with logo
    const companyInfoHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px;">
        <div style="flex: 1;">
          <img src="${companyLogo}" alt="Company Logo" style="max-width: 150px; max-height: 80px; object-fit: contain;" onerror="this.style.display='none'">
        </div>
        <div style="text-align: right; flex: 2;">
          <h2 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 24px;">${companyInfo.name}</h2>
          <p style="margin: 0 0 3px 0; color: #666; font-size: 14px; font-weight: bold;">${companyInfo.legalName}</p>
          <p style="margin: 5px 0; color: #666; font-size: 12px;">${companyInfo.address}</p>
          <p style="margin: 3px 0; color: #666; font-size: 12px;">${companyInfo.contact}</p>
          <p style="margin: 3px 0; color: #666; font-size: 12px;">${companyInfo.email}</p>
          <p style="margin: 3px 0; color: #666; font-size: 12px;">${companyInfo.website}</p>
          <p style="margin: 3px 0 0 0; color: #666; font-size: 12px; font-weight: bold;">${companyInfo.gstin}</p>
        </div>
      </div>
    `;

    if (asset) {
      // Single asset PDF
      const assetContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Asset Details - ${asset.assetName}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              margin: 30px; 
              color: #333; 
              background: white;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              margin-bottom: 30px; 
            }
            .asset-info { 
              margin-bottom: 20px; 
            }
            .section { 
              margin-bottom: 25px; 
              padding: 15px;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              background: #fafafa;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
              background: white;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background-color: #2c3e50; 
              color: white; 
              font-weight: 600; 
            }
            .total-row { 
              background-color: #e8f5e8; 
              font-weight: bold; 
            }
            .asset-title {
              background: linear-gradient(135deg, #2c3e50, #3498db);
              color: white;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .value-highlight {
              background: #d4edda;
              padding: 10px;
              border-radius: 5px;
              border-left: 4px solid #28a745;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          ${companyInfoHTML}
          
          <div class="asset-title">
            <h1 style="margin: 0; font-size: 28px;">ASSET DETAILS</h1>
          </div>

          <div class="section">
            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-top: 0;">Asset Information</h3>
            <table>
              <tr>
                <th>Asset Name</th>
                <td>${asset.assetName}</td>
              </tr>
              <tr>
                <th>Category</th>
                <td>${asset.category}</td>
              </tr>
              <tr>
                <th>Asset Type</th>
                <td>${asset.assetType}</td>
              </tr>
              <tr>
                <th>Purchase Date</th>
                <td>${new Date(asset.purchaseDate).toLocaleDateString('en-IN')}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-top: 0;">Financial Details</h3>
            <table>
              <tr>
                <th>Quantity</th>
                <td>${asset.quantity}</td>
              </tr>
              <tr>
                <th>Value per Unit</th>
                <td>₹${asset.value?.toLocaleString('en-IN')}</td>
              </tr>
              <tr class="total-row">
                <th>Total Value</th>
                <td>₹${(asset.value * asset.quantity).toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>

          ${asset.description ? `
          <div class="section">
            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-top: 0;">Description</h3>
            <p>${asset.description}</p>
          </div>
          ` : ''}

          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px;">
            <p><strong>Company Asset - Confidential Document</strong></p>
            <p>Generated on ${new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </body>
        </html>
      `;
      
      pdfWindow.document.write(assetContent);
      pdfWindow.document.close();
      setTimeout(() => {
        pdfWindow.print();
      }, 500);
    } else {
      // All assets PDF report
      const totalValue = assets.reduce((sum, asset) => sum + (asset.value * asset.quantity), 0);
      const totalItems = assets.reduce((sum, asset) => sum + asset.quantity, 0);

      const reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Assets Report - ${companyInfo.name}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              margin: 30px; 
              color: #333; 
              background: white;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background-color: #2c3e50; 
              color: white; 
              font-weight: 600; 
            }
            .total-row { 
              background-color: #e8f5e8; 
              font-weight: bold; 
            }
            .report-title {
              background: linear-gradient(135deg, #2c3e50, #3498db);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .summary-box {
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 8px;
              padding: 15px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          ${companyInfoHTML}
          
          <div class="report-title">
            <h1 style="margin: 0; font-size: 28px;">ASSETS REPORT</h1>
          </div>
          
          <div class="summary-box">
            <p><strong>Generated On:</strong> ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</p>
            <p><strong>Total Assets:</strong> ${assets.length}</p>
            <p><strong>Total Items:</strong> ${totalItems}</p>
            <p><strong>Total Asset Value:</strong> ₹${totalValue.toLocaleString('en-IN')}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Unit Value</th>
                <th>Total Value</th>
                <th>Purchase Date</th>
              </tr>
            </thead>
            <tbody>
              ${assets.map(asset => `
                <tr>
                  <td>${asset.assetName}</td>
                  <td>${asset.category}</td>
                  <td>${asset.assetType}</td>
                  <td>${asset.quantity}</td>
                  <td>₹${asset.value?.toLocaleString('en-IN')}</td>
                  <td>₹${(asset.value * asset.quantity).toLocaleString('en-IN')}</td>
                  <td>${new Date(asset.purchaseDate).toLocaleDateString('en-IN')}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5" style="text-align: right;"><strong>Grand Total:</strong></td>
                <td><strong>₹${totalValue.toLocaleString('en-IN')}</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px;">
            <p><strong>Confidential Document - For Internal Use Only</strong></p>
            <p>Generated by ${companyInfo.name} Asset Management System</p>
          </div>
        </body>
        </html>
      `;
      
      pdfWindow.document.write(reportContent);
      pdfWindow.document.close();
      setTimeout(() => {
        pdfWindow.print();
      }, 500);
    }
  };

  const categories = ['Hardware', 'Software', 'Equipment', 'Furniture', 'Other'];
  const assetTypes = {
    'Hardware': ['Computer', 'Server', 'Printer', 'Network Device', 'Other Hardware'],
    'Software': ['Operating System', 'Application', 'Database', 'Security', 'Other Software'],
    'Equipment': ['Office Equipment', 'Production Equipment', 'Testing Equipment'],
    'Furniture': ['Desk', 'Chair', 'Cabinet', 'Shelf'],
    'Other': ['Other']
  };

  return (
    <div className="assets-container">
      {/* Alert Notification */}
      {alert.show && (
        <div className={`alert alert-${alert.type === 'error' ? 'error' : 'success'}`}>
          {alert.message}
        </div>
      )}

      {/* Header Bar */}
      <div className="header-bar">
        <h2>Asset Management</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => generatePDF()}>
            Export PDF
          </button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Add Asset
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card total-value">
          <h3>₹{stats.totalValue.toLocaleString('en-IN')}</h3>
          <p>Total Asset Value</p>
        </div>
        <div className="stat-card hardware">
          <h3>{stats.hardwareCount}</h3>
          <p>Hardware Assets</p>
        </div>
        <div className="stat-card software">
          <h3>{stats.softwareCount}</h3>
          <p>Software Assets</p>
        </div>
        <div className="stat-card total-items">
          <h3>{stats.totalItems}</h3>
          <p>Total Items</p>
        </div>
      </div>

      {/* Asset Form Modal */}
      {showForm && (
        <div className="asset-form-overlay">
          <div className="asset-form-container">
            <div className="asset-form-header">
              <h3>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h3>
              <button className="btn-close" onClick={() => { setShowForm(false); resetForm(); }}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h5>Asset Information</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Asset Name</label>
                    <input
                      type="text"
                      placeholder="Asset Name"
                      value={formData.assetName}
                      onChange={(e) => setFormData({...formData, assetName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value, assetType: ''})}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Asset Type</label>
                    <select
                      value={formData.assetType}
                      onChange={(e) => setFormData({...formData, assetType: e.target.value})}
                      required
                      disabled={!formData.category}
                    >
                      <option value="">Select Type</option>
                      {formData.category && assetTypes[formData.category]?.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h5>Asset Details</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                      required
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Value per Unit</label>
                    <input
                      type="number"
                      placeholder="Value"
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Purchase Date</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Value</label>
                    <div className="amount-display">
                      ₹{(formData.quantity * formData.value).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h5>Additional Information</h5>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Asset Description"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  {editingAsset ? 'Update Asset' : 'Save Asset'}
                </button>
                <button type="button" className="btn-cancel" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </button>
                {editingAsset && (
                  <button type="button" className="btn-delete" onClick={() => handleDelete(editingAsset._id)}>
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Asset Modal */}
      {viewingAsset && (
        <div className="asset-form-overlay">
          <div className="asset-form-container">
            <div className="asset-form-header">
              <h3>Asset Details</h3>
              <button className="btn-close" onClick={() => setViewingAsset(null)}></button>
            </div>
            <div className="form-section">
              <h5>Asset Information</h5>
              <div className="form-grid">
                <div className="form-group">
                  <label>Asset Name</label>
                  <div className="amount-display">
                    {viewingAsset.assetName}
                  </div>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <span className={`category-badge ${viewingAsset.category.toLowerCase()}`}>
                    {viewingAsset.category}
                  </span>
                </div>
                <div className="form-group">
                  <label>Asset Type</label>
                  <div className="amount-display">
                    {viewingAsset.assetType}
                  </div>
                </div>
                <div className="form-group">
                  <label>Purchase Date</label>
                  <div className="amount-display">
                    {new Date(viewingAsset.purchaseDate).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h5>Financial Details</h5>
              <div className="form-grid">
                <div className="form-group">
                  <label>Quantity</label>
                  <div className="amount-display">
                    {viewingAsset.quantity}
                  </div>
                </div>
                <div className="form-group">
                  <label>Value per Unit</label>
                  <div className="amount-display">
                    ₹{viewingAsset.value?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="form-group">
                  <label>Total Value</label>
                  <div className="amount-display" style={{ background: '#d4edda', color: '#155724' }}>
                    ₹{(viewingAsset.value * viewingAsset.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {viewingAsset.description && (
              <div className="form-section">
                <h5>Description</h5>
                <div className="form-group">
                  <div className="amount-display" style={{ textAlign: 'left', background: '#f8f9fa' }}>
                    {viewingAsset.description}
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="btn-save" onClick={() => generatePDF(viewingAsset)}>
                Download PDF
              </button>
              <button type="button" className="btn-save" onClick={() => { handleEdit(viewingAsset); setViewingAsset(null); }}>
                Edit Asset
              </button>
              <button type="button" className="btn-cancel" onClick={() => setViewingAsset(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assets Grid */}
      <div className="assets-grid">
        {assets.length > 0 ? (
          assets.map((asset) => (
            <div key={asset._id} className="asset-card">
              <div className="asset-header">
                <h5>{asset.assetName}</h5>
                <span className={`category-badge ${asset.category.toLowerCase()}`}>
                  {asset.category}
                </span>
              </div>
              <div className="asset-details">
                <p><strong>Type:</strong> {asset.assetType}</p>
                <p><strong>Quantity:</strong> {asset.quantity}</p>
                <p><strong>Value:</strong> ₹{asset.value?.toLocaleString('en-IN')}</p>
                <p><strong>Total:</strong> ₹{(asset.value * asset.quantity).toLocaleString('en-IN')}</p>
                <p><strong>Purchase Date:</strong> {new Date(asset.purchaseDate).toLocaleDateString('en-IN')}</p>
                {asset.description && (
                  <p><strong>Description:</strong> {asset.description}</p>
                )}
              </div>
              <div className="asset-actions">
                <button className="btn-sm btn-info" onClick={() => handleView(asset)}>
                  View
                </button>
                <button className="btn-sm btn-edit" onClick={() => handleEdit(asset)}>
                  Edit
                </button>
                <button className="btn-sm btn-danger" onClick={() => handleDelete(asset._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <h4>No assets found</h4>
            <p>Add your first asset to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assets;