import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function NotificationBell(){
  const { user } = useAuth();
  const path = user?.role === 'company' ? '/company/notifications' : user?.role === 'student' ? '/student/notifications' : '/admin';
  return <Link to={path} aria-label="Notifications" className="relative inline-flex p-2 rounded-lg hover:bg-slate-100"><Bell size={20}/></Link>;
}
