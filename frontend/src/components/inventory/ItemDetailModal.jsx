import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getItemBatches } from "../../api/inventory/items";

const ItemDetailModal = ({ item, open, onClose, onEdit }) => {
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);

  useEffect(() => {
    if (!open || !item) return;

    const fetchBatches = async () => {
      if (!item?.isBatchTracked) return;

      try {
        setBatchesLoading(true);
        const data = await getItemBatches(item._id);
        setBatches(data?.batches || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load batches");
      } finally {
        setBatchesLoading(false);
      }
    };

    fetchBatches();
  }, [open, item]);

  if (!open || !item) return null;

  const inv = item.inventory || {};
  const onHand = Number(inv.onHand || 0);
  const reserved = Number(inv.reserved || 0);
  const low = Number(inv.lowStockLevel || 0);
  const openingStock = Number(item.openingStock ?? inv.onHand ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
              <p className="text-xs text-gray-600 break-all">
                {item.barcode || "No barcode"}
              </p>
            </div>
            <button
              className="w-8 h-8 rounded-lg hover:bg-gray-100"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase">
                Basic
              </h4>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-900">
                    {item.category || "Uncategorized"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Base Unit</span>
                  <span className="font-medium text-gray-900">
                    {item.baseUnit}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-gray-900">
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Stock Info */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase">
                Stock
              </h4>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">On-hand</span>
                  <span className="font-bold text-gray-900">
                    {onHand} {item.baseUnit}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Opening Stock</span>
                  <span className="font-medium text-gray-900">
                    {openingStock} {item.baseUnit}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Reserved</span>
                  <span className="font-medium text-gray-900">
                    {reserved} {item.baseUnit}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Low Level</span>
                  <span className="font-medium text-gray-900">{low}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Batches */}
          {item.isBatchTracked && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase">
                Batches
              </h4>
              <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
                {batchesLoading ? (
                  <div className="p-4 text-sm text-gray-600">
                    Loading batches...
                  </div>
                ) : batches.length === 0 ? (
                  <div className="p-4 text-sm text-gray-600">
                    No batches found.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Batch
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Expiry
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                          On-hand
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                          Reserved
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                          Available
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {batches.map((b) => (
                        <tr key={b._id}>
                          <td className="px-4 py-3">{b.batchNumber || "-"}</td>
                          <td className="px-4 py-3">
                            {b.expiryDate
                              ? new Date(b.expiryDate)
                                  .toISOString()
                                  .slice(0, 10)
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {Number(b.qtyOnHand || 0)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {Number(b.reserved || 0)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {Number(b.available || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-5">
          <div className="flex justify-end gap-3">
            <button
              className="px-6 py-3 border-2 border-gray-300 rounded-xl"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl"
              onClick={() => {
                onEdit(item);
                onClose();
              }}
            >
              Edit Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
