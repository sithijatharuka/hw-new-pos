// GrnDetailsModal.jsx
import React from "react";
import GRNDetailsHeader from "./GRNDetailsHeader";
import GRNDetailsSummary from "./GRNDetailsSummary";
import GRNDetailsLineItemsTable from "./GRNDetailsLineItemsTable";
import GRNDetailsFooter from "./GRNDetailsFooter";
import GRNDetailsActions from "./GRNDetailsActions";

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
        <GRNDetailsHeader grnNo={grnNo} status={status} onClose={onClose} />

        <GRNDetailsSummary
          supplier={supplier}
          grnDate={grnDate}
          totalQty={totalQty}
          grandTotal={grandTotal}
          poNumber={poNumber}
          supplierInvoiceNo={supplierInvoiceNo}
          remarks={remarks}
        />

        <GRNDetailsLineItemsTable lines={lines} />

        <GRNDetailsFooter
          createdAt={createdAt}
          supplierInvoiceDate={supplierInvoiceDate}
        />

        <GRNDetailsActions
          isDraft={isDraft}
          onPost={onPost}
          onEdit={onEdit}
          onDelete={onDelete}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

export default GrnDetailsModal;
