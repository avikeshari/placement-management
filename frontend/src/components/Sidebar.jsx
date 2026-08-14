import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  CalendarDays,
  UserRound,
  Upload
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } =
    useAuth();

  const menus = {
    student: [
      {
        label: "Dashboard",
        path: "/student",
        icon: LayoutDashboard
      },
      {
        label: "Profile",
        path: "/student/profile",
        icon: UserRound
      },
      {
        label: "Jobs",
        path: "/student/jobs",
        icon: BriefcaseBusiness
      },
      {
        label: "Applications",
        path: "/student/applications",
        icon: FileText
      },
      {
        label: "Interviews",
        path: "/student/interviews",
        icon: CalendarDays
      }
    ],

    company: [
      {
        label: "Dashboard",
        path: "/company",
        icon: LayoutDashboard
      },
      {
        label: "Profile",
        path: "/company/profile",
        icon: UserRound
      },
      {
        label: "Manage Jobs",
        path: "/company/jobs",
        icon: BriefcaseBusiness
      },
      {
        label: "Post Job",
        path: "/company/jobs/new",
        icon: FileText
      },
      {
        label: "Interviews",
        path: "/company/interviews",
        icon: CalendarDays
      }
    ],

    admin: [
      {
        label: "Dashboard",
        path: "/admin",
        icon: LayoutDashboard
      },
      {
        label: "Academic Import",
        path: "/admin/academic-import",
        icon: Upload
      }
    ]
  };

  const items =
    menus[user?.role] || [];

  return (
    <aside className="w-full border-r bg-white md:min-h-[calc(100vh-4rem)] md:w-64">
      <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col">
        {items.map(
          ({
            label,
            path,
            icon: Icon
          }) => (
            <NavLink
              key={path}
              to={path}
              end={
                path ===
                "/student" ||
                path ===
                "/company" ||
                path ===
                "/admin"
              }
              className={({
                isActive
              }) =>
                `
                flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-3 transition
                ${isActive
                  ? "bg-blue-50 font-medium text-blue-700"
                  : "text-slate-600 hover:bg-slate-50"
                }
                `
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          )
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;