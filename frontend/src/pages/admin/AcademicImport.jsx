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

        <input
          id="academic-file"
          type="file"
          accept=".csv"
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
          className="mt-6"
        />

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
