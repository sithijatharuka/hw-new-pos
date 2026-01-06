import React from "react";

const GRNListModal = ({
  open,
  supplier,
  grnsList,
  loading,
  onClose,
  onSelectGRN,
}) => {
  if (!open || !supplier) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              GRNs - {supplier.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {grnsList.length} Goods Received Notes
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-500 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="text-center py-10">Loading…</div>
          ) : grnsList.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No GRNs found</div>
          ) : (
            <div className="space-y-3">
              {grnsList.map((grn) => {
                const statusClasses =
                  grn.status === "posted"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-amber-100 text-amber-700 border border-amber-200";

                return (
                  <div
                    key={grn._id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm cursor-pointer"
                    onClick={() => onSelectGRN(grn)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900">
                            {grn.grnNo}
                          </div>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusClasses}`}
                          >
                            {(grn.status || "draft").toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Date: {new Date(grn.grnDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          Rs. {Number(grn.grandTotal || 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {grn.lines?.length || 0} items
                        </div>
                      </div>
                    </div>
                    {grn.remarks && (
                      <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {grn.remarks}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GRNListModal;
