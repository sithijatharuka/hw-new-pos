import React from "react";
import EssentialInformation from "./productForm/EssentialInformation";
import PricingSection from "./productForm/PricingSection";
import StockPolicySection from "./productForm/StockPolicySection";
import TaxSettings from "./productForm/TaxSettings";
import TrackingMode from "./productForm/TrackingMode";
import SupplierStatus from "./productForm/SupplierStatus";
import UnitConversions from "./productForm/UnitConversions";

const ItemForm = ({
  form,
  errs,
  hasSubmitted,
  categories,
  customCategories,
  baseUnits,
  customBaseUnits,
  suppliers,
  onCategoryAdd,
  onCategoryDelete,
  onBaseUnitAdd,
  onBaseUnitDelete,
  updateField,
  setError,
  addUnitRow,
  updateUnitRow,
  removeUnitRow,
}) => {
  return (
    <div className="p-4 sm:p-6 space-y-8">
      <EssentialInformation
        form={form}
        errs={errs}
        hasSubmitted={hasSubmitted}
        categories={categories}
        customCategories={customCategories}
        baseUnits={baseUnits}
        customBaseUnits={customBaseUnits}
        onCategoryAdd={onCategoryAdd}
        onCategoryDelete={onCategoryDelete}
        onBaseUnitAdd={onBaseUnitAdd}
        onBaseUnitDelete={onBaseUnitDelete}
        updateField={updateField}
        setError={setError}
      />

      <PricingSection form={form} errs={errs} updateField={updateField} />

      <StockPolicySection form={form} errs={errs} updateField={updateField} />

      <TaxSettings form={form} errs={errs} updateField={updateField} />

      <TrackingMode form={form} errs={errs} updateField={updateField} />

      <SupplierStatus
        form={form}
        suppliers={suppliers}
        updateField={updateField}
      />

      <UnitConversions
        form={form}
        errs={errs}
        updateField={updateField}
        addUnitRow={addUnitRow}
        updateUnitRow={updateUnitRow}
        removeUnitRow={removeUnitRow}
      />
    </div>
  );
};

export default ItemForm;
