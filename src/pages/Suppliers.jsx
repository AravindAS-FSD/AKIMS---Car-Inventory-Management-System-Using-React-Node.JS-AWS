import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './Suppliers.css';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Suppliers = () => {
  const { user } = useContext(AuthContext);
  const [suppliers, setSuppliers] = useState([]);
  const [name, setName] = useState('');
  const BASE_URL = 'https://olbqku3sei.execute-api.us-east-1.amazonaws.com';

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = () => {
    axios
      .get(`${BASE_URL}/getsupplierss`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      })
      .then((res) => {
        const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        setSuppliers(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error('❌ Failed to fetch suppliers');
      });
  };

  const handleAdd = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return toast.warning('⚠️ Name is required');

    const isDuplicate = suppliers.some(
      (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) return toast.warning('⚠️ Duplicate supplier not allowed');

    axios
      .post(
        `${BASE_URL}/addsuppliers`,
        { name: trimmedName },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      )
      .then(() => {
        toast.success(`✅ Supplier "${trimmedName}" added`);
        setName('');
        fetchSuppliers();
      })
      .catch((err) => {
        console.error(err);
        toast.error('❌ Error adding supplier');
      });
  };

  const handleDelete = (id, supplierName) => {
    if (!window.confirm(`Are you sure you want to delete "${supplierName}"?`)) return;

    axios
      .delete(`${BASE_URL}/deletesuppliers/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      })
      .then(() => {
        toast.success(`🗑️ Supplier "${supplierName}" deleted`);
        fetchSuppliers();
      })
      .catch((err) => {
        console.error(err);
        toast.error('❌ Error deleting supplier');
      });
  };

  if (user?.role !== 'admin' && user?.role !== 'staff') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>⛔ Access denied. Only Admin or Staff can manage suppliers.</h3>
      </div>
    );
  }

  return (
    <div className="suppliers-container">
      <h2>🚚 Supplier Management</h2>

      <div className="user-form">
        <input
          placeholder="Supplier Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleAdd} disabled={!name.trim()}>Add Supplier</button>
      </div>

      <div className="supplier-cards">
        {suppliers.map((s) => (
          <div className="supplier-card" key={s.id}>
            <p><strong>Name:</strong> {s.name}</p>
            <p><strong>Added By:</strong> {s.createdBy || 'Unknown'}</p>
            <button className="delete-btn" onClick={() => handleDelete(s.id, s.name)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>Supplier Name</th>
            <th>Added By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.length === 0 ? (
            <tr><td colSpan="3">No suppliers found.</td></tr>
          ) : (
            suppliers.map((s) => (
              <tr key={s.id}>
                <td data-label="Supplier Name">{s.name}</td>
                <td data-label="Added By">{s.createdBy || 'Unknown'}</td>
                <td data-label="Action">
                  <button className="delete-btn" onClick={() => handleDelete(s.id, s.name)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Suppliers;
