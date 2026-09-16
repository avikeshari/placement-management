const Pagination = ({ page, totalPages, onChange, className = "" }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 2) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav aria-label="Pagination" className={`flex items-center justify-center gap-1 mt-4 ${className}`}>
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-2 border rounded-lg disabled:opacity-40"
      >
        Previous
      </button>
      {pages.map((item, index) =>
        item === "..." ? (
          <span key={`dots-${index}`} className="px-2 text-slate-500">…</span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            aria-label={`Page ${item}`}
            onClick={() => onChange(item)}
            className={`px-3 py-2 rounded-lg ${item === page ? "bg-blue-600 text-white" : "border hover:bg-slate-50"}`}
          >
            {item}
          </button>
        )
      )}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-2 border rounded-lg disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;