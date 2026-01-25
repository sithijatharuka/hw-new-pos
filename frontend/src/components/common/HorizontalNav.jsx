import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadItems } from "../../api/inventory/items";

const HorizontalNav = () => {
  const navigate = useNavigate();
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLowStockItems();
    // Refresh every 5 minutes
    const interval = setInterval(fetchLowStockItems, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      const items = await loadItems("", true); // lowStock = true
      setLowStockItems(items);
    } catch (error) {
      console.error("Failed to load low stock items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInventory = () => {
    setShowDropdown(false);
    navigate("/inventory");
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-end px-4 py-3">
        {/* Low Stock Notification Icon */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 transition-colors rounded-lg cursor-pointer hover:bg-gray-100"
            title="Low Stock Alerts"
          >
            {/* Bell Icon */}
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {/* Badge */}
            {lowStockItems.length > 0 && (
              <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-1 -right-1">
                {lowStockItems.length}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 z-50 overflow-hidden bg-white border border-gray-200 shadow-2xl top-12 w-80 rounded-xl max-h-96">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">
                  Low Stock Alerts
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  {lowStockItems.length} item(s) need restocking
                </p>
              </div>

              <div className="overflow-y-auto max-h-64">
                {loading ? (
                  <div className="p-4 text-sm text-center text-gray-600">
                    Loading...
                  </div>
                ) : lowStockItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mb-2 text-4xl">✅</div>
                    <p className="text-sm font-medium text-gray-900">
                      All items stocked!
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      No low stock alerts at this time
                    </p>
                  </div>
                ) : (
                  lowStockItems.map((item) => {
                    const onHand = item.inventory?.onHand || 0;
                    const lowLevel = item.lowStockLevel || 0;
                    return (
                      <div
                        key={item._id}
                        className="p-4 transition-colors border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setShowDropdown(false);
                          navigate("/inventory");
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-600">
                              SKU: {item.sku}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs font-semibold text-red-600">
                              {onHand} {item.baseUnit}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Min: {lowLevel}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {lowStockItems.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={handleViewInventory}
                    className="w-full px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg cursor-pointer bg-primary hover:bg-primary/90"
                  >
                    View All Inventory
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default HorizontalNav;
