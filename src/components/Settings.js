import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: '',
    companyAddress: '',
    companyContact: '',
    companyEmail: '',
    taxInfo: {
      gst: '',
      pan: '',
      terms: ''
    }
  });
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [activeTab, setActiveTab] = useState('company');

  useEffect(() => {
    fetchSettings();
  }, []);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get('https://billing-ki8l.onrender.com/api/settings');
      if (response.data.length > 0) {
        setSettings(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showAlert('Error fetching settings', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('https://billing-ki8l.onrender.com/api/settings');
      let savedSettings;

      if (response.data.length > 0) {
        // Update existing settings
        savedSettings = await axios.put(`https://billing-ki8l.onrender.com/api/settings/${response.data[0]._id}`, settings);
      } else {
        // Create new settings
        savedSettings = await axios.post('https://billing-ki8l.onrender.com/api/settings', settings);
      }

      showAlert('Settings saved successfully!', 'success');
      setSettings(savedSettings.data);
    } catch (error) {
      showAlert('Error saving settings', 'error');
      console.error('Error saving settings:', error);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTaxChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      taxInfo: {
        ...prev.taxInfo,
        [field]: value
      }
    }));
  };

  const resetChanges = () => {
    fetchSettings();
    showAlert('Changes reset successfully!', 'success');
  };

  return (
    <div className="settings-container">
      {/* Alert Notification */}
      {alert.show && (
        <div className={`alert alert-${alert.type === 'error' ? 'error' : 'success'}`}>
          {alert.message}
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-sidebar">
          <div className="sidebar-header">
            <h3>Settings</h3>
          </div>
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'company' ? 'active' : ''}`}
              onClick={() => setActiveTab('company')}
            >
              <span className="nav-icon">🏢</span>
              Company Information
            </button>
            <button 
              className={`nav-item ${activeTab === 'tax' ? 'active' : ''}`}
              onClick={() => setActiveTab('tax')}
            >
              <span className="nav-icon">💰</span>
              Tax Information
            </button>
            <button 
              className={`nav-item ${activeTab === 'invoice' ? 'active' : ''}`}
              onClick={() => setActiveTab('invoice')}
            >
              <span className="nav-icon">🧾</span>
              Invoice Settings
            </button>
          </nav>
        </div>
        
        <div className="settings-content">
          <div className="content-header">
            <h2>System Settings</h2>
            <p className="header-description">
              Manage your company information and system preferences
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {activeTab === 'company' && (
              <div className="settings-tab">
                <div className="tab-header">
                  <h4>Company Information</h4>
                  <p>This information will be displayed on your invoices and quotations.</p>
                </div>
                
                <div className="form-section">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        placeholder="Enter company name"
                        value={settings.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Company Address</label>
                      <textarea
                        placeholder="Enter full company address"
                        rows="4"
                        value={settings.companyAddress}
                        onChange={(e) => handleChange('companyAddress', e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Contact Number</label>
                      <input
                        type="text"
                        placeholder="Enter contact number"
                        value={settings.companyContact}
                        onChange={(e) => handleChange('companyContact', e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        value={settings.companyEmail}
                        onChange={(e) => handleChange('companyEmail', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tax' && (
              <div className="settings-tab">
                <div className="tab-header">
                  <h4>Tax Information</h4>
                  <p>Configure your tax settings for invoices and legal documents.</p>
                </div>
                
                <div className="form-section">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>GST Number</label>
                      <input
                        type="text"
                        placeholder="Enter GST number"
                        value={settings.taxInfo.gst}
                        onChange={(e) => handleTaxChange('gst', e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>PAN Number</label>
                      <input
                        type="text"
                        placeholder="Enter PAN number"
                        value={settings.taxInfo.pan}
                        onChange={(e) => handleTaxChange('pan', e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Payment Terms</label>
                      <textarea
                        placeholder="Enter payment terms and conditions"
                        rows="3"
                        value={settings.taxInfo.terms}
                        onChange={(e) => handleTaxChange('terms', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'invoice' && (
              <div className="settings-tab">
                <div className="tab-header">
                  <h4>Invoice Settings</h4>
                  <p>Configure default settings for invoices and billing.</p>
                </div>
                
                <div className="form-section">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Invoice Prefix</label>
                      <div className="readonly-field">
                        INV
                      </div>
                      <small className="field-description">
                        Invoice numbers are automatically generated in format: DDMMYY001
                      </small>
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Default Terms & Conditions</label>
                      <div className="readonly-field" style={{ minHeight: '100px' }}>
                        1. Payment due within 30 days\n2. Late payment interest @1.5% per month\n3. Goods once sold will not be taken back
                      </div>
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Default Notes</label>
                      <div className="readonly-field">
                        Thank you for your business!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-save">
                Save Settings
              </button>
              <button type="button" className="btn-cancel" onClick={resetChanges}>
                Reset Changes
              </button>
            </div>
          </form>

          <div className="settings-preview">
            <div className="preview-header">
              <h4>Invoice Preview</h4>
              <p>This is how your company information will appear on invoices</p>
            </div>
            <div className="preview-card">
              <div className="preview-content">
                <div className="company-info">
                  <h5>{settings.companyName || 'Your Company Name'}</h5>
                  <p>{settings.companyAddress || 'Your Company Address'}</p>
                  <p>Contact: {settings.companyContact || 'Your Contact Number'}</p>
                  <p>Email: {settings.companyEmail || 'your@email.com'}</p>
                  {settings.taxInfo.gst && <p>GST: {settings.taxInfo.gst}</p>}
                  {settings.taxInfo.pan && <p>PAN: {settings.taxInfo.pan}</p>}
                </div>
                <div className="invoice-meta">
                  <p><strong>Invoice #:</strong> INV-040525001</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
                  <p><strong>Due Date:</strong> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
              <div className="preview-footer">
                <p>Preview of how your settings will appear on generated documents</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;