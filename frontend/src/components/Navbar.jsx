import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/stock", label: "Stock Management" },
  { to: "/transactions", label: "Transactions" },
];

export default function Navbar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="brand-mark" aria-hidden="true">BM</div>
      <div>
        <p className="eyebrow">BrightMart</p>
        <h1>Inventory control</h1>
      </div>
      <nav aria-label="Main navigation">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === "/"}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button className="sign-out" onClick={handleSignOut}>Sign out</button>
    </aside>
  );
}
