import React from "react";

export default function LoadingState({ label = "Loading..." }) {
  return (
    <p className="loading-badge" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      {label}
    </p>
  );
}
