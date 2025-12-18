// GrnDetailsModal.jsx
import React from "react";

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatMoney = (value) => {
  const n = Number(value) || 0;
  return `Rs. ${n.toFixed(2)}`;
};

function GrnDetailsModal({ open, grn, onClose, onEdit, onDelete, onPost }) {
  if (!open || !grn) return null;

  const {
    grnNo,
    status,
    supplier,
    grnDate,
    poNumber,
    supplierInvoiceNo,
    supplierInvoiceDate,
    totalQty,
    grandTotal,
    remarks,
    lines = [],
    createdAt,
  } = grn;

  const isDraft = status === "draft";
  const statusStyles = isDraft
    ? { background: "#fef3c7", color: "#b45309" }
    : status === "posted"
    ? { background: "#dcfce7", color: "#15803d" }
    : { background: "#e5e7eb", color: "#374151" };
  const calcLineTotal = (line) => {
    const qty = Number(line.qty) || 0;
    const cost = Number(line.unitCost) || 0;
    return qty * cost;
  };

  const handleDelete = () => {
    if (!onDelete || !isDraft) return;
    if (
      window.confirm(
        "Are you sure you want to delete this GRN? This should reverse stock on server."
      )
    ) {
      onDelete();
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          maxWidth: "900px",
          width: "95%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          padding: "1.5rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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

        {/* Summary */}
        <div
          style={{
            background: "#f0f9ff",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              fontSize: "0.9rem",
            }}
          >
            <div>
              <div
                style={{
                  color: "#0369a1",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  marginBottom: "0.25rem",
                }}
              >
                Supplier
              </div>
              <div style={{ color: "#111", fontWeight: "600" }}>
                {supplier?.name || "-"}
              </div>
            </div>

            <div>
              <div
                style={{
                  color: "#0369a1",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  marginBottom: "0.25rem",
                }}
              >
                GRN Date
              </div>
              <div style={{ color: "#111", fontWeight: "600" }}>
                {formatDate(grnDate)}
              </div>
            </div>

            <div>
              <div
                style={{
                  color: "#0369a1",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  marginBottom: "0.25rem",
                }}
              >
                Total Qty
              </div>
              <div style={{ color: "#111", fontWeight: "600" }}>
                {totalQty ?? "-"}
              </div>
            </div>

            <div>
              <div
                style={{
                  color: "#0369a1",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  marginBottom: "0.25rem",
                }}
              >
                Grand Total
              </div>
              <div style={{ color: "#111", fontWeight: "600" }}>
                {formatMoney(grandTotal)}
              </div>
            </div>

            {poNumber && (
              <div>
                <div
                  style={{
                    color: "#0369a1",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    marginBottom: "0.25rem",
                  }}
                >
                  PO Number
                </div>
                <div style={{ color: "#111", fontWeight: "600" }}>
                  {poNumber}
                </div>
              </div>
            )}

            {supplierInvoiceNo && (
              <div>
                <div
                  style={{
                    color: "#0369a1",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    marginBottom: "0.25rem",
                  }}
                >
                  Supplier Invoice
                </div>
                <div style={{ color: "#111", fontWeight: "600" }}>
                  {supplierInvoiceNo}
                </div>
              </div>
            )}
          </div>

          {remarks && (
            <div
              style={{
                marginTop: "0.75rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid #bfdbfe",
              }}
            >
              <div
                style={{
                  color: "#0369a1",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  marginBottom: "0.25rem",
                }}
              >
                Remarks
              </div>
              <div
                style={{
                  color: "#111",
                  whiteSpace: "pre-wrap",
                  fontSize: "0.9rem",
                }}
              >
                {remarks}
              </div>
            </div>
          )}
        </div>

        {/* Lines */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{
              margin: "0 0 0.75rem 0",
              fontSize: "1rem",
              fontWeight: "600",
              color: "#111",
            }}
          >
            Items ({lines.length})
          </h3>

          {lines.length === 0 ? (
            <p style={{ color: "#999", fontSize: "0.9rem" }}>
              No items in this GRN.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  overflow: "hidden",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "#666",
                      }}
                    >
                      Item
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "#666",
                      }}
                    >
                      SKU
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "#666",
                      }}
                    >
                      Batch
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "#666",
                      }}
                    >
                      Qty
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "#666",
                      }}
                    >
                      Unit Cost
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "#666",
                      }}
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => {
                    const item = line.item || {};
                    return (
                      <tr
                        key={idx}
                        style={{ borderBottom: "1px solid #f3f4f6" }}
                      >
                        <td style={{ padding: "0.75rem", color: "#111" }}>
                          {item.name || "-"}
                        </td>
                        <td style={{ padding: "0.75rem", color: "#666" }}>
                          {item.sku || "-"}
                        </td>
                        <td style={{ padding: "0.75rem", color: "#666" }}>
                          {line.batchNumber || "-"}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem",
                            textAlign: "right",
                            color: "#111",
                            fontWeight: "500",
                          }}
                        >
                          {line.qty}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem",
                            textAlign: "right",
                            color: "#666",
                          }}
                        >
                          {formatMoney(line.unitCost)}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem",
                            textAlign: "right",
                            color: "#111",
                            fontWeight: "600",
                          }}
                        >
                          {formatMoney(calcLineTotal(line))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid #e5e7eb",
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          <div>
            <div style={{ color: "#666", marginBottom: "0.25rem" }}>
              Created On
            </div>
            <div style={{ fontWeight: "600", color: "#111" }}>
              {formatDate(createdAt)}
            </div>
          </div>
          <div>
            <div style={{ color: "#666", marginBottom: "0.25rem" }}>
              Supplier Invoice Date
            </div>
            <div style={{ fontWeight: "600", color: "#111" }}>
              {formatDate(supplierInvoiceDate)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {isDraft && onPost && (
            <button
              onClick={() => {
                onPost();
                onClose();
              }}
              style={{
                padding: "0.625rem 1rem",
                background: "#dcfce7",
                color: "#15803d",
                border: "1px solid #bbf7d0",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Post GRN
            </button>
          )}

          {isDraft && onEdit && (
            <button
              onClick={() => {
                onEdit();
                onClose();
              }}
              style={{
                padding: "0.625rem 1rem",
                background: "#dbeafe",
                color: "#0369a1",
                border: "1px solid #bfdbfe",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Edit GRN
            </button>
          )}

          {isDraft && onDelete && (
            <button
              onClick={handleDelete}
              style={{
                padding: "0.625rem 1rem",
                background: "#fee2e2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Delete GRN
            </button>
          )}

          {!isDraft && (
            <div
              style={{
                alignSelf: "center",
                fontSize: "0.85rem",
                color: "#6b7280",
                fontWeight: 500,
                marginRight: "auto",
              }}
            >
              Posted GRNs cannot be edited or deleted.
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              padding: "0.625rem 1rem",
              background: "#e5e7eb",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default GrnDetailsModal;








