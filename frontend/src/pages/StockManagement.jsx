import React from "react";
import { useState } from "react";
import { api, TRANSACTION_UPDATED_EVENT } from "../services/api";
import AlertBox from "../components/AlertBox";

const initialReceivedForm = {
  product_id: "",
  quantity: "",
  notes: "",
  supplier_id: "",
};

const initialIssuedForm = {
  product_id: "",
  quantity: "",
  notes: "",
};

function getErrorMessage(error) {
  return error.response?.data?.detail || error.response?.data?.message || error.message;
}

function TransactionForm({ title, fields, initialValues, submitLabel, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await onSubmit({
        ...values,
        product_id: Number(values.product_id),
        quantity: Number(values.quantity),
        ...(values.supplier_id !== undefined && { supplier_id: Number(values.supplier_id) }),
      });
      setValues(initialValues);
      setSuccess("Transaction submitted successfully.");
      window.dispatchEvent(new Event(TRANSACTION_UPDATED_EVENT));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="empty-panel">
      <h3>{title}</h3>
      <form onSubmit={handleSubmit}>
        {fields.map((field) => (
          <label key={field.name}>
            {field.label}
            <input
              name={field.name}
              type={field.type || "text"}
              min={field.type === "number" ? "1" : undefined}
              value={values[field.name]}
              onChange={handleChange}
              required={field.required}
            />
          </label>
        ))}
        {error && <AlertBox>{error}</AlertBox>}
        {success && <p className="form-success" role="status">{success}</p>}
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting && <span className="spinner spinner-light" aria-hidden="true" />}
          {isSubmitting ? "Submitting..." : submitLabel}
        </button>
      </form>
    </section>
  );
}

const receivedFields = [
  { name: "product_id", label: "Product ID", type: "number", required: true },
  { name: "quantity", label: "Quantity", type: "number", required: true },
  { name: "supplier_id", label: "Supplier ID", type: "number", required: true },
  { name: "notes", label: "Notes" },
];

const issuedFields = [
  { name: "product_id", label: "Product ID", type: "number", required: true },
  { name: "quantity", label: "Quantity", type: "number", required: true },
  { name: "notes", label: "Notes" },
];

export default function StockManagement() {
  return (
    <section>
      <header className="page-header"><div><p className="eyebrow">Operations</p><h2>Stock management</h2><p className="muted">Receive incoming goods or issue stock against the protected API.</p></div></header>
      <div className="form-grid">
        <TransactionForm
          title="Stock received"
          fields={receivedFields}
          initialValues={initialReceivedForm}
          submitLabel="Record stock received"
          onSubmit={api.receiveStock}
        />
        <TransactionForm
          title="Stock issued"
          fields={issuedFields}
          initialValues={initialIssuedForm}
          submitLabel="Record stock issued"
          onSubmit={api.issueStock}
        />
      </div>
    </section>
  );
}
