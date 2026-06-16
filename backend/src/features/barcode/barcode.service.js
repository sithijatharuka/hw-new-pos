import Item from "../../models/Item.js";
import { validateBarcode } from "./barcode.validation.js";

class BarcodeService {
  async validate(data) {
    return validateBarcode(data);
  }

  async getItemByBarcode(
    barcode,
    tenantId
  ) {
    const item = await Item.findOne({
      barcode,
      tenantId,
    });

    if (!item) {
      throw new Error(
        "No item found for this barcode."
      );
    }

    return item;
  }

  async previewBarcode(
    itemId,
    tenantId
  ) {
    const item = await Item.findOne({
      _id: itemId,
      tenantId,
    });

    if (!item) {
      throw new Error("Item not found");
    }

    return item;
  }
}

export default new BarcodeService();