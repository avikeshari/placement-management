import { ExternalLink } from "lucide-react";

export default function ResourceSources({ sources = [] }) {
  if (!sources.length) return null;

  return (
    <aside className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6">
      <h2 className="font-semibold text-lg">Sources & further reading</h2>
      <p className="text-sm text-slate-500 mt-1">
        Guidance below is summarized and paraphrased from university and public career-service resources.
      </p>
      <div className="mt-4 space-y-2">
        {sources.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition"
          >
            <span>{source.label}</span>
            <ExternalLink size={16} className="shrink-0" />
          </a>
        ))}
      </div>
    </aside>
  );
}
