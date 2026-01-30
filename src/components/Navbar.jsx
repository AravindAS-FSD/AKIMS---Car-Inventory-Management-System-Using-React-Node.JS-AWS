import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';
import {
  FaBars, FaUser, FaHome, FaBox, FaFolderOpen,
  FaTruck, FaChartBar, FaUsers
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = user?.username
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
    : 'User';

  const isAdmin = user?.role === 'admin';

  return (
    <div className="navbar">
      {/* Desktop View */}
      <div className="navbar-desktop">
        <div className="navbar-left">
          <FaUser />
          <span>{displayName}</span>
        </div>

        <div className="navbar-center">
          <Link to="/home" className="navbar-link"><FaHome /> Home</Link>
          <Link to="/products" className="navbar-link"><FaBox /> Products</Link>
          {isAdmin && (
            <Link to="/categories" className="navbar-link"><FaFolderOpen /> Categories</Link>
          )}
          <Link to="/suppliers" className="navbar-link"><FaTruck /> Suppliers</Link>
          <Link to="/reports" className="navbar-link"><FaChartBar /> Reports</Link>
          {isAdmin && (
            <Link to="/users" className="navbar-link"><FaUsers /> Users</Link>
          )}
        </div>

        <div className="navbar-right">
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Mobile View */}
      <div className="navbar-mobile">
        <div className="navbar-mobile-header">
          <div className="menu-toggle" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            <FaBars />
          </div>
          <span><FaUser /> {displayName}</span>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
        {showMobileMenu && (
          <div className="navbar-mobile-links">
            <Link to="/home" onClick={() => setShowMobileMenu(false)}><FaHome /> Home</Link>
            <Link to="/products" onClick={() => setShowMobileMenu(false)}><FaBox /> Products</Link>
            {isAdmin && (
              <Link to="/categories" onClick={() => setShowMobileMenu(false)}><FaFolderOpen /> Categories</Link>
            )}
            <Link to="/suppliers" onClick={() => setShowMobileMenu(false)}><FaTruck /> Suppliers</Link>
            <Link to="/reports" onClick={() => setShowMobileMenu(false)}><FaChartBar /> Reports</Link>
            {isAdmin && (
              <Link to="/users" onClick={() => setShowMobileMenu(false)}><FaUsers /> Users</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
