import { CircleAlert } from "lucide-react";

const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onCancel
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={() => !loading && onCancel?.()}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start gap-3">
          <CircleAlert size={24} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {message && <p className="text-slate-600 mt-2 text-sm">{message}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="border px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              danger
                ? "bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                : "bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            }
          >
            {loading ? "Working..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
