import { showCustom, dismissToast } from "../../utils/toastHelper";

export const confirmWithToast = (message) =>
  new Promise((resolve) => {
    toast.custom(
      (t) => (
        <div className="flex flex-col w-full max-w-sm gap-2 px-4 py-3 text-sm bg-white border border-gray-200 shadow-xl rounded-2xl">
          <p className="font-semibold text-gray-800">Confirm action</p>
          <p className="text-xs text-gray-600">{message}</p>
          <div className="flex justify-end gap-2 pt-1">
            <button
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm text-gray-700 transition-all bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 active:scale-95"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
            >
              ✕ Cancel
            </button>
            <button
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 font-medium text-white transition-all rounded-lg cursor-pointer bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg active:scale-95"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
            >
              ✅ Confirm
            </button>
          </div>
        </div>
      ),
      { duration: Infinity },
    );
  });
