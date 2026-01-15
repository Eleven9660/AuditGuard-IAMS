
import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { 
  AlertTriangle, CheckCircle2, Clock, FileText,
  TrendingUp, TrendingDown, Activity, ArrowRight, Calendar,
  Briefcase, PlayCircle
} from 'lucide-react';
import { StatCardProps, Audit, Finding, ActionItem } from '../types';

interface DashboardProps {
    audits: Audit[];
    findings: Finding[];
    actions: Record<string, ActionItem[]>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendColor }) => (
  <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 border border-slate-100 group flex flex-col justify-between h-full">
    <div>
        <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 group-hover:bg-orange-50 rounded-xl text-slate-600 group-hover:text-orange-600 transition-colors">
            {icon}
        </div>
        {trend && (
            <div className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
            trendColor === 'red' ? 'bg-red-50 text-red-600' : trendColor === 'green' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
            }`}>
            {trendColor === 'green' ? <TrendingUp size={12}/> : trendColor === 'red' ? <TrendingDown size={12}/> : null}
            <span>{trend}</span>
            </div>
        )}
        </div>
        <div>
            <h3 className="text-3xl font-heading font-bold text-slate-900 mb-1 tracking-tight">{value}</h3>
            <p className="text-slate-500 text-sm font-medium">{title}</p>
        </div>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ audits, findings, actions }) => {
  // --- Data Derivation ---
  
  // 1. KPI Stats
  const totalAudits = audits.length;
  const completedAudits = audits.filter(a => a.status === 'COMPLETED').length;
  const planCompletionRate = totalAudits > 0 ? Math.round((completedAudits / totalAudits) * 100) : 0;
  
  const highRiskFindings = findings.filter(f => f.riskRating === 'HIGH' && f.status === 'OPEN').length;
  
  const allActions = Object.values(actions).flat();
  const overdueActions = allActions.filter(a => a.status !== 'Completed' && new Date(a.dueDate) < new Date()).length;
  
  const totalBudgetDays = audits.reduce((sum, a) => sum + a.budgetedDays, 0);
  const consumedDays = Math.round(audits.reduce((sum, a) => sum + (a.budgetedDays * (a.progress / 100)), 0));

  // 2. Chart Data: Audit Status by Quarter
  const auditsByQuarter = useMemo(() => {
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      return quarters.map(q => {
          const auditsInQ = audits.filter(a => a.quarter.includes(q) && a.quarter !== 'All');
          const planned = auditsInQ.length;
          const completed = auditsInQ.filter(a => a.status === 'COMPLETED').length;
          const inProgress = auditsInQ.filter(a => ['FIELDWORK', 'REVIEW'].includes(a.status)).length;
          return { name: q, Completed: completed, InProgress: inProgress, Planned: planned - completed - inProgress };
      });
  }, [audits]);

  // 3. Chart Data: Risk Profile
  const riskDistribution = useMemo(() => {
      const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
      findings.forEach(f => {
          if (f.status === 'OPEN') {
              counts[f.riskRating]++;
          }
      });
      return [
          { name: 'High', value: counts.HIGH, color: '#f43f5e' },
          { name: 'Medium', value: counts.MEDIUM, color: '#f59e0b' },
          { name: 'Low', value: counts.LOW, color: '#10b981' }
      ];
  }, [findings]);

  // 4. Activity Feed Data
  const recentActivities = useMemo(() => {
      const activityItems = [
          ...findings.map(f => ({
              id: f.id,
              type: 'FINDING',
              text: `New finding raised: ${f.title}`,
              date: f.identifiedDate,
              meta: audits.find(a => a.id === f.auditId)?.code || 'Unknown'
          })),
          ...audits.filter(a => a.status === 'FIELDWORK').map(a => ({
              id: a.id,
              type: 'STATUS',
              text: `Fieldwork commenced: ${a.title}`,
              date: '2025-10-01', // Mock recent date relative to demo
              meta: a.code
          })),
          ...audits.filter(a => a.status === 'COMPLETED').map(a => ({
              id: a.id,
              type: 'REPORT',
              text: `Report issued: ${a.title}`,
              date: '2025-09-28', // Mock recent date
              meta: a.code
          }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
      return activityItems;
  }, [audits, findings]);

  // 5. Action Items (Tasks for the user)
  const myTasks = useMemo(() => {
      const reviews = audits.filter(a => a.status === 'REVIEW').map(a => ({
          id: a.id, title: a.title, type: 'Review', deadline: 'Due Soon'
      }));
      const fieldwork = audits.filter(a => a.status === 'FIELDWORK').map(a => ({
          id: a.id, title: a.title, type: 'Fieldwork', deadline: 'Ongoing'
      }));
      return [...reviews, ...fieldwork].slice(0, 4);
  }, [audits]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Audit Dashboard</h2>
          <p className="text-slate-500 mt-2 text-base">Overview of assurance activities, risk exposure, and team performance.</p>
        </div>
        <div className="flex gap-3">
           <span className="px-4 py-1.5 bg-white shadow-sm text-slate-700 rounded-full text-sm font-semibold border border-slate-200 flex items-center gap-2">
             <Calendar size={14} className="text-orange-500"/> FY 2025/2026
           </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Plan Completion" 
          value={`${planCompletionRate}%`} 
          icon={<Briefcase size={24} />} 
          trend={`${completedAudits}/${totalAudits} Audits`} 
          trendColor="neutral"
        />
        <StatCard 
          title="Open High Risks" 
          value={highRiskFindings} 
          icon={<AlertTriangle size={24} />} 
          trend={highRiskFindings > 0 ? "Requires Attention" : "Controlled"} 
          trendColor={highRiskFindings > 0 ? "red" : "green"}
        />
        <StatCard 
          title="Overdue Actions" 
          value={overdueActions} 
          icon={<Clock size={24} />} 
          trend={overdueActions > 0 ? "Escalation needed" : "On track"} 
          trendColor={overdueActions > 0 ? "red" : "green"}
        />
        <StatCard 
          title="Days Utilized" 
          value={`${consumedDays}`} 
          icon={<Activity size={24} />} 
          trend={`of ${totalBudgetDays} Budgeted`} 
          trendColor="neutral"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Chart Column */}
        <div className="xl:col-span-2 space-y-8">
            
            {/* Audit Plan Execution Chart */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-heading font-bold text-slate-900">Audit Plan Velocity</h3>
                        <p className="text-sm text-slate-500">Execution status by quarter</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Completed</span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-100"><div className="w-2 h-2 rounded-full bg-orange-500"></div> In Progress</span>
                    </div>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={auditsByQuarter} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={0} stackOffset="sign">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <ReTooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} 
                        />
                        <Bar dataKey="Completed" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={40} />
                        <Bar dataKey="InProgress" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} barSize={40} />
                        <Bar dataKey="Planned" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* My Action Center */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="text-orange-600" size={24}/> My Action Center
                    </h3>
                    <button className="text-sm font-bold text-orange-600 hover:text-orange-800 transition-colors">View All</button>
                </div>
                <div className="space-y-4">
                    {myTasks.length > 0 ? myTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-orange-100 hover:bg-slate-50 transition-all group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${task.type === 'Review' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {task.type === 'Review' ? <FileText size={18} /> : <PlayCircle size={18} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">{task.type} Required • {task.deadline}</p>
                                </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="bg-white border border-slate-200 p-2 rounded-lg text-slate-400 hover:text-orange-600 hover:border-orange-200">
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-slate-400 italic">No immediate actions required.</div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-8">
            
            {/* Risk Profile Pie Chart */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100">
                <div className="mb-6">
                    <h3 className="text-xl font-heading font-bold text-slate-900">Current Risk Profile</h3>
                    <p className="text-sm text-slate-500">Open findings by rating</p>
                </div>
                <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={6}
                        >
                        {riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <ReTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                        <span className="text-3xl font-bold text-slate-900 font-heading">{riskDistribution.reduce((a,b) => a + b.value, 0)}</span>
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Open Items</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-orange-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
                <h3 className="text-xl font-heading font-bold mb-6 relative z-10 flex items-center gap-3">
                    <Activity className="text-orange-400" /> Recent Activity
                </h3>
                <div className="space-y-6 relative z-10">
                    {recentActivities.map((activity, idx) => (
                        <div key={idx} className="flex gap-4 relative">
                            {idx !== recentActivities.length - 1 && (
                                <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-slate-800"></div>
                            )}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 ${
                                activity.type === 'FINDING' ? 'border-rose-500 bg-slate-900 text-rose-500' :
                                activity.type === 'STATUS' ? 'border-orange-500 bg-slate-900 text-orange-500' :
                                'border-emerald-500 bg-slate-900 text-emerald-500'
                            }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                    activity.type === 'FINDING' ? 'bg-rose-500' :
                                    activity.type === 'STATUS' ? 'bg-orange-500' :
                                    'bg-emerald-500'
                                }`}></div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-200 leading-tight">{activity.text}</p>
                                <p className="text-xs text-slate-500 mt-1">{activity.date} • {activity.meta}</p>
                            </div>
                        </div>
                    ))}
                    {recentActivities.length === 0 && <p className="text-slate-500 italic text-sm">No recent activity.</p>}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
