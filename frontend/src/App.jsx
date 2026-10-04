import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import InventoryDashboard from "./pages/InventoryDashboard";
import Login from "./pages/Login";
import StockManagement from "./pages/StockManagement";
import Transactions from "./pages/Transactions";
import "./styles.css";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<InventoryDashboard />} />
          <Route path="stock" element={<StockManagement />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}
