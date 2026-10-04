import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AlertBox from "../components/AlertBox";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <p className="eyebrow">BrightMart IMS</p>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to manage stock, suppliers, and movement history.</p>
        <form onSubmit={handleSubmit}>
          <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {error && <AlertBox>{error}</AlertBox>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting && <span className="spinner spinner-light" aria-hidden="true" />}
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
