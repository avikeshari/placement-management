import { useEffect } from "react";

// Set the browser tab title for the current page. Falls back gracefully to
// the global title when no per-page title is supplied.
const usePageTitle = (title) => {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} — Placement Portal` : "Avi Placement Portal";
    return () => {
      document.title = previous;
    };
  }, [title]);
};

export default usePageTitle;
