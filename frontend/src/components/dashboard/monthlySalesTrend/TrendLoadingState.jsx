import React from "react";

const TrendLoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
      <p className="text-xs sm:text-sm text-gray-600">Loading sales trend…</p>
    </div>
  );
};

export default TrendLoadingState;
