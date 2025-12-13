import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Barcode from 'react-barcode';
import api from '../api';

const BarcodePrintPage = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get(`/items/${id}`);
      setItem(data);
      setTimeout(() => window.print(), 300);
    };
    load();
  }, [id]);

  if (!item) {
    return <div className="p-4 text-xs">Loading barcode…</div>;
  }

  const value = item.barcode || item.sku || item._id;

  return (
    <div className="w-full flex justify-center bg-soft print:bg-white">
      <div className="bg-white p-4 print:p-2 max-w-sm w-full text-xs">
        <div className="text-center mb-2">
          <p className="text-[11px] font-semibold truncate">
            {item.name}
          </p>
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