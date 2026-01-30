import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const BASE_URL = 'https://olbqku3sei.execute-api.us-east-1.amazonaws.com';

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/loginusers`, { username, password });
      const { user, token } = res.data;

      login({ ...user, token });
      localStorage.setItem('token', token);

      alert(`✅ Welcome, ${user.username}!`);

      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <input
          className="login-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="login-button"
          onClick={handleLogin}
          disabled={loading || !username.trim() || !password.trim()}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default Login;
