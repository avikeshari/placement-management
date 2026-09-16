import { useEffect, useRef, useState } from "react";

const PromptDialog = ({ open, title, message, placeholder = "", defaultValue = "", required = false, maxLength, confirmLabel = "Confirm", cancelLabel = "Cancel", loading = false, textarea = false, onConfirm, onCancel }) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select?.();
      }, 0);
    }
  }, [open, defaultValue]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!open) return;
      if (event.key === "Escape") onCancel?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (required && !trimmed) return;
    if (maxLength && trimmed.length > maxLength) return;
    onConfirm?.(trimmed);
  };

  const sharedProps = {
    ref: inputRef,
    value,
    onChange: (event) => setValue(event.target.value),
    placeholder,
    maxLength,
    className: "mt-1 w-full border rounded-lg px-3 py-2.5",
    "aria-invalid": required && !value.trim(),
    "aria-describedby": maxLength ? "prompt-char-count" : undefined,
    disabled: loading
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={() => !loading && onCancel?.()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-dialog-title"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="prompt-dialog-title" className="text-xl font-bold">{title}</h2>
        {message && <p className="text-slate-600 mt-2 text-sm">{message}</p>}

        {textarea ? (
          <textarea rows="5" {...sharedProps} />
        ) : (
          <input type="text" {...sharedProps} />
        )}

        {maxLength && (
          <p id="prompt-char-count" className="text-xs text-slate-400 mt-1 text-right">
            {value.length}/{maxLength}
          </p>
        )}
        {required && !value.trim() && (
          <p className="text-xs text-red-500 mt-1">This field is required.</p>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || (required && !value.trim())}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg disabled:opacity-60"
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptDialog;