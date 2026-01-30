import React, { useContext, useEffect, useState, useCallback } from 'react';
import './Home.css';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [counts, setCounts] = useState({
    products: 0,
    categories: 0,
    suppliers: 0,
    users: 0,
  });

  const BASE_URL = 'https://olbqku3sei.execute-api.us-east-1.amazonaws.com';

  const fetchDashboardData = useCallback(async () => {
    try {
      const headers = {
        Authorization: `Bearer ${user?.token}`,
      };

      const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
        axios.get(`${BASE_URL}/getproductss`, { headers }),
        axios.get(`${BASE_URL}/getcategories`, { headers }),
        axios.get(`${BASE_URL}/getsupplierss`, { headers }),
      ]);

      let users = [];
      if (user?.role === 'admin') {
        const res = await axios.get(`${BASE_URL}/getuserss`, { headers });
        const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        users = data.filter((u) => u.role === 'staff');
      }

      setCounts({
        products: productsRes.data.length || 0,
        categories: categoriesRes.data.length || 0,
        suppliers: suppliersRes.data.length || 0,
        users: users.length || 0,
      });
    } catch (err) {
      console.error('📉 Dashboard fetch error:', err);
      alert('❌ Failed to load dashboard. Please try again.');
    }
  }, [user?.token, user?.role]);

  useEffect(() => {
    if (user?.token) fetchDashboardData();
  }, [user?.token, fetchDashboardData]);

  return (
    <div className="home-container">
      <h1>
        📦 Welcome to AKIMS, <br /> Hi &nbsp;
        <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
          {user?.username
            ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
            : 'User'}
        </span>!</h1>
      <p>Here's a quick overview of your inventory:</p>

      <div className="dashboard">
        <div className="dashboard-card">
          <h3>Total Products</h3>
          <p>{counts.products}</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Categories</h3>
          <p>{counts.categories}</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Suppliers</h3>
          <p>{counts.suppliers}</p>
        </div>
        {user?.role === 'admin' && (
          <div className="dashboard-card">
            <h3>Total Users</h3>
            <p>{counts.users}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;