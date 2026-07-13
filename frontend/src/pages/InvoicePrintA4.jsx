import React, { useEffect, useState } from "react";
import AppLoader from "../components/common/AppLoader";
import { useParams } from "react-router-dom";
import { getSale } from "../api/sales/sales";
import { getSettings } from "../api/settings/settings";
import { formatCurrency } from "../utils/currency";

const InvoicePrintA4 = ({ api }) => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState("Rs.");
  const [currencyPosition, setCurrencyPosition] = useState("before");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [saleData, settingsData] = await Promise.all([
          getSale(api, id),
          getSettings(api),
        ]);
        setSale(saleData);
        setShop(settingsData);
        setCurrencySymbol(settingsData.currencySymbol || "Rs.");
        setCurrencyPosition(settingsData.currencyPosition || "before");
        setTimeout(() => {
          window.print();
        }, 300);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading || !sale) {
    return (
      <div className="flex justify-center items-center py-6">
        <AppLoader
          open
          variant="inline"
          title="Loading invoice"
          subtitle="Preparing A4 invoice"
        />
      </div>
    );
  }

  const isTaxInvoice = sale.isTaxInvoice;
  const paidAmount =
    sale.payments?.reduce((s, p) => s + (p.amount || 0), 0) || 0;

  return (
    <div className="w-full flex justify-center bg-soft print:bg-white">
      <div className="bg-white text-xs text-gray-900 p-4 md:p-6 w-full max-w-3xl print:shadow-none shadow">
        {/* Header */}
        <div className="border-b pb-2 mb-2 text-center">
          <h1 className="text-2xl font-semibold text-primary">
            {shop?.shopName || "Your Hardware Shop Name"}
          </h1>
          <p className="text-[11px]">
            {shop?.shopAddress || "No. 123, Main Street, Colombo 10, Sri Lanka"}
          </p>
          <p className="text-[11px]">
            Tel: {shop?.shopPhone || "011-2345678"}
            {shop?.shopWhatsapp ? ` | WhatsApp: ${shop.shopWhatsapp}` : ""}
          </p>
          <p className="text-[11px]">
            VAT Reg No: {shop?.vatRegNo || "123456789-7000"}
          </p>
        </div>

        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[11px] font-semibold">
              {isTaxInvoice ? "TAX INVOICE" : "CASH BILL"}
            </p>
            <p className="text-[11px]">Bill No: {sale.billNumber}</p>
            <p className="text-[11px]">
              Date: {new Date(sale.createdAt).toLocaleString("en-LK")}
            </p>
          </div>
          <div className="text-right text-[11px]">
            {sale.customer && (
              <>
                <p className="font-semibold">Customer</p>
                <p>{sale.customer.name}</p>
                {sale.customer.address && <p>{sale.customer.address}</p>}
                {sale.customer.phone && <p>Tel: {sale.customer.phone}</p>}
              </>
            )}
          </div>
        </div>

        {/* Items table */}
        <table className="w-full text-[11px] border-t border-b border-dashed mb-2">
          <thead>
            <tr className="border-b border-dashed">
              <th className="py-1 text-left">#</th>
              <th className="py-1 text-left">Description</th>
              <th className="py-1 text-right">Qty</th>
              <th className="py-1 text-right">Rate</th>
              <th className="py-1 text-right">Discount</th>
              {isTaxInvoice && <th className="py-1 text-right">VAT</th>}
              <th className="py-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((line, index) => (
              <tr key={index} className="align-top">
                <td className="py-0.5 pr-1">{index + 1}</td>
                <td className="py-0.5 pr-1">
                  {line.description}{line.batchNumber ? ` (${line.batchNumber})` : ""}
                  <span className="block text-[10px] text-gray-500">
                    {line.unit} @{" "}
                    {formatCurrency(
                      line.unitPrice,
                      currencySymbol,
                      currencyPosition,
                    )}
                  </span>
                </td>
                <td className="py-0.5 text-right">
                  {line.qty} {line.unit}
                </td>
                <td className="py-0.5 text-right">
                  {line.unitPrice.toFixed(2)}
                </td>
                <td className="py-0.5 text-right">
                  {line.discount ? line.discount.toFixed(2) : "-"}
                </td>
                {isTaxInvoice && (
                  <td className="py-0.5 text-right">
                    {line.taxAmount?.toFixed(2)}
                  </td>
                )}
                <td className="py-0.5 text-right">
                  {line.lineTotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end mb-1">
          <table className="text-[11px]">
            <tbody>
              <tr>
                <td className="pr-4 py-0.5">Sub total</td>
                <td className="text-right py-0.5">
                  {formatCurrency(
                    sale.subTotal,
                    currencySymbol,
                    currencyPosition,
                  )}
                </td>
              </tr>
              <tr>
                <td className="pr-4 py-0.5">Discount</td>
                <td className="text-right py-0.5">
                  {formatCurrency(
                    sale.discountTotal,
                    currencySymbol,
                    currencyPosition,
                  )}
                </td>
              </tr>
              {isTaxInvoice && (
                <tr>
                  <td className="pr-4 py-0.5">VAT</td>
                  <td className="text-right py-0.5">
                    {formatCurrency(
                      sale.taxTotal,
                      currencySymbol,
                      currencyPosition,
                    )}
                  </td>
                </tr>
              )}
              <tr>
                <td className="pr-4 py-0.5 font-semibold border-t">
                  Net amount
                </td>
                <td className="text-right py-0.5 font-semibold border-t">
                  {formatCurrency(
                    sale.grandTotal,
                    currencySymbol,
                    currencyPosition,
                  )}
                </td>
              </tr>
              <tr>
                <td className="pr-4 py-0.5">Paid</td>
                <td className="text-right py-0.5">
                  {formatCurrency(paidAmount, currencySymbol, currencyPosition)}
                </td>
              </tr>
              <tr>
                <td className="pr-4 py-0.5">Balance</td>
                <td className="text-right py-0.5">
                  {formatCurrency(
                    sale.balanceDue,
                    currencySymbol,
                    currencyPosition,
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment methods summary */}
        <div className="mb-2 text-[11px]">
          <p className="font-semibold">Payment method(s):</p>
          {sale.payments?.map((p, idx) => (
            <p key={idx}>
              • {p.method.toUpperCase()} -{" "}
              {formatCurrency(p.amount, currencySymbol, currencyPosition)}
              {p.reference ? ` (Ref: ${p.reference})` : ""}
            </p>
          ))}
        </div>

        <div className="border-t border-dashed pt-2 mt-2 text-center text-[10px]">
          <p>
            Goods once sold will not be taken back. Please check items before
            leaving.
          </p>
          <p>Thank you! Come again. ❤️</p>
          <p className="mt-1 text-gray-400">
            This is a computer generated invoice. Signature not required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintA4;
