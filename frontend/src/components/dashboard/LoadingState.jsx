import React from "react";

const LoadingState = () => {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <p className="text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingState;
