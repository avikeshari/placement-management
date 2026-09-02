import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Unauthorized = () => {
  const { user, logout } = useAuth();

  const homePath = user?.role === "student" ? "/student" : user?.role === "company" ? "/company" : user?.role === "admin" ? "/admin" : "/login";

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold">403</h1>
        <p className="mt-3 text-slate-500">
          You are not authorized to access this page.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link
            to={homePath}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
          >
            Return to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => { logout(); }}
            className="border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg font-medium hover:bg-slate-50"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
