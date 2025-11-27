import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Purchases.css';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [viewingPurchase, setViewingPurchase] = useState(null);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    category: ''
  });
  const [stats, setStats] = useState({
    weekly: 0,
    yearly: 0,
    total: 0
  });

  const [formData, setFormData] = useState({
    purchaseDate: new Date().toISOString().split('T')[0],
    productName: '',
    quantity: 0,
    price: 0,
    supplier: '',
    totalAmount: 0,
    category: ''
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
    fetchPurchases();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [purchases, filter]);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  const fetchPurchases = async () => {
    try {
      const response = await axios.get('https://billing-ki8l.onrender.com/api/purchases');
      setPurchases(response.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      showAlert('Error fetching purchases', 'error');
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    let filteredPurchases = purchases;

    if (filter.startDate && filter.endDate) {
      filteredPurchases = filteredPurchases.filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate);
        return purchaseDate >= new Date(filter.startDate) && 
               purchaseDate <= new Date(filter.endDate);
      });
    }

    if (filter.category) {
      filteredPurchases = filteredPurchases.filter(purchase => 
        purchase.category === filter.category
      );
    }

    const weeklyPurchases = filteredPurchases.filter(purchase => 
      new Date(purchase.purchaseDate) >= oneWeekAgo
    );

    const yearlyPurchases = filteredPurchases.filter(purchase => 
      new Date(purchase.purchaseDate) >= oneYearAgo
    );

    setStats({
      weekly: weeklyPurchases.length,
      yearly: yearlyPurchases.length,
      total: filteredPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const purchaseData = {
        ...formData,
        totalAmount: formData.quantity * formData.price
      };

      if (editingPurchase) {
        await axios.put(`https://billing-ki8l.onrender.com/api/purchases/${editingPurchase._id}`, purchaseData);
        showAlert('Purchase updated successfully!', 'success');
      } else {
        await axios.post('https://billing-ki8l.onrender.com/api/purchases', purchaseData);
        showAlert('Purchase created successfully!', 'success');
      }

      setShowForm(false);
      setEditingPurchase(null);
      resetForm();
      fetchPurchases();
    } catch (error) {
      console.error('Error saving purchase:', error);
      showAlert('Error saving purchase', 'error');
    }
  };

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      purchaseDate: purchase.purchaseDate.split('T')[0],
      productName: purchase.productName,
      quantity: purchase.quantity,
      price: purchase.price,
      supplier: purchase.supplier,
      totalAmount: purchase.totalAmount,
      category: purchase.category
    });
    setShowForm(true);
  };

  const handleView = (purchase) => {
    setViewingPurchase(purchase);
  };

  const handleDelete = async (purchaseId) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        await axios.delete(`https://billing-ki8l.onrender.com/api/purchases/${purchaseId}`);
        showAlert('Purchase deleted successfully!', 'success');
        fetchPurchases();
      } catch (error) {
        console.error('Error deleting purchase:', error);
        showAlert('Error deleting purchase', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      purchaseDate: new Date().toISOString().split('T')[0],
      productName: '',
      quantity: 0,
      price: 0,
      supplier: '',
      totalAmount: 0,
      category: ''
    });
    setEditingPurchase(null);
  };

  const handleFilterChange = (field, value) => {
    const newFilter = { ...filter, [field]: value };
    setFilter(newFilter);
  };

  const clearFilters = () => {
    setFilter({ startDate: '', endDate: '', category: '' });
  };

  const generatePDF = (purchase = null) => {
    // Create a new window for PDF
    const pdfWindow = window.open('', '_blank');
    
    // Company information with logo (aligned to right)
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

    if (purchase) {
      // Single purchase PDF
      const purchaseContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Purchase Receipt - ${purchase.productName}</title>
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
            .company-info { 
              text-align: right; 
            }
            .purchase-info { 
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
            .signature-section { 
              margin-top: 50px; 
              display: flex; 
              justify-content: space-between; 
            }
            .signature-box { 
              width: 200px; 
              border-top: 1px solid #333; 
              padding-top: 10px; 
              text-align: center;
            }
            .receipt-title {
              background: linear-gradient(135deg, #2c3e50, #3498db);
              color: white;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .amount-highlight {
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
          
          <div class="receipt-title">
            <h1 style="margin: 0; font-size: 28px;">PURCHASE RECEIPT</h1>
          </div>

          <div class="header">
            <div class="purchase-info">
              <p><strong>Receipt No:</strong> PR-${purchase._id ? purchase._id.slice(-6).toUpperCase() : 'N/A'}</p>
              <p><strong>Date:</strong> ${new Date(purchase.purchaseDate).toLocaleDateString('en-IN')}</p>
              <p><strong>Supplier:</strong> ${purchase.supplier}</p>
            </div>
          </div>

          <div class="section">
            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-top: 0;">Purchase Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${purchase.productName}</td>
                  <td>${purchase.category}</td>
                  <td>${purchase.quantity}</td>
                  <td>₹${purchase.price?.toLocaleString('en-IN')}</td>
                  <td>₹${purchase.totalAmount?.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-top: 0;">Amount Summary</h3>
            <table style="width: 400px; float: right; margin-top: 15px;">
              <tr>
                <td><strong>Subtotal:</strong></td>
                <td>₹${purchase.totalAmount?.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td><strong>GST (18%):</strong></td>
                <td>₹${(purchase.totalAmount * 0.18).toLocaleString('en-IN')}</td>
              </tr>
              <tr class="total-row">
                <td><strong>Grand Total:</strong></td>
                <td>₹${(purchase.totalAmount * 1.18).toLocaleString('en-IN')}</td>
              </tr>
            </table>
            <div style="clear: both;"></div>
          </div>

          <div class="amount-highlight" style="margin-top: 20px;">
            <p style="margin: 0; text-align: center; font-size: 16px;">
              <strong>Amount in Words:</strong> ${convertToWords(purchase.totalAmount * 1.18)}
            </p>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <p><strong>Supplier Signature</strong></p>
              <p style="margin-top: 40px;">_________________________</p>
            </div>
            <div class="signature-box">
              <p><strong>Authorized Signature</strong></p>
              <p style="margin-top: 40px;">_________________________</p>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px;">
            <p><strong>This is a computer generated receipt and does not require a physical signature.</strong></p>
            <p>Thank you for your business!</p>
          </div>
        </body>
        </html>
      `;
      
      pdfWindow.document.write(purchaseContent);
      pdfWindow.document.close();
      setTimeout(() => {
        pdfWindow.print();
      }, 500);
    } else {
      // All purchases PDF report
      const filteredPurchases = purchases.filter(purchase => {
        if (filter.startDate && filter.endDate) {
          const purchaseDate = new Date(purchase.purchaseDate);
          return purchaseDate >= new Date(filter.startDate) && 
                 purchaseDate <= new Date(filter.endDate);
        }
        return !filter.category || purchase.category === filter.category;
      });

      const totalAmount = filteredPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);

      const reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Purchases Report - ${companyInfo.name}</title>
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
            <h1 style="margin: 0; font-size: 28px;">PURCHASES REPORT</h1>
          </div>
          
          <div class="summary-box">
            <p><strong>Report Period:</strong> ${filter.startDate ? new Date(filter.startDate).toLocaleDateString('en-IN') : 'All Dates'} 
            - ${filter.endDate ? new Date(filter.endDate).toLocaleDateString('en-IN') : 'Present'}</p>
            <p><strong>Category:</strong> ${filter.category || 'All Categories'}</p>
            <p><strong>Generated On:</strong> ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</p>
            <p><strong>Total Records:</strong> ${filteredPurchases.length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPurchases.map(purchase => `
                <tr>
                  <td>${new Date(purchase.purchaseDate).toLocaleDateString('en-IN')}</td>
                  <td>${purchase.productName}</td>
                  <td>${purchase.category}</td>
                  <td>${purchase.supplier}</td>
                  <td>${purchase.quantity}</td>
                  <td>₹${purchase.price?.toLocaleString('en-IN')}</td>
                  <td>₹${purchase.totalAmount?.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="6" style="text-align: right;"><strong>Grand Total:</strong></td>
                <td><strong>₹${totalAmount.toLocaleString('en-IN')}</strong></td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px;">
            <p><strong>Confidential Document - For Internal Use Only</strong></p>
            <p>Generated by ${companyInfo.name} Purchase Management System</p>
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

  // Helper function to convert numbers to words
  const convertToWords = (num) => {
    // Simple number to words conversion for Indian numbering system
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero Rupees';

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let words = '';

    if (rupees > 0) {
      if (rupees >= 10000000) {
        words += convertToWords(Math.floor(rupees / 10000000)) + 'Crore ';
        rupees = rupees % 10000000;
      }
      if (rupees >= 100000) {
        words += convertToWords(Math.floor(rupees / 100000)) + 'Lakh ';
        rupees = rupees % 100000;
      }
      if (rupees >= 1000) {
        words += convertToWords(Math.floor(rupees / 1000)) + 'Thousand ';
        rupees = rupees % 1000;
      }
      if (rupees >= 100) {
        words += convertToWords(Math.floor(rupees / 100)) + 'Hundred ';
        rupees = rupees % 100;
      }
      if (rupees > 0) {
        if (rupees < 20) {
          words += a[rupees];
        } else {
          words += b[Math.floor(rupees / 10)] + ' ' + a[rupees % 10];
        }
      }
      words += 'Rupees ';
    }

    if (paise > 0) {
      words += 'and ';
      if (paise < 20) {
        words += a[paise];
      } else {
        words += b[Math.floor(paise / 10)] + ' ' + a[paise % 10];
      }
      words += 'Paise ';
    }

    return words.trim() + ' Only';
  };

  const categories = ['Hardware', 'Software', 'Electronics', 'Office Supplies', 'Other'];

  const filteredPurchases = purchases
    .filter(purchase => {
      if (filter.startDate && filter.endDate) {
        const purchaseDate = new Date(purchase.purchaseDate);
        return purchaseDate >= new Date(filter.startDate) && 
               purchaseDate <= new Date(filter.endDate);
      }
      return true;
    })
    .filter(purchase => !filter.category || purchase.category === filter.category);

  return (
    <div className="purchases-container">
      {/* Alert Notification */}
      {alert.show && (
        <div className={`alert alert-${alert.type === 'error' ? 'error' : 'success'}`}>
          {alert.message}
        </div>
      )}

      {/* Header Bar */}
      <div className="header-bar">
        <h2>Purchase Management</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => generatePDF()}>
            Export PDF
          </button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Add Purchase
          </button>
        </div>
      </div>

 

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card weekly">
          <h3>{stats.weekly}</h3>
          <p>Weekly Purchases</p>
        </div>
        <div className="stat-card yearly">
          <h3>{stats.yearly}</h3>
          <p>Yearly Purchases</p>
        </div>
        <div className="stat-card total">
          <h3>₹{stats.total.toLocaleString('en-IN')}</h3>
          <p>Total Amount</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <h4>Filter Purchases</h4>
        <div className="filter-grid">
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Category</label>
            <select
              value={filter.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <button className="btn-reset" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Form Modal */}
      {showForm && (
        <div className="purchase-form-overlay">
          <div className="purchase-form-container">
            <div className="purchase-form-header">
              <h3>{editingPurchase ? 'Edit Purchase' : 'Add New Purchase'}</h3>
              <button className="btn-close" onClick={() => { setShowForm(false); resetForm(); }}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h5>Purchase Information</h5>
                <div className="form-grid">
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
                    <label>Product Name</label>
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={formData.productName}
                      onChange={(e) => setFormData({...formData, productName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Supplier</label>
                    <input
                      type="text"
                      placeholder="Supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h5>Purchase Details</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                      required
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Price per Unit</label>
                    <input
                      type="number"
                      placeholder="Price"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Amount</label>
                    <div className="amount-display">
                      ₹{(formData.quantity * formData.price).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  {editingPurchase ? 'Update Purchase' : 'Save Purchase'}
                </button>
                <button type="button" className="btn-cancel" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </button>
                {editingPurchase && (
                  <button type="button" className="btn-delete" onClick={() => handleDelete(editingPurchase._id)}>
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Purchase Modal */}
      {viewingPurchase && (
        <div className="purchase-form-overlay">
          <div className="purchase-form-container">
            <div className="purchase-form-header">
              <h3>Purchase Details</h3>
              <button className="btn-close" onClick={() => setViewingPurchase(null)}></button>
            </div>
            <div className="form-section">
              <h5>Purchase Information</h5>
              <div className="form-grid">
                <div className="form-group">
                  <label>Purchase Date</label>
                  <div className="amount-display">
                    {new Date(viewingPurchase.purchaseDate).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div className="form-group">
                  <label>Product Name</label>
                  <div className="amount-display">
                    {viewingPurchase.productName}
                  </div>
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <div className="amount-display">
                    {viewingPurchase.supplier}
                  </div>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <span className={`category-badge ${viewingPurchase.category.toLowerCase().replace(' ', '-')}`}>
                    {viewingPurchase.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h5>Purchase Details</h5>
              <div className="form-grid">
                <div className="form-group">
                  <label>Quantity</label>
                  <div className="amount-display">
                    {viewingPurchase.quantity}
                  </div>
                </div>
                <div className="form-group">
                  <label>Price per Unit</label>
                  <div className="amount-display">
                    ₹{viewingPurchase.price?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="form-group">
                  <label>Total Amount</label>
                  <div className="amount-display" style={{ background: '#d4edda', color: '#155724' }}>
                    ₹{viewingPurchase.totalAmount?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-save" onClick={() => generatePDF(viewingPurchase)}>
                Download PDF
              </button>
              <button type="button" className="btn-save" onClick={() => { handleEdit(viewingPurchase); setViewingPurchase(null); }}>
                Edit Purchase
              </button>
              <button type="button" className="btn-cancel" onClick={() => setViewingPurchase(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchases List */}
      <div className="purchases-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((purchase) => (
                <tr key={purchase._id}>
                  <td>{new Date(purchase.purchaseDate).toLocaleDateString('en-IN')}</td>
                  <td>{purchase.productName}</td>
                  <td>
                    <span className={`category-badge ${purchase.category.toLowerCase().replace(' ', '-')}`}>
                      {purchase.category}
                    </span>
                  </td>
                  <td>{purchase.supplier}</td>
                  <td>{purchase.quantity}</td>
                  <td className="amount-cell">₹{purchase.price?.toLocaleString('en-IN')}</td>
                  <td className="amount-cell">₹{purchase.totalAmount?.toLocaleString('en-IN')}</td>
                  <td>
                    <div className="actions">
                      <button className="btn-sm btn-info" onClick={() => handleView(purchase)}>
                        View
                      </button>
                      <button className="btn-sm btn-edit" onClick={() => handleEdit(purchase)}>
                        Edit
                      </button>
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(purchase._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <h4>No purchases found</h4>
                    <p>Try adjusting your filters or add a new purchase.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Purchases;