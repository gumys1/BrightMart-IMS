import React from "react";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import AlertBox from "../components/AlertBox";
import LoadingState from "../components/LoadingState";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.products(), api.lowStockProducts()])
      .then(([productData, lowStockData]) => {
        setProducts(productData.results || productData);
        setLowStock(lowStockData.results || lowStockData);
      })
      .catch((requestError) => setError(requestError.response?.data?.detail || requestError.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section>
      <header className="page-header"><div><p className="eyebrow">Overview</p><h2>Inventory dashboard</h2></div></header>
      {error && <AlertBox>{error}</AlertBox>}
      {isLoading && <LoadingState label="Loading products..." />}
      <div className="metric-grid">
        <article className="metric-card"><span>Tracked products</span><strong>{products.length}</strong></article>
        <article className="metric-card alert"><span>Low-stock alerts</span><strong>{lowStock.length}</strong></article>
      </div>
      <section className="table-panel"><div className="panel-heading"><h3>Low-stock attention</h3><span>Manager view</span></div>
        {isLoading ? <LoadingState label="Loading stock alerts..." /> : lowStock.length ? <ul className="alert-list">{lowStock.map((product) => <li key={product.id}><span>{product.name}</span><strong>{product.current_quantity} left</strong></li>)}</ul> : <p className="muted">All inventory levels are healthy.</p>}
      </section>
    </section>
  );
}
