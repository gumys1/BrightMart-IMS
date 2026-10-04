import React from "react";

export default function AlertBox({ children }) {
  return (
    <div className="alert-box" role="alert">
      {children}
    </div>
  );
}
