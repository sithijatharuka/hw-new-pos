import React from "react";

const GRNDetailsHeader = ({ grnNo, status, onClose }) => {
  const isDraft = status === "draft";
  const statusStyles = isDraft
    ? { background: "#fef3c7", color: "#b45309" }
    : status === "posted"
    ? { background: "#dcfce7", color: "#15803d" }
    : { background: "#e5e7eb", color: "#374151" };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: "1.3rem",
            fontWeight: "bold",
            color: "#111",
          }}
        >
          Goods Received Note (GRN)
        </h2>
        <p
          style={{
            margin: "0.5rem 0 0 0",
            fontSize: "0.875rem",
            color: "#666",
          }}
        >
          {grnNo}
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            marginTop: "0.4rem",
            padding: "0.25rem 0.65rem",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.3px",
            ...statusStyles,
          }}
        >
          {status ? status.toUpperCase() : "DRAFT"}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        style={{
          border: "none",
          background: "transparent",
          fontSize: "1.5rem",
          cursor: "pointer",
          color: "#999",
          padding: 0,
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
        }}
      >
        X
      </button>
    </div>
  );
};

export default GRNDetailsHeader;
