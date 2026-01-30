import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './Products.css';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Products = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [customQty, setCustomQty] = useState({});

  const BASE_URL = 'https://olbqku3sei.execute-api.us-east-1.amazonaws.com';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productRes, categoryRes, supplierRes] = await Promise.all([
        axios.get(`${BASE_URL}/getproductss`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        }),
        axios.get(`${BASE_URL}/getcategories`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        }),
        axios.get(`${BASE_URL}/getsupplierss`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        })
      ]);
      setProducts(productRes.data);
      setCategories(categoryRes.data);
      setSuppliers(supplierRes.data);
    } catch (error) {
      console.error(error);
      toast.error('❌ Failed to fetch data');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImageUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!name.trim() || !categoryId || !subcategoryId || !supplierId || !imageUrl) {
      return toast.warn('⚠️ Fill all fields including image');
    }
    const product = {
      name: name.trim(),
      category: categoryId,
      subcategory: subcategoryId,
      supplier: supplierId,
      imageUrl,
      quantity: 0
    };
    try {
      await axios.post(`${BASE_URL}/addproducts`, product, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      toast.success(`✅ Product "${name}" added`);
      setName('');
      setCategoryId('');
      setSubcategoryId('');
      setSupplierId('');
      setImageUrl('');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('❌ Error adding product');
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this product?')) return;

    axios.delete(`${BASE_URL}/deleteproducts/${id}`, {
      headers: { Authorization: `Bearer ${user?.token}` }
    })
      .then(() => {
        toast.success('🗑️ Product deleted');
        fetchData();
      })
      .catch(() => toast.error('❌ Error deleting product'));
  };

  const updateQuantity = (id, currentQty, isIncrement) => {
    const change = parseInt(customQty[id] || 1);
    if (isNaN(change) || change < 1) {
      return toast.warning('⚠️ Enter a valid quantity');
    }

    const newQty = isIncrement ? currentQty + change : currentQty - change;
    if (newQty < 0) return toast.error('❌ Quantity cannot go below 0');

    axios.patch(`${BASE_URL}/updateproductsquantity/${id}`, { quantity: newQty }, {
      headers: { Authorization: `Bearer ${user?.token}` }
    })
      .then(() => {
        toast.success(`🔄 Quantity updated to ${newQty}`);
        fetchData();
      })
      .catch(() => toast.error('❌ Error updating quantity'));
  };

  const handleQtyInputChange = (id, value) => {
    setCustomQty(prev => ({ ...prev, [id]: value }));
  };

  const getCategoryName = (id) => {
    return categories.find(c => c.id === id)?.name || '—';
  };

  const getSubcategoryName = (catId, subId) => {
    return categories
      .find(c => c.id === catId)
      ?.subcategories?.find(s => s.id === subId)?.name || '—';
  };

  const getSupplierName = (id) => {
    return suppliers.find(s => s.id === id)?.name || '—';
  };

  return (
    <div className="products-container">
      <h2>📦 Product Management</h2>

      <div className="form-container">
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select value={subcategoryId} onChange={e => setSubcategoryId(e.target.value)}>
          <option value="">Select Subcategory</option>
          {categories
            .find(c => c.id === categoryId)
            ?.subcategories?.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
        </select>

        <select value={supplierId} onChange={e => setSupplierId(e.target.value)}>
          <option value="">Select Supplier</option>
          {suppliers.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {imageUrl && (
          <img src={imageUrl} alt="preview" style={{ width: '80px', borderRadius: '8px' }} />
        )}

        <button className="add-btn" onClick={handleAdd}>➕ Add Product</button>
      </div>

      {/* Product Grid - Change this*/}
      <div className="product-grid">
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          products.map(p => (
            <div key={p.id} className="product-card">
              <img src={p.imageUrl} alt={p.name} className="product-img" />
              <div className="overlay">
                <h3>{p.name}</h3>
                <p>Category: {getCategoryName(p.category)}</p>
                <p>Subcategory: {getSubcategoryName(p.category, p.subcategory)}</p>
                <p>Suppiler Name: {getSupplierName(p.supplier)}</p>
                <p>Qty: {p.quantity}</p>
                <div className="actions">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={customQty[p.id] || ''}
                    onChange={e => handleQtyInputChange(p.id, e.target.value)}
                  />
                  <button onClick={() => updateQuantity(p.id, p.quantity, true)}>➕</button>
                  <button onClick={() => updateQuantity(p.id, p.quantity, false)}>➖</button>
                  <button onClick={() => handleDelete(p.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Products;
