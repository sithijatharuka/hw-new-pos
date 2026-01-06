import React from "react";

const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl shadow-md p-6 sm:p-7">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50">
            <span className="text-red-600 text-lg">!</span>
          </div>
          <div>
            <p className="font-semibold text-red-800 text-base">
              Error Loading Dashboard
            </p>
            <p className="text-sm mt-1 text-gray-600">{error}</p>
          </div>
        </div>
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center justify-center px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 active:scale-95 transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
