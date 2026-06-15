export default function BarcodeActions({
  item,
  onPreview,
}) {
  return (
    <div className="flex gap-2">

      <button onClick={() => onPreview(item)}>
        Preview
      </button>

      {/* TODO: implement backend code here – wire PDF download via downloadBarcodePDF(item._id) */}
      <button disabled title="PDF download – backend required">
        PDF
      </button>

      {/* TODO: implement backend code here – wire PNG download via downloadBarcodePNG(item._id) */}
      <button disabled title="PNG download – backend required">
        PNG
      </button>

      {/* TODO: implement backend code here – wire print via saved item id */}
      <button disabled title="Print – backend required">
        Print
      </button>

    </div>
  );
}