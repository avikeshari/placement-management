import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import getErrorMessage from "../../utils/getErrorMessage";

const AcademicImport = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Only CSV files are allowed");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("file", file);

      const response = await api.post(
        "/academic/import",
        data
      );

      toast.success(response.data.message);
      setFile(null);

      const input = document.getElementById("academic-file");
      if (input) input.value = "";
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Import failed"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold">
        Academic Records
      </h1>

      <div className="bg-white border rounded-2xl p-6 mt-6 max-w-xl">
        <p className="text-slate-500">
          Import Student Data From CSV File
        </p>

        <div className="bg-slate-50 border rounded-xl p-4 mt-4 text-sm text-slate-600">
          <p className="font-medium text-slate-700 mb-1">
            Expected CSV columns
          </p>
          <code className="text-xs">email, name, enrollmentNumber, college, branch, semester, cgpa, backlogs</code>
          <p className="mt-2 text-xs">Each row must contain a valid student email and a GPA between 0 and 10. Imported records overwrite the student's official academic data.</p>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              const csv = ["email,name,enrollmentNumber,college,branch,semester,cgpa,backlogs", "student.demo@aviportal.com,Student Demo,EN2024001,Example College,CSE,7,9.2,0"].join("\n");
              const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
              const link = document.createElement("a");
              link.href = url;
              link.download = "academic-import-template.csv";
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="text-blue-600 underline text-xs mt-2 inline-block"
          >
            Download sample CSV template
          </a>
        </div>

        <input
          id="academic-file"
          type="file"
          accept=".csv"
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
          className="mt-6"
        />
        {file && <p className="text-xs text-slate-500 mt-2">Selected: {file.name}</p>}

        <button
          onClick={upload}
          disabled={loading}
          className="block mt-5 bg-blue-600 disabled:bg-slate-400 text-white px-5 py-2.5 rounded-lg"
        >
          {loading ? "Importing..." : "Import CSV"}
        </button>
      </div>
    </section>
  );
};

export default AcademicImport;
