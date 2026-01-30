import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Categories.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useWindowWidth from '../hooks/useWindowWidth';

const Categories = () => {
  const [deleteMode, setDeleteMode] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubId, setSelectedSubId] = useState('');
  const [subName, setSubName] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [subcategorySearch, setSubcategorySearch] = useState('');
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const BASE_URL = 'https://olbqku3sei.execute-api.us-east-1.amazonaws.com';
  const width = useWindowWidth();
  const isMobile = width <= 768;

  useEffect(() => {
    fetchCategories();
    inputRef.current?.focus();
  }, []);

  const fetchCategories = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/getcategories`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      .then((res) => {
        const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        setCategories(data);
      })
      .catch(() => toast.error('❌ Failed to fetch categories'))
      .finally(() => setLoading(false));
  };

  const handleAdd = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return toast.warning('⚠️ Category name is required');

    const isDuplicate = categories.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicate) return toast.warning('⚠️ Duplicate category');

    setLoading(true);
    axios
      .post(`${BASE_URL}/addcategories`, { name: trimmedName, subcategories: [] }, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      .then(() => {
        setName('');
        setSelectedCategoryId('');
        fetchCategories();
        toast.success(`✅ Category "${trimmedName}" added`);
        inputRef.current?.focus();
      })
      .catch(() => toast.error('❌ Error adding category'))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    setDeleteMode(null);
    setSelectedCategoryId(null);
    const type = window.prompt('Type "category" to delete the whole category, or "subcategory" to delete a subcategory.');

    if (type === 'category') {
      if (!window.confirm('Delete this category and all its subcategories?')) return;
      setLoading(true);
      axios
        .delete(`${BASE_URL}/deletecategories/${id}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        })
        .then((res) => {
          if (res.status === 200) {
            fetchCategories();
            toast.success('🗑️ Category deleted');
          } else {
            toast.error('❌ Error deleting category');
          }
        })
        .catch((err) => {
          const msg = err.response?.data?.message || '❌ Error deleting category';
          toast.error(msg);
        })
        .finally(() => setLoading(false));
    } else if (type === 'subcategory') {
      setDeleteMode('subcategory');
      setSelectedCategoryId(id);
    } else {
      toast.info('Delete cancelled');
    }
  };

  const saveSubcategory = async () => {
    if (!subName.trim()) return toast.warning('⚠️ Enter a subcategory name');

    const parent = categories.find((cat) => cat.id === selectedCategoryId);
    if (!parent) return toast.error('❌ Parent category not found');

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/addcategories`, {
        name: subName.trim(),
        parentId: parent.id,
        subcategories: [],
      }, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      toast.success('✅ Subcategory saved');
      setSubName('');
      fetchCategories();
    } catch {
      toast.error('❌ Failed to save subcategory');
    } finally {
      setLoading(false);
    }
  };

  const deleteSubcategory = async () => {
    if (!selectedSubId) return toast.warning('⚠️ No subcategory selected');
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    setLoading(true);
    try {
      await axios.delete(`${BASE_URL}/deletecategories/${selectedSubId}?type=subcategory`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      toast.success('🗑️ Subcategory deleted');
      setSelectedSubId('');
      setSubName('');
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.message || '❌ Error deleting subcategory';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);

  const filteredSubcategories = selectedCategory?.subcategories?.filter((sub) =>
    sub.name.toLowerCase().includes(subcategorySearch.toLowerCase())
  ) || [];

  return (
    <div className="categories-container">
      <ToastContainer position="top-center" />
      <h2>📦 Category Management</h2>

      {/*Change from this */}
      <div className="category-form">
        <input
          type="text"
          placeholder="🔍 Search categories"
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
          className="search-input"
        />
        <div className="form-row">
          <select
            value={selectedCategoryId || ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              const selected = categories.find(cat => cat.id === selectedId);
              setSelectedCategoryId(selectedId);
              setName(selected?.name || '');
              setSubcategorySearch('');
              setSelectedSubId('');
              setSubName('');
            }}
          >
            <option value="">Select or add category</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            ref={inputRef}
            placeholder="Or type new category"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSelectedCategoryId('');
            }}
          />
          <button onClick={handleAdd} disabled={!name.trim() || loading}>
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </div>

        {selectedCategory && (
          <div className="subcategory-section">
            <label>Subcategories:</label>
            <input
              type="text"
              placeholder="🔍 Search subcategories"
              value={subcategorySearch}
              onChange={(e) => setSubcategorySearch(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedSubId}
              onChange={(e) => {
                const selectedId = e.target.value;
                setSelectedSubId(selectedId);
                const selectedSub = selectedCategory.subcategories?.find((sub) => sub.id === selectedId);
                setSubName(selectedSub?.name || '');
              }}
            >
              <option value="">-- Select Subcategory --</option>
              {filteredSubcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Enter subcategory name"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
            />
            <button onClick={saveSubcategory}>Save Subcategory</button>
            <button onClick={deleteSubcategory} className="danger">Remove Subcategory</button>
          </div>
        )}
      </div>

      {deleteMode === 'subcategory' && selectedCategoryId && (
      <div className="subcategory-delete-list">
        <h4>🗑️ Select subcategory to delete</h4>
        <ul>
          {categories
            .find(cat => cat.id === selectedCategoryId)
            ?.subcategories?.map(sub => (
              <li key={sub.id} className="subcategory-item-row">
                <span>{sub.name}</span>
                <button
                  className="delete-button"
                  onClick={async () => {
                    const confirm = window.confirm(`Delete subcategory "${sub.name}"?`);
                    if (!confirm) return;
                    setLoading(true);
                    try {
                      await axios.delete(`${BASE_URL}/deletecategories/${sub.id}?type=subcategory`, {
                        headers: { Authorization: `Bearer ${user?.token}` },
                      });
                      toast.success(`🗑️ Subcategory "${sub.name}" deleted`);
                      setSelectedCategoryId(null);
                      setDeleteMode(null);
                      fetchCategories();
                    } catch (err) {
                      const msg = err.response?.data?.message || '❌ Error deleting subcategory';
                      toast.error(msg);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
        </ul>
      </div>
    )}


      {!isMobile ? (
        <table className="category-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Added By</th>
              <th>Added At</th>
              <th>Subcategories</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">Loading...</td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="5">No categories found.</td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td>{cat.createdBy || 'Unknown'}</td>
                  <td>{new Date(cat.createdAt).toLocaleString()}</td>
                  <td>
                    {cat.subcategories?.length > 0 ? (
                      <ul>
                        {cat.subcategories.map((sub, i) => (
                          <li key={i}>{sub.name}</li>
                        ))}
                      </ul>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <button className="delete-button" onClick={() => handleDelete(cat.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
        <div className="category-cards">
          {filteredCategories.map((cat) => (
            <div className="category-card" key={cat.id}>
              <p><strong>Name:</strong> {cat.name}</p>
              <p><strong>By:</strong> {cat.createdBy || 'Unknown'}</p>
              <p><strong>At:</strong> {new Date(cat.createdAt).toLocaleString()}</p>
              {cat.subcategories?.length > 0 && (
                <ul>
                  {cat.subcategories.map((sub, i) => (
                    <li key={i}>{sub.name}</li>
                  ))}
                </ul>
              )}
              <button onClick={() => handleDelete(cat.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
