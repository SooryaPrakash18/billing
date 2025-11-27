import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AddUser.css';

const AddUser = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://billing-ki8l.onrender.com/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert('Error fetching users', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showAlert('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showAlert('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      if (editingUser) {
        await axios.put(`https://billing-ki8l.onrender.com/api/users/${editingUser._id}`, {
          email: formData.email,
          role: formData.role
        });
        showAlert('User updated successfully!', 'success');
      } else {
        await axios.post('https://billing-ki8l.onrender.com/api/users', {
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        showAlert('User created successfully!', 'success');
      }
      
      resetForm();
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      showAlert(error.response?.data?.message || 'Error saving user', 'error');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role
    });
    setShowForm(true);
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`https://billing-ki8l.onrender.com/api/users/${userId}`);
        showAlert('User deleted successfully!', 'success');
        fetchUsers();
      } catch (error) {
        showAlert(error.response?.data?.message || 'Error deleting user', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user'
    });
    setEditingUser(null);
  };

  return (
    <div className="add-user-container">
      {/* Alert Notification */}
      {alert.show && (
        <div className={`alert alert-${alert.type === 'error' ? 'error' : 'success'}`}>
          {alert.message}
        </div>
      )}

      {/* Header Bar */}
      <div className="header-bar">
        <h2>User Management</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Add New User
        </button>
      </div>

      {/* User Form Modal */}
      {showForm && (
        <div className="user-form-overlay">
          <div className="user-form-container">
            <div className="user-form-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button className="btn-close" onClick={() => { setShowForm(false); resetForm(); }}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h5>User Information</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              {!editingUser && (
                <div className="form-section">
                  <h5>Security</h5>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required={!editingUser}
                      />
                      <small className="form-text">
                        Password must be at least 6 characters long
                      </small>
                    </div>
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input
                        type="password"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        required={!editingUser}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button type="button" className="btn-cancel" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </button>
                {editingUser && (
                  <button type="button" className="btn-delete" onClick={() => deleteUser(editingUser._id)}>
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="users-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div className="actions">
                      <button 
                        className="btn-sm btn-edit"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-sm btn-danger"
                        onClick={() => deleteUser(user._id)}
                        disabled={user.email === 'admin@company.com'}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <h4>No users found</h4>
                    <p>Add your first user to get started.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Guidelines */}
      <div className="user-guidelines">
        <div className="guidelines-card">
          <div className="guidelines-header">
            <h5>User Management Guidelines</h5>
          </div>
          <div className="guidelines-body">
            <ul>
              <li>Admin users have full access to all system features</li>
              <li>Regular users have limited access based on their permissions</li>
              <li>Default admin account (admin@company.com) cannot be deleted</li>
              <li>Ensure strong passwords for all user accounts</li>
              <li>Regularly review and update user permissions as needed</li>
              <li>Passwords are required only when creating new users</li>
              <li>Editing users allows changing roles without resetting passwords</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;