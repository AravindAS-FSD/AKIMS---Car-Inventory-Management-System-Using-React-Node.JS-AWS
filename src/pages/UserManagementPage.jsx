import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import './UserManagementPage.css';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useWindowWidth from '../hooks/useWindowWidth';

const UserManagementPage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const role = 'staff'; // Hidden default
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const BASE_URL = 'https://olbqku3sei.execute-api.us-east-1.amazonaws.com';

  const width = useWindowWidth();
  const isMobile = width <= 768;

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  useEffect(() => {
    fetchUsers();
    inputRef.current?.focus();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/getuserss`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      .then((res) => {
        const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        const onlyStaff = data.filter((u) => u.role === 'staff');
        setUsers(onlyStaff);
      })
      .catch(() => toast.error('❌ Failed to fetch users'))
      .finally(() => setLoading(false));
  };

  const handleAddUser = () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      toast.warning('⚠️ Fill username and password');
      return;
    }

    const isDuplicate = users.some(
      (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
    );
    if (isDuplicate) {
      toast.warning('⚠️ Duplicate username');
      return;
    }

    setLoading(true);
    axios
      .post(`${BASE_URL}/createusers`,
        { username: trimmedUsername, password: trimmedPassword, role },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      )
      .then(() => {
        toast.success(`✅ User "${capitalize(trimmedUsername)}" added`);
        setUsername('');
        setPassword('');
        fetchUsers();
        inputRef.current?.focus();
      })
      .catch((err) => {
        if (err?.response?.status === 409) {
          toast.warning('⚠️ Username already exists');
        } else {
          toast.error('❌ Error adding user');
        }
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    setLoading(true);
    axios
      .delete(`${BASE_URL}/deleteusers/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      .then(() => {
        toast.success(`🗑️ User "${capitalize(name)}" deleted`);
        fetchUsers();
      })
      .catch(() => toast.error('❌ Error deleting user'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="user-management-container">
      <h2>User Management</h2>
      <p>Manage your staff users here. Only staff can log in.</p>

      <div className="user-form">
        <div className="input-pair">
          <input
            ref={inputRef}
            type='text'
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-pair">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button onClick={handleAddUser} disabled={loading}>
          {loading ? 'Adding...' : 'Add User'}
        </button>
      </div>

      {isMobile ? (
        <div className="user-card-list">
          {users.map((u) => (
            <div className="user-card" key={u.id}>
              <p><strong>Username:</strong> {u.username}</p>
              <button className="delete-button" onClick={() => handleDelete(u.id, u.username)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="2">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="2">No staff found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>
                    <button className="delete-button" onClick={() => handleDelete(u.id, u.username)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default UserManagementPage;
