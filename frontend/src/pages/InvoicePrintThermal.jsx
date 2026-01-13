import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSale } from "../api/sales/sales";
import { getSettings } from "../api/settings/settings";

const InvoicePrintThermal = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [saleData, settingsData] = await Promise.all([
          getSale(id),
          getSettings(),
        ]);
        setSale(saleData);
        setShop(settingsData);
        setTimeout(() => {
          window.print();
        }, 200);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading || !sale) {
    return <div className="p-3 text-[11px]">Loading receipt…</div>;
  }

  const isTaxInvoice = sale.isTaxInvoice;
  const paidAmount =
    sale.payments?.reduce((s, p) => s + (p.amount || 0), 0) || 0;

  return (
    <div className="w-full flex justify-center bg-soft print:bg-white">
      {/* For 80mm, keep width narrow */}
      <div className="bg-white text-[10px] text-gray-900 p-3 w-full max-w-xs print:shadow-none shadow receipt-80">
        <div className="text-center mb-1">
          <p className="font-semibold text-[12px]">
            {shop?.shopName || "Your Hardware Shop Name"}
          </p>
          <p>{shop?.shopAddress || "No. 123, Main Street, Colombo 10"}</p>
          <p>Tel: {shop?.shopPhone || "011-2345678"}</p>
          {isTaxInvoice && <p>VAT: {shop?.vatRegNo || "123456789-7000"}</p>}
        </div>

        <div className="border-b border-dashed mb-1 pb-1 text-left">
          <p className="font-semibold">
            {isTaxInvoice ? "TAX INVOICE" : "CASH BILL"}
          </p>
          <p>Bill: {sale.billNumber}</p>
          <p>Date: {new Date(sale.createdAt).toLocaleString("en-LK")}</p>
          {sale.customer && (
            <>
              <p className="mt-1">Cus: {sale.customer.name}</p>
              {sale.customer.phone && <p>Tel: {sale.customer.phone}</p>}
            </>
          )}
        </div>

        {/* Items */}
        <div className="border-b border-dashed pb-1 mb-1">
          {sale.items.map((line, idx) => {
            const qty = Number(line.qty) || 0;
            const rate = Number(line.unitPrice) || 0;
            const baseBeforeDisc = qty * rate;
            const discPercent = Number(line.discount) || 0;
            const discAmount = baseBeforeDisc * (discPercent / 100);

            return (
              <div key={idx} className="mb-0.5">
                <div className="flex justify-between">
                  <span>
                    {idx + 1}. {line.description}
                  </span>
                  <span className="min-w-[60px] text-right">
                    {line.lineTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[9px] text-gray-500">
                  <span>
                    {line.qty} {line.unit} × {rate.toFixed(2)}
                    {discPercent
                      ? ` (-${discAmount.toFixed(2)} / ${discPercent.toFixed(
                          2
                        )}%)`
                      : ""}
                    {isTaxInvoice && line.taxAmount
                      ? ` + VAT ${line.taxAmount.toFixed(2)}`
                      : ""}
                  </span>
                  <span>Base {baseBeforeDisc.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="mb-1">
          <div className="flex justify-between">
            <span>Sub total</span>
            <span>{sale.subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span>{sale.discountTotal.toFixed(2)}</span>
          </div>
          {isTaxInvoice && (
            <div className="flex justify-between">
              <span>VAT</span>
              <span>{sale.taxTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold border-t border-dashed mt-1 pt-1">
            <span>Net</span>
            <span>{sale.grandTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid</span>
            <span>{paidAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Balance</span>
            <span>{sale.balanceDue.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mb-1">
          {sale.payments?.map((p, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{p.method.toUpperCase()}</span>
              <span>{p.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed pt-1 mt-1 text-center">
          <p>Goods once sold will not be taken back.</p>
          <p>Thank you! Come again.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintThermal;
