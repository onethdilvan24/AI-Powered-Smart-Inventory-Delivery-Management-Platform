import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  BarChart2,
  Bot,
  Settings,
  HelpCircle,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/suppliers', label: 'Suppliers', icon: Users },
  { to: '/delivery', label: 'Delivery', icon: Truck },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/assistant', label: 'AI Assistant', icon: Bot },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-white border-r border-gray-100 flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <Truck className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">FoodFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-gray-100 pt-4">
        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </NavLink>
        <div className="mt-4 mx-0 rounded-xl bg-primary-50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-semibold text-primary-700">Need Help?</span>
          </div>
          <p className="text-xs text-primary-600 leading-relaxed">
            Contact support or browse our documentation.
          </p>
        </div>
      </div>
    </aside>
  );
}
