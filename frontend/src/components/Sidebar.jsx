import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  CalendarDays,
  UserRound,
  Upload,
  Users,
  Building2,
  BarChart3,
  FileSpreadsheet,
  UserRoundCog,
  MessageCircle,
  CalendarRange,
  UserCheck
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

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
      { label: "Interviews", path: "/student/interviews", icon: CalendarDays },
      { label: "Placement Drives", path: "/student/drives", icon: CalendarDays },
      { label: "Saved Jobs", path: "/student/saved-jobs", icon: BriefcaseBusiness },
      { label: "Saved Searches", path: "/student/saved-searches", icon: FileText },
      { label: "Career Events", path: "/student/events", icon: CalendarRange },
      { label: "Notifications", path: "/student/notifications", icon: MessageCircle },
      { label: "Career Resources", path: "/student/resources", icon: FileText },
      { label: "Privacy & Preferences", path: "/student/settings", icon: UserRoundCog },
      { label: "Messages", path: "/messages", icon: MessageCircle }
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
      },
      { label: "Messages", path: "/messages", icon: MessageCircle },
      { label: "Talent Search", path: "/company/talent", icon: Users },
      { label: "Saved Candidates", path: "/company/saved-candidates", icon: UserCheck },
      { label: "Notifications", path: "/company/notifications", icon: MessageCircle }
    ],
    admin: [
      { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
      { label: "Students", path: "/admin/students", icon: Users },
      { label: "Companies", path: "/admin/companies", icon: Building2 },
      { label: "Jobs", path: "/admin/jobs", icon: BriefcaseBusiness },
      { label: "Applications", path: "/admin/applications", icon: FileText },
      { label: "Interviews", path: "/admin/interviews", icon: CalendarDays },
      { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
      { label: "Academic Import", path: "/admin/academic-import", icon: Upload },
      { label: "Reports", path: "/admin/reports", icon: FileSpreadsheet },
      { label: "Placement Drives", path: "/admin/drives", icon: CalendarRange },
      { label: "Employer Verification", path: "/admin/verification", icon: UserCheck },
      { label: "Career Events", path: "/admin/events", icon: CalendarRange },
      { label: "Audit Logs", path: "/admin/audit-logs", icon: FileSpreadsheet },
      { label: "Profile", path: "/admin/profile", icon: UserRoundCog }
    ]
  };

  const items = menus[user?.role] || [];

  return (
    <aside className="theme-panel border-r w-full md:w-64 md:min-h-[calc(100vh-4rem)]">
      <nav className="flex md:flex-col overflow-x-auto gap-1 p-3">
        {items.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={
              path === "/student" ||
              path === "/company" ||
              path === "/admin"
            }
            className={({ isActive }) =>
              `
              flex items-center gap-3 whitespace-nowrap px-4 py-3 rounded-lg transition
              ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }
              `
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
