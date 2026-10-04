import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import AlertBox from "../components/AlertBox";
import LoadingState from "../components/LoadingState";

export default function InventoryDashboard() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");

  useEffect(() => {
    Promise.all([api.products(), api.lowStockProducts()])
      .then(([productData, lowStockData]) => {
        setProducts(productData.results || productData);
        setLowStock(lowStockData.results || lowStockData);
      })
      .catch((requestError) => setError(requestError.response?.data?.detail || requestError.message))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].sort();
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.trim().toLowerCase();
    const name = String(product.name || "").toLowerCase();
    const sku = String(product.sku || "").toLowerCase();
    const quantity = Number(product.current_quantity);
    const reorderThreshold = Number(product.reorder_threshold);

    const matchesSearch = !search || name.includes(search) || sku.includes(search);
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesStockStatus =
      stockStatus === "all" ||
      (stockStatus === "in-stock" && quantity > reorderThreshold) ||
      (stockStatus === "low-stock" && quantity > 0 && quantity <= reorderThreshold) ||
      (stockStatus === "out-of-stock" && quantity === 0);

    return matchesSearch && matchesCategory && matchesStockStatus;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setStockStatus("all");
  };

  return (
    <section>
      <header className="page-header"><div><p className="eyebrow">Overview</p><h2>Inventory dashboard</h2></div></header>
      {error && <AlertBox>{error}</AlertBox>}
      {isLoading && <LoadingState label="Loading products..." />}
      <div className="metric-grid">
        <article className="metric-card"><span>Tracked products</span><strong>{products.length}</strong></article>
        <article className="metric-card alert"><span>Low-stock alerts</span><strong>{lowStock.length}</strong></article>
      </div>
      <section className="table-panel">
        <div className="panel-heading"><h3>All products</h3><span>Inventory details</span></div>
        <div className="filter-bar">
          <label>
            Search products
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or SKU"
            />
          </label>
          <label>
            Category
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label>
            Stock status
            <select value={stockStatus} onChange={(event) => setStockStatus(event.target.value)}>
              <option value="all">All</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </label>
          <button type="button" className="secondary-button" onClick={clearFilters}>Clear</button>
        </div>
        {isLoading ? <LoadingState label="Loading products..." /> : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock quantity</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length ? filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.sku}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{Number(product.unit_price).toFixed(2)}</td>
                    <td>{product.current_quantity}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="empty-table-message">No matching products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="table-panel"><div className="panel-heading"><h3>Low-stock attention</h3><span>Manager view</span></div>
        {isLoading ? <LoadingState label="Loading stock alerts..." /> : lowStock.length ? <ul className="alert-list">{lowStock.map((product) => <li key={product.id}><span>{product.name}</span><strong>{product.current_quantity} left</strong></li>)}</ul> : <p className="muted">All inventory levels are healthy.</p>}
      </section>
    </section>
  );
}
