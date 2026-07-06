// Mock sale data for UI development
// TODO: ADD BACKEND CODE HERE — replace with real API search via returnApi.js

export const MOCK_SALES = [
  {
    _id: "sale_001",
    invoiceNumber: "INV-2024-0041",
    date: "2024-06-10",
    customerName: "Nimal Perera",
    customerPhone: "077-123-4567",
    paymentMethod: "cash",
    total: 6750.0,
    items: [
      { _id: "li_1", name: "PVC Pipe 1\"", sku: "PVC-001", barcode: "8901234560011", qty: 10, unitPrice: 150, unit: "pcs", vatApplicable: false },
      { _id: "li_2", name: "Cement Bag 50kg", sku: "CEM-050", barcode: "8901234560022", qty: 3, unitPrice: 1200, unit: "bag", vatApplicable: true },
      { _id: "li_3", name: "River Sand (cubic ft)", sku: "SND-001", barcode: "8901234560033", qty: 5, unitPrice: 450, unit: "ft³", vatApplicable: false },
    ],
  },
  {
    _id: "sale_002",
    invoiceNumber: "INV-2024-0038",
    date: "2024-06-09",
    customerName: "Kamal Silva",
    customerPhone: "071-987-6543",
    paymentMethod: "card",
    total: 4480.0,
    items: [
      { _id: "li_4", name: "Steel Rod 10mm", sku: "STL-010", barcode: "8901234560044", qty: 8, unitPrice: 560, unit: "pcs", vatApplicable: true },
    ],
  },
  {
    _id: "sale_003",
    invoiceNumber: "INV-2024-0035",
    date: "2024-06-08",
    customerName: "Sunil Fernando",
    customerPhone: "076-555-0011",
    paymentMethod: "bank",
    total: 3200.0,
    items: [
      { _id: "li_5", name: "Wall Paint 4L", sku: "PNT-004", barcode: "8901234560055", qty: 4, unitPrice: 800, unit: "tin", vatApplicable: true },
    ],
  },
];
