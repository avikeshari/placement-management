const FormInput = ({
  label,
  error,
  ...props
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label}
        </label>
      )}

      <input
        {...props}
        className={`
          w-full border rounded-lg px-3 py-2.5 outline-none
          focus:ring-2 focus:ring-blue-500
          ${error ? "border-red-500" : "border-slate-300"}
        `}
      />

      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormInput;
