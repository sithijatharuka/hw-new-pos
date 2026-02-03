import React, { useEffect, useState } from "react";
import AppLoader from "../components/common/AppLoader";
import { useParams } from "react-router-dom";
import Barcode from "react-barcode";
import { getItem } from "../api/inventory/items";

const BarcodePrintPage = ({ api }) => {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await getItem(api, id);
      setItem(data);
      setTimeout(() => window.print(), 300);
    };
    load();
  }, [api, id]);

  if (!item) {
    return (
      <div className="flex justify-center items-center py-6">
        <AppLoader
          open
          variant="inline"
          title="Loading barcode"
          subtitle="Preparing barcode preview"
        />
      </div>
    );
  }

  const value = item.barcode || item.sku || item._id;

  return (
    <div className="w-full flex justify-center bg-soft print:bg-white">
      <div className="bg-white p-4 print:p-2 max-w-sm w-full text-xs">
        <div className="text-center mb-2">
          <p className="text-[11px] font-semibold truncate">{item.name}</p>
          <p className="text-[10px] text-gray-500">
            Rs. {item.sellingPrice.toFixed(2)} / {item.baseUnit}
          </p>
        </div>
        <div className="flex justify-center">
          <Barcode value={String(value)} height={40} width={1.5} displayValue />
        </div>
      </div>
    </div>
  );
};

export default BarcodePrintPage;




