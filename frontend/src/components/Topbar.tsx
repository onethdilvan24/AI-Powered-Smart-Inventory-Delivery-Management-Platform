import { Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <header className="fixed top-0 left-56 right-0 h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 z-20">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search inventory, orders, suppliers..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name ?? 'Loading…'}</p>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">{user?.role?.toLowerCase() ?? ''}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-red-500"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
