
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Target, Clock, CheckCircle2, AlertTriangle, TrendingUp, Users, Activity } from 'lucide-react';
import { MOCK_AUDITS, MOCK_FINDINGS, MOCK_ACTIONS } from '../constants';

const KPICard = ({ title, value, subtitle, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color === 'orange' ? 'bg-orange-50 text-orange-600' : color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">+2.5% vs Last Q</span>
    </div>
    <h3 className="text-3xl font-heading font-bold text-slate-900 mb-1">{value}</h3>
    <p className="text-sm text-slate-500 font-medium">{title}</p>
    <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
  </div>
);

export const KPITracker: React.FC = () => {
  // Mock Data for Charts
  const cycleTimeData = [
    { name: 'Q1', Planning: 5, Fieldwork: 15, Reporting: 10 },
    { name: 'Q2', Planning: 4, Fieldwork: 12, Reporting: 8 },
    { name: 'Q3', Planning: 6, Fieldwork: 18, Reporting: 12 },
    { name: 'Q4', Planning: 4, Fieldwork: 14, Reporting: 7 },
  ];

  const findingClosureData = [
    { name: 'Jan', Opened: 4, Closed: 2 },
    { name: 'Feb', Opened: 6, Closed: 5 },
    { name: 'Mar', Opened: 3, Closed: 4 },
    { name: 'Apr', Opened: 8, Closed: 6 },
    { name: 'May', Opened: 5, Closed: 7 },
    { name: 'Jun', Opened: 2, Closed: 5 },
  ];

  const auditCoverageData = [
    { name: 'Operations', score: 85 },
    { name: 'Finance', score: 92 },
    { name: 'IT', score: 65 },
    { name: 'Compliance', score: 78 },
    { name: 'HR', score: 45 },
  ];

  const productivityData = [
    { name: 'Jane Doe', Utilization: 92, Reports: 12 },
    { name: 'John Smith', Utilization: 85, Reports: 8 },
    { name: 'Emily Chen', Utilization: 88, Reports: 10 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">KPI Performance Tracker</h2>
          <p className="text-slate-500 mt-2">Strategic metrics monitoring audit effectiveness and efficiency.</p>
        </div>
        <div className="flex gap-2">
            <select className="bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20">
                <option>FY 2025/26</option>
                <option>FY 2024/25</option>
            </select>
        </div>
      </div>

      {/* Top Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
            title="Audit Plan Delivery" 
            value="85%" 
            subtitle="22/26 Engagements Completed" 
            icon={Target} 
            color="orange"
        />
        <KPICard 
            title="Avg. Cycle Time" 
            value="32 Days" 
            subtitle="Planning to Issuance" 
            icon={Clock} 
            color="blue"
        />
        <KPICard 
            title="Finding Closure Rate" 
            value="78%" 
            subtitle="On-time remediation" 
            icon={CheckCircle2} 
            color="emerald"
        />
        <KPICard 
            title="Staff Utilization" 
            value="89%" 
            subtitle="Billable vs Admin hours" 
            icon={Users} 
            color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cycle Time Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock size={20} className="text-orange-500"/> Audit Cycle Time (Days)
            </h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cycleTimeData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9"/>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#64748b'}} width={30}/>
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}/>
                        <Legend iconType="circle"/>
                        <Bar dataKey="Planning" stackId="a" fill="#fdba74" radius={[0,0,0,0]} barSize={30} />
                        <Bar dataKey="Fieldwork" stackId="a" fill="#f97316" radius={[0,0,0,0]} barSize={30} />
                        <Bar dataKey="Reporting" stackId="a" fill="#c2410c" radius={[0,4,4,0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Remediation Trends */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Activity size={20} className="text-emerald-500"/> Remediation Trends
            </h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={findingClosureData}>
                        <defs>
                            <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}/>
                        <Area type="monotone" dataKey="Opened" stroke="#f43f5e" fillOpacity={1} fill="url(#colorOpened)" strokeWidth={3} />
                        <Area type="monotone" dataKey="Closed" stroke="#10b981" fillOpacity={1} fill="url(#colorClosed)" strokeWidth={3} />
                        <Legend iconType="circle"/>
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Coverage Radar (Simulated with Bar) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-500"/> Universe Coverage (%)
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={auditCoverageData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#64748b'}} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}/>
                        <Bar dataKey="score" fill="#3b82f6" radius={[4,4,0,0]} barSize={40}>
                            {auditCoverageData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.score < 50 ? '#cbd5e1' : entry.score < 80 ? '#60a5fa' : '#2563eb'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Team Productivity */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Users size={20} className="text-purple-500"/> Auditor Productivity
            </h3>
            <div className="space-y-6">
                {productivityData.map((p, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{p.name.charAt(0)}</div>
                                <span className="text-sm font-bold text-slate-700">{p.name}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-500">{p.Utilization}% Utilization</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{width: `${p.Utilization}%`}}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
