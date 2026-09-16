import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const notificationPaths = {
  company: '/company/notifications',
  student: '/student/notifications',
  admin: '/admin'
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user || user.role === 'admin') return;

    let cancelled = false;

    const fetchUnread = async () => {
      try {
        const response = await api.get('/notifications');
        if (!cancelled) {
          const notifications = response.data.notifications || [];
          setUnread(notifications.filter((notification) => !notification.readAt).length);
        }
      } catch {
        // Silent fail: the bell works without a badge.
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user?.role, user?._id]);

  const path = user ? notificationPaths[user.role] || '/admin' : '/login';

  return (
    <Link
      to={path}
      aria-label="Notifications"
      className="relative inline-flex p-2 rounded-lg hover:bg-slate-100"
    >
      <Bell size={20} />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold px-1">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  );
}