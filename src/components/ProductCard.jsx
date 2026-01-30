// src/components/ProductCard.jsx
import React from 'react';
import './ProductCard.css';

const ProductCard = ({
  product,
  categoryName,
  subcategoryName,
  supplierName,
  onDelete,
  onUpdateStock
}) => {
  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} className="product-img" />
      <div className="product-overlay">
        <h3>{product.name}</h3>
        <p><strong>Category:</strong> {categoryName}</p>
        <p><strong>Subcategory:</strong> {subcategoryName || '—'}</p>
        <p><strong>Supplier:</strong> {supplierName}</p>
        <p><strong>Stock:</strong> {product.quantity}</p>

        <div className="actions">
          <button onClick={() => onUpdateStock(product.id, 1)}>➕</button>
          <button onClick={() => onUpdateStock(product.id, -1)}>➖</button>
          <button onClick={() => onDelete(product.id)}>🗑️</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
