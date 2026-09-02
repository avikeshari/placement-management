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
  Bookmark,
  Bell,
  Search,
  Heart,
  CalendarRange,
  BookOpen,
  ClipboardCheck,
  ScrollText,
  BadgeCheck,
  UserSearch,
  Star,
  Settings,
  Rocket,
  Sparkles,
  GraduationCap
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menus = {
  student: [
    { label: "Dashboard", path: "/student", icon: LayoutDashboard },
    { label: "Profile", path: "/student/profile", icon: UserRound },
    { label: "Academic Records", path: "/student/academic", icon: GraduationCap },
    { label: "Jobs", path: "/student/jobs", icon: BriefcaseBusiness },
    { label: "Saved Jobs", path: "/student/saved-jobs", icon: Bookmark },
    { label: "Applications", path: "/student/applications", icon: FileText },
    { label: "Interviews", path: "/student/interviews", icon: CalendarDays },
    { label: "Messages", path: "/messages", icon: MessageCircle },
    { label: "Notifications", path: "/student/notifications", icon: Bell },
    { label: "Saved Searches & Alerts", path: "/student/saved-searches", icon: Search },
    { label: "Following", path: "/student/following", icon: Heart },
    { label: "Placement Drives", path: "/student/drives", icon: Rocket },
    { label: "Career Events", path: "/student/events", icon: Sparkles },
    { label: "Career Resources", path: "/student/resources", icon: BookOpen },
    { label: "Placement Checklist", path: "/student/resources/checklist", icon: ClipboardCheck },
    { label: "Privacy & Preferences", path: "/student/settings", icon: Settings }
  ],
  company: [
    { label: "Dashboard", path: "/company", icon: LayoutDashboard },
    { label: "Profile", path: "/company/profile", icon: UserRound },
    { label: "Manage Jobs", path: "/company/jobs", icon: BriefcaseBusiness },
    { label: "Post Job", path: "/company/jobs/new", icon: FileText },
    { label: "Interviews", path: "/company/interviews", icon: CalendarDays },
    { label: "Messages", path: "/messages", icon: MessageCircle },
    { label: "Talent Search", path: "/company/talent", icon: UserSearch },
    { label: "Saved Candidates", path: "/company/saved-candidates", icon: Star },
    { label: "Notifications", path: "/company/notifications", icon: Bell }
  ],
  admin: [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Students", path: "/admin/students", icon: Users },
    { label: "Companies", path: "/admin/companies", icon: Building2 },
    { label: "Jobs", path: "/admin/jobs", icon: BriefcaseBusiness },
    { label: "Applications", path: "/admin/applications", icon: FileText },
    { label: "Interviews", path: "/admin/interviews", icon: CalendarDays },
    { label: "Placement Drives", path: "/admin/drives", icon: Rocket },
    { label: "Career Events", path: "/admin/events", icon: Sparkles },
    { label: "Employer Verification", path: "/admin/verification", icon: BadgeCheck },
    { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { label: "Academic Records", path: "/admin/academic-import", icon: Upload },
    { label: "Reports", path: "/admin/reports", icon: FileSpreadsheet },
    { label: "Audit Logs", path: "/admin/audit-logs", icon: ScrollText },
    { label: "Profile", path: "/admin/profile", icon: UserRoundCog },
  ]
};

const Sidebar = () => {
  const { user } = useAuth();
  const items = menus[user?.role] || [];

  return (
    <aside className="bg-white border-r w-full md:w-64 md:min-h-[calc(100vh-4rem)]">
      <nav
        aria-label={`${user?.role || "user"} navigation`}
        data-testid="sidebar-nav"
        className="flex md:flex-col overflow-x-auto md:overflow-y-auto gap-1 p-3 md:max-h-[calc(100vh-4rem)]"
      >
        {items.map(({ label, path, icon: Icon }, index) => (
          <NavLink
            key={`${path}-${index}`}
            to={path}
            end={path === "/student" || path === "/company" || path === "/admin"}
            className={({ isActive }) => `flex items-center gap-3 whitespace-nowrap px-4 py-3 rounded-lg transition ${isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
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
