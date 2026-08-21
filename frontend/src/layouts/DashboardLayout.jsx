import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="theme-shell min-h-screen">
      <Navbar />

      <div className="flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 pb-20">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none whitespace-nowrap">
        <p className="text-xs text-slate-400/70 font-medium tracking-wide">
          Developed by Avi Keshari
        </p>
      </div>
    </div>
  );
};

export default DashboardLayout;
