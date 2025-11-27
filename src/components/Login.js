// Login.js
import React, { useState } from 'react';
import axios from 'axios';
import '../css/Login.css';

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic client-side validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://billing-ki8l.onrender.com/api/auth/login', formData);
      
      if (response.data.success) {
        // Store authentication data
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token || 'demo-token');
        
        // Update authentication state
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        setError(error.response.data.message || 'Invalid email or password');
      } else if (error.request) {
        // Request was made but no response received
        setError('Unable to connect to server. Please try again.');
      } else {
        // Other errors
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Demo credentials auto-fill for testing
  const fillDemoCredentials = () => {
    setFormData({
      email: 'myeio@gmail.com',
      password: 'myeio@123'
    });
  };

  return (
    <div className="login-fullscreen">
      <div className="login-background-overlay"></div>
      
      <div className="login-content">
        {/* Left Side - Branding */}
        <div className="login-brand-section">
          <div className="brand-content">
            <div className="logo-container">
              <img src="/Black.png" alt="InvoicePro Logo" className="brand-logo" />
            </div>
            <h1 className="brand-title">E I O Digital Solution Pvt.Ltd.</h1>
            <p className="brand-subtitle">Professional Billing & Invoicing Solution</p>
            {/* <div className="brand-features">
              <div className="feature-item">
                <i className="fas fa-bolt"></i>
                <span>Fast Invoicing</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-chart-line"></i>
                <span>Revenue Analytics</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-shield-alt"></i>
                <span>Secure & Reliable</span>
              </div>
            </div> */}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className={`login-form-container ${isLoading ? 'loading' : ''}`}>
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Login to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <i className="fas fa-envelope"> </i>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <i className="fas fa-lock"> </i>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary login-btn" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Signing In...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    Login
                  </>
                )}
              </button>
            </form>
            
            <div className="demo-credentials">
              {/* <div className="demo-header">
                <i className="fas fa-vial"></i>
                <h4>Demo Access</h4>
              </div> */}
              <div className="demo-info">
                <div className="demo-field">
                  <i className="fas fa-user"></i>
                  <span>Email: <strong>myeio@gmail.com</strong></span>
                </div>
                <div className="demo-field">
                  <i className="fas fa-key"></i>
                  <span>Password: <strong>myeio@123</strong></span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={fillDemoCredentials}
                className="btn btn-demo"
                disabled={isLoading}
              >
                <i className="fas fa-magic"></i>
                Auto-fill Credentials
              </button>
            </div>

            <div className="login-footer">
              <p>&copy; 2025 E I O Digital Solution Pvt.Ltd.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;