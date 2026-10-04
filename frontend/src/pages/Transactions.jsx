import React from "react";
import { useEffect, useState } from "react";
import { api, TRANSACTION_UPDATED_EVENT } from "../services/api";
import AlertBox from "../components/AlertBox";
import LoadingState from "../components/LoadingState";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function fetchTransactions() {
      setIsLoading(true);
      setError("");
      return api.transactions()
        .then((data) => setTransactions(data.results || data))
        .catch((requestError) => setError(requestError.response?.data?.detail || requestError.message))
        .finally(() => setIsLoading(false));
    }

    fetchTransactions();
    window.addEventListener(TRANSACTION_UPDATED_EVENT, fetchTransactions);

    return () => {
      window.removeEventListener(TRANSACTION_UPDATED_EVENT, fetchTransactions);
    };
  }, []);

  return (
    <section>
      <header className="page-header"><div><p className="eyebrow">Audit trail</p><h2>Transactions</h2></div></header>
      {error && <AlertBox>{error}</AlertBox>}
      <div className="table-panel">
        {isLoading ? <LoadingState label="Loading transactions..." /> : (
          <div className="table-scroll">
            <table><thead><tr><th>Type</th><th>Product</th><th>Quantity</th><th>Date</th></tr></thead><tbody>{transactions.map((item) => <tr key={item.id}><td>{item.transaction_type}</td><td>{item.product}</td><td>{item.quantity}</td><td>{new Date(item.transaction_date).toLocaleString()}</td></tr>)}</tbody></table>
          </div>
        )}
      </div>
    </section>
  );
}
