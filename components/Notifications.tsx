
import React from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, X, Clock, Check } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../constants';

export const Notifications: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Notifications</h2>
          <p className="text-slate-500 mt-2">Stay updated on audit activities, deadlines, and system alerts.</p>
        </div>
        <button className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-2 px-4 py-2 hover:bg-orange-50 rounded-lg transition-colors">
            <Check size={16} /> Mark all as read
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex-1">
        <div className="divide-y divide-slate-100">
            {MOCK_NOTIFICATIONS.map(notification => (
                <div key={notification.id} className={`p-6 flex gap-4 hover:bg-slate-50 transition-colors group ${!notification.read ? 'bg-orange-50/30' : ''}`}>
                    <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notification.type === 'error' ? 'bg-rose-100 text-rose-600' :
                        notification.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                        notification.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-blue-100 text-blue-600'
                    }`}>
                        {notification.type === 'error' && <AlertTriangle size={20} />}
                        {notification.type === 'warning' && <Clock size={20} />}
                        {notification.type === 'success' && <CheckCircle size={20} />}
                        {notification.type === 'info' && <Info size={20} />}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-bold ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>{notification.title}</h4>
                            <span className="text-xs text-slate-400 font-medium">{notification.date}</span>
                        </div>
                        <p className={`text-sm mt-1 leading-relaxed ${!notification.read ? 'text-slate-700' : 'text-slate-500'}`}>{notification.message}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                        <button className="p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-200 rounded-full">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            ))}
            
            {MOCK_NOTIFICATIONS.length === 0 && (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Bell size={24} className="opacity-30"/>
                    </div>
                    <p>No notifications yet.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
