import { useState } from "react";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import getErrorMessage from "../../utils/getErrorMessage";

const reports = [
  ["students", "Students Report", "All student accounts and status"],
  ["companies", "Companies Report", "Companies and account status"],
  ["jobs", "Jobs Report", "All job postings and requirements"],
  ["applications", "Applications Report", "Application pipeline"],
  ["placements", "Placements Report", "Selected students and offers"],
  ["placement-drives", "Placement Drives Report", "Drive participation and performance"]
];

const Reports = () => {
  const [loading, setLoading] = useState("");
  const download = async (type) => {
    try {
      setLoading(type);
      const response = await api.get(`/admin/reports/${type}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) { toast.error(getErrorMessage(error, "Unable to download report.")); }
    finally { setLoading(""); }
  };
  return <section><div className="mb-6"><h1 className="text-2xl md:text-3xl font-bold">Reports</h1><p className="text-slate-500 mt-2">Download placement-management data as CSV files.</p></div><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{reports.map(([type, title, description]) => <div key={type} className="bg-white border rounded-2xl p-6"><h2 className="font-semibold text-lg">{title}</h2><p className="text-slate-500 mt-2 min-h-12">{description}</p><button onClick={() => download(type)} disabled={loading === type} className="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600 disabled:opacity-70 text-white px-4 py-2.5 rounded-lg"><Download size={16} />{loading === type ? "Preparing..." : "Download CSV"}</button></div>)}</div></section>;
};
export default Reports;
