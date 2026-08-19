import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  return <section><div className="mb-6"><h1 className="text-2xl md:text-3xl font-bold">Admin Profile</h1><p className="text-slate-500 mt-2">Administrator account information.</p></div><div className="bg-white border rounded-2xl p-6 max-w-2xl"><div className="grid sm:grid-cols-2 gap-6"><div><p className="text-sm text-slate-500">Name</p><p className="font-semibold mt-1">{user?.name || "Placement Portal Administrator"}</p></div><div><p className="text-sm text-slate-500">Email</p><p className="font-semibold mt-1 break-all">{user?.email || "admin@aviportal.com"}</p></div><div><p className="text-sm text-slate-500">Role</p><p className="font-semibold mt-1 capitalize">{user?.role || "admin"}</p></div></div><div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">The production administrator is managed by the backend startup configuration. Admin account deletion is intentionally disabled.</div></div></section>;
};
export default Profile;
