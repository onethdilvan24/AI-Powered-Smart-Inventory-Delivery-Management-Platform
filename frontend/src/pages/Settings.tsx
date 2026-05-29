import { useState } from 'react';
import Card from '../components/Card';
import { Bell, Lock, User, Building2, Globe } from 'lucide-react';

export default function Settings() {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and platform preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <User className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-gray-900">Profile</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'First Name', defaultValue: 'Sarah' },
            { label: 'Last Name', defaultValue: 'Johnson' },
            { label: 'Email', defaultValue: 'sarah@foodflow.com' },
            { label: 'Role', defaultValue: 'Manager' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              <input
                type="text"
                defaultValue={f.defaultValue}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Organization */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-gray-900">Organization</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Business Name', defaultValue: 'FoodFlow Restaurant' },
            { label: 'Industry', defaultValue: 'Food & Beverage' },
            { label: 'Address', defaultValue: '123 Main St, City' },
            { label: 'Tax ID', defaultValue: 'US-123456789' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              <input
                type="text"
                defaultValue={f.defaultValue}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-gray-900">Notifications</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Low stock alerts', desc: 'Get notified when products fall below minimum stock' },
            { label: 'Order status updates', desc: 'Receive updates when order statuses change' },
            { label: 'Delivery notifications', desc: 'Real-time delivery tracking updates' },
            { label: 'Weekly digest', desc: 'Receive a weekly summary of your business performance' },
          ].map(n => (
            <label key={n.label} className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-800">{n.label}</p>
                <p className="text-xs text-gray-500">{n.desc}</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary-600" />
            </label>
          ))}
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-gray-900">Preferences</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
            <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>USD — US Dollar</option>
              <option>EUR — Euro</option>
              <option>GBP — British Pound</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Time Zone</label>
            <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>UTC+5:30 — Asia/Colombo</option>
              <option>UTC-5 — America/New_York</option>
              <option>UTC+0 — Europe/London</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-gray-900">Security</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Confirm Password</label>
              <input type="password" placeholder="••••••••" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
