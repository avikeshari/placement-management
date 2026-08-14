import { Menu, X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const dashboardPath =
    user?.role === "student"
      ? "/student"
      : user?.role === "company"
        ? "/company"
        : "/admin";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link to={dashboardPath} className="font-bold text-lg">
          Placement Portal
        </Link>

        <div className="hidden md:flex items-center gap-5">
          <span className="text-slate-300">{user?.name}</span>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-700 px-4 py-4">
          <p className="text-slate-300 mb-4">{user?.name}</p>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-300"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
