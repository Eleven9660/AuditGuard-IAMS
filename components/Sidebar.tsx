
import React from 'react';
import { LayoutDashboard, FileText, ClipboardList, ShieldAlert, BarChart3, Settings, BookOpen, LogOut, PieChart, Bell } from 'lucide-react';
import { NavItem } from '../types';
import { useAuth } from '../src/context/AuthContext';
import { useNotifications } from '../src/hooks/useNotifications';

interface SidebarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'planning', label: 'Audit Plan', icon: FileText },
  { id: 'fieldwork', label: 'Fieldwork', icon: ClipboardList },
  { id: 'findings', label: 'Findings & Actions', icon: ShieldAlert },
  { id: 'kpi', label: 'KPI Tracker', icon: PieChart },
  { id: 'reports', label: 'Reporting', icon: BarChart3 },
  { id: 'standards', label: 'Standards & Docs', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications(user?.userId);

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleLabel = user?.role === 'ADMIN' ? 'Administrator' :
                    user?.role === 'AUDITOR' ? 'Auditor' :
                    user?.role === 'MANAGER' ? 'Manager' : 'Viewer';

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="w-72 bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-slate-300 h-screen flex flex-col fixed left-0 top-0 shadow-2xl z-50">
      {/* Brand Header */}
      <div className="p-8 pb-6 flex items-center gap-4">
        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/50">
          <ShieldAlert className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-white font-heading font-bold text-xl tracking-tight leading-none">AuditGuard</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Enterprise IAMS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-2">Main Menu</div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40 translate-x-1'
                  : 'hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
              }`}
            >
              <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-medium text-sm tracking-wide">{item.label}</span>
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              )}
            </button>
          );
        })}
        
        <div className="mt-6">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-2">System</div>
            <button
              onClick={() => onNavigate('notifications')}
              title="Notifications"
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                currentView === 'notifications'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40 translate-x-1'
                  : 'hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
              }`}
            >
              <Bell size={20} className="group-hover:text-amber-400 transition-colors" />
              <span className="font-medium text-sm tracking-wide">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto">{unreadCount}</span>
              )}
            </button>
        </div>
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 mx-4 mb-4 mt-auto">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-inner border-2 border-slate-700">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate font-heading">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{roleLabel}</p>
            </div>
          </div>
          <div className="flex gap-1">
             <button
                onClick={() => onNavigate('settings')}
                title="Settings"
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg transition-colors text-xs font-medium ${currentView === 'settings' ? 'bg-orange-600 text-white shadow-lg' : 'hover:bg-slate-700/50 text-slate-400 hover:text-white'}`}
             >
               <Settings size={14} /> Settings
             </button>
             <button
                onClick={handleLogout}
                title="Logout"
                className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors text-xs font-medium">
               <LogOut size={14} /> Logout
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
