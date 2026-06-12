export default function BarcodeActions({
  item,
  onPreview,
}) {
  return (
    <div className="flex gap-2">

      <button onClick={() => onPreview(item)}>
        Preview
      </button>

      <button>
        PDF
      </button>

      <button>
        PNG
      </button>

      <button>
        Print
      </button>

    </div>
  );
}