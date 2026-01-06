import toast from "react-hot-toast";

export const confirmWithToast = (message) =>
  new Promise((resolve) => {
    toast.custom(
      (t) => (
        <div className="max-w-sm w-full bg-white border border-gray-200 shadow-xl rounded-2xl px-4 py-3 text-sm flex flex-col gap-2">
          <p className="font-semibold text-gray-800">Confirm action</p>
          <p className="text-xs text-gray-600">{message}</p>
          <div className="flex justify-end gap-2 pt-1">
            <button
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary/90 text-white font-medium"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  });
