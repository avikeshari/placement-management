/*import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;*/
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <div className="flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 pb-20">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Developer Watermark */}
      <div
        className="
          fixed
          bottom-2
          left-1/2
          -translate-x-1/2
          z-50
          pointer-events-none
          select-none
          whitespace-nowrap
          text-[11px]
          sm:text-xs
          font-medium
          tracking-wide
          text-slate-400/80
        "
      >
        Developed by Avi Keshari
      </div>

    </div>
  );
};

export default DashboardLayout;