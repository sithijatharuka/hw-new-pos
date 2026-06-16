import bwipjs from "bwip-js";

export const generateBarcodeImage = async (
  barcode
) => {
  return bwipjs.toBuffer({
    bcid: "code128",
    text: barcode,
    scale: 3,
    height: 10,
    includetext: true,
  });
};