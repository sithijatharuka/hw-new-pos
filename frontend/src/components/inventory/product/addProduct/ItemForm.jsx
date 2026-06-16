import React from "react";
import EssentialInformation from "./productForm/EssentialInformation";
import PricingSection from "./productForm/PricingSection";
import StockPolicySection from "./productForm/StockPolicySection";
import TaxSettings from "./productForm/TaxSettings";
import TrackingMode from "./productForm/TrackingMode";
import SupplierStatus from "./productForm/SupplierStatus";

const ItemForm = ({
  api,
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
}) => {
  return (
    <div className="p-4 space-y-8 sm:p-6">
      <EssentialInformation
        api={api}
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
    </div>
  );
};

export default ItemForm;
