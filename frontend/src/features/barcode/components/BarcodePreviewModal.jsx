export default function BarcodePreviewModal({
  item,
  onClose,
}) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white p-4 rounded w-[350px]">

        <h2 className="font-bold mb-2">
          Barcode Preview
        </h2>

        <p>{item.name}</p>
        <p>SKU: {item.sku}</p>
        <p>Price: Rs. {item.sellingPrice}</p>

        <img
          className="mt-2"
          src={item.barcodeImage}
          alt="barcode"
        />

        <button
          className="mt-3 bg-red-500 text-white px-3 py-1"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}