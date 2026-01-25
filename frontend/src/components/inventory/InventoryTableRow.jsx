import React from "react";

const InventoryTableRow = ({
  item,
  onEdit,
  onDetails,
  onActivate,
  onDeactivate,
  onDelete,
  onPrintBarcode,
}) => {
  const inv = item.inventory || {};
  const onHand = Number(inv.onHand || 0);
  const lowLevel = Number(inv.lowStockLevel || 0);
  const low = onHand <= lowLevel;

  return (
    <tr
      className="hover:bg-gray-50/50 cursor-pointer"
      onClick={() => onDetails(item)}
    >
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900 flex items-center gap-2">
          <span className="truncate max-w-[260px]">{item.name}</span>
          {!item.isActive && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
              Inactive
            </span>
          )}
          {item.isBatchTracked && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              Batch
            </span>
          )}
          {low && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800">
              Low
            </span>
          )}
        </div>
        {item.barcode && (
          <div className="text-xs text-gray-500 mt-1 break-all">
            📟 {item.barcode}
          </div>
        )}
      </td>

      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {item.category || "Uncategorized"}
        </span>
      </td>

      <td className="px-6 py-4">
        <span
          className={`text-sm font-bold ${
            low ? "text-red-600" : "text-gray-900"
          }`}
        >
          {onHand} {item.baseUnit}
        </span>
      </td>

      <td className="px-6 py-4">
        <span className="text-sm font-bold text-primary">
          Rs. {Number(item.sellingPrice || 0).toFixed(2)}
        </span>
      </td>

      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => onEdit(item)}
          >
            Edit
          </button>

          {item.isActive ? (
            <button
              className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={() => onDeactivate(item._id)}
            >
              Deactivate
            </button>
          ) : (
            <button
              className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => onActivate(item._id)}
            >
              Activate
            </button>
          )}

          <button
            className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => onDelete(item._id)}
          >
            Delete
          </button>

          <button
            className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => onPrintBarcode(item._id)}
          >
            Print Barcode
          </button>
        </div>
      </td>
    </tr>
  );
};

export default InventoryTableRow;
