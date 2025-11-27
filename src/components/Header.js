import React from 'react';
import '../css/Header.css';

const Header = ({ setIsAuthenticated }) => {
  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.clear();
    
    // Update authentication state
    setIsAuthenticated(false);
    
    // Optional: Redirect to login page
    window.location.href = '/login';
  };

  // Safely get user data with fallbacks
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : {};
    } catch (error) {
      console.error('Error parsing user data:', error);
      return {};
    }
  };

  const user = getUserData();
  const userEmail = user.email || user.username || 'User';

  return (
    <header className="header">
      <div className="header-content">
        <div className="user-info">
          <span> Welcome, {userEmail}</span>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-outline-danger btn-sm" 
            onClick={handleLogout}
            aria-label="Logout"
          >
            🔓
 Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;