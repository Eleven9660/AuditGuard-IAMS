
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Filter, Calendar, LayoutList, 
  Pencil, X, Trash2, Activity, Zap
} from 'lucide-react';
import { Audit, AuditStatus, RiskRating, AuditActivityLog, AuditTemplate } from '../types';

// --- Utility Components ---

const StatusBadge: React.FC<{ status: AuditStatus }> = ({ status }) => {
  const styles = {
    PLANNED: 'bg-slate-100 text-slate-600 border-slate-200',
    FIELDWORK: 'bg-blue-50 text-blue-700 border-blue-100',
    REVIEW: 'bg-amber-50 text-amber-700 border-amber-100',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    CONTINUOUS: 'bg-orange-50 text-orange-700 border-orange-100',
  };
  
  const labels = {
    PLANNED: 'Planned',
    FIELDWORK: 'Fieldwork',
    REVIEW: 'In Review',
    COMPLETED: 'Completed',
    CONTINUOUS: 'Continuous'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const RiskBadge: React.FC<{ rating: RiskRating }> = ({ rating }) => {
  const styles = {
    HIGH: 'text-rose-700 bg-rose-50 border-rose-100',
    MEDIUM: 'text-amber-700 bg-amber-50 border-amber-100',
    LOW: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles[rating]}`}>
      {rating}
    </span>
  );
};

const ProgressBar: React.FC<{ progress: number; status: AuditStatus }> = ({ progress, status }) => {
  let colorClass = 'bg-slate-200';
  if (status === 'COMPLETED') colorClass = 'bg-emerald-500';
  else if (status === 'FIELDWORK') colorClass = 'bg-blue-500';
  else if (status === 'REVIEW') colorClass = 'bg-amber-500';
  else if (status === 'CONTINUOUS') colorClass = 'bg-orange-500';

  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
      <div 
        className={`h-1.5 rounded-full ${colorClass} transition-all duration-1000 ease-out`} 
        style={{ width: `${progress}%` }} 
      ></div>
    </div>
  );
};

interface AuditPlanProps {
    audits: Audit[];
    setAudits: React.Dispatch<React.SetStateAction<Audit[]>>;
    templates: AuditTemplate[];
}

export const AuditPlan: React.FC<AuditPlanProps> = ({ audits, setAudits, templates }) => {
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('timeline');
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AuditStatus | 'ALL'>('ALL');
  const [riskFilter, setRiskFilter] = useState<RiskRating | 'ALL'>('ALL');

  // State for Timeline Editing
  const [editingMonthCell, setEditingMonthCell] = useState<{auditId: string, month: string} | null>(null);
  const [tempMonthDays, setTempMonthDays] = useState<string>("");

  // State for Modal (Create/Edit)
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
      title: '',
      category: '',
      section: 'Audit Fieldwork',
      riskRating: 'MEDIUM' as RiskRating,
      days: 10,
      quarter: 'Q1',
      templateId: ''
  });

  // State for Activity Modal (Continuous Assurance)
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedContinuousAudit, setSelectedContinuousAudit] = useState<Audit | null>(null);
  const [activityData, setActivityData] = useState({
      date: new Date().toISOString().split('T')[0],
      activity: '',
      hours: 0,
      outcome: ''
  });

  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const sections = ["Planning Stage", "Audit Fieldwork", "Risk Based Reviews"];
  const quarterGroups = ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4', 'Continuous Assurance', 'Planning / Other'];

  const getAuditQuarterGroup = (audit: Audit) => {
    if (audit.status === 'CONTINUOUS' || audit.section === 'Risk Based Reviews' || audit.quarter === 'All') return 'Continuous Assurance';
    if (audit.quarter.includes('Q1')) return 'Quarter 1';
    if (audit.quarter.includes('Q2')) return 'Quarter 2';
    if (audit.quarter.includes('Q3')) return 'Quarter 3';
    if (audit.quarter.includes('Q4')) return 'Quarter 4';
    return 'Planning / Other';
  };

  const filteredAudits = useMemo(() => {
    return audits.filter(audit => {
        const matchesSearch = searchQuery === '' || 
            audit.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            audit.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            audit.code.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'ALL' || audit.status === statusFilter;
        const matchesRisk = riskFilter === 'ALL' || audit.riskRating === riskFilter;

        return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [audits, searchQuery, statusFilter, riskFilter]);

  const timelineTotals = useMemo(() => {
      const colTotals: Record<string, number> = {};
      months.forEach(m => colTotals[m] = 0);
      
      filteredAudits.forEach(audit => {
          months.forEach(m => {
              const days = audit.monthlyDistribution[m] || 0;
              colTotals[m] += days;
          });
      });
      
      const grandTotal = Object.values(colTotals).reduce((a, b) => a + b, 0);
      return { colTotals, grandTotal };
  }, [filteredAudits, months]);

  const auditsByQuarter = useMemo(() => {
    const groups: Record<string, Audit[]> = {};
    quarterGroups.forEach(q => groups[q] = []);
    
    filteredAudits.forEach(audit => {
        const group = getAuditQuarterGroup(audit);
        if (groups[group]) {
          groups[group].push(audit);
        } else {
             if (!groups['Planning / Other']) groups['Planning / Other'] = [];
             groups['Planning / Other'].push(audit);
        }
    });
    return groups;
  }, [filteredAudits, quarterGroups]);

  const handleCreateAudit = () => {
    const newAudit: Audit = {
        id: `A-${Date.now()}`,
        code: `AUD-${Date.now().toString().slice(-4)}`,
        title: formData.title,
        category: formData.category,
        section: formData.section,
        quarter: formData.quarter,
        year: '2025/26',
        status: 'PLANNED',
        riskRating: formData.riskRating,
        auditor: 'Internal Audit',
        processOwner: 'TBD',
        standardsMap: ['IPPF'],
        progress: 0,
        monthlyDistribution: {},
        budgetedDays: formData.days,
        templateId: formData.templateId || undefined
    };
    setAudits(prev => [...prev, newAudit]);
    setShowModal(false);
    // Reset form
    setFormData({
        title: '', category: '', section: 'Audit Fieldwork', riskRating: 'MEDIUM', days: 10, quarter: 'Q1', templateId: ''
    });
  };

  const handleDeleteAudit = (id: string) => {
      if (window.confirm('Are you sure you want to delete this audit plan?')) {
          setAudits(prev => prev.filter(a => a.id !== id));
      }
  };

  const handleTimelineCellClick = (auditId: string, month: string, currentVal: number) => {
      setEditingMonthCell({ auditId, month });
      setTempMonthDays(currentVal === 0 ? "" : currentVal.toString());
  };

  const saveTimelineCell = () => {
      if (editingMonthCell) {
          const val = parseInt(tempMonthDays) || 0;
          setAudits(prev => prev.map(a => {
              if (a.id === editingMonthCell.auditId) {
                  return {
                      ...a,
                      monthlyDistribution: {
                          ...a.monthlyDistribution,
                          [editingMonthCell.month]: val
                      }
                  };
              }
              return a;
          }));
          setEditingMonthCell(null);
      }
  };

  const handleOpenActivityModal = (audit: Audit) => {
      setSelectedContinuousAudit(audit);
      setShowActivityModal(true);
      setActivityData({ date: new Date().toISOString().split('T')[0], activity: '', hours: 0, outcome: '' });
  };

  const handleSaveActivity = () => {
      if (!selectedContinuousAudit || !activityData.activity) return;
      
      const newLog: AuditActivityLog = {
          id: `LOG-${Date.now()}`,
          date: activityData.date,
          activity: activityData.activity,
          hours: activityData.hours,
          outcome: activityData.outcome,
          user: 'Jane Doe'
      };

      setAudits(prev => prev.map(a => {
          if (a.id === selectedContinuousAudit.id) {
              const currentLogs = a.activityLog || [];
              const updatedLogs = [newLog, ...currentLogs];
              return { ...a, activityLog: updatedLogs };
          }
          return a;
      }));

      setShowActivityModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Audit Plan & Strategy</h2>
          <p className="text-slate-500 mt-2">Manage audit universe, schedule resources, and track progress against the Annual Plan.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2 hover:-translate-y-0.5"
        >
          <Plus size={18} /> New Engagement
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
         <div className="flex items-center gap-2 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search plan..." 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-slate-100 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all text-sm font-medium outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="relative">
                <button 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`p-2.5 rounded-xl border transition-colors ${showFilterMenu || statusFilter !== 'ALL' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  <Filter size={18} />
                </button>
                {showFilterMenu && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 p-2 animate-in fade-in zoom-in-95">
                        <div className="text-xs font-bold text-slate-400 uppercase px-2 py-1.5">Status</div>
                        {['ALL', 'PLANNED', 'FIELDWORK', 'COMPLETED', 'CONTINUOUS'].map(s => (
                            <button 
                                key={s} 
                                onClick={() => { setStatusFilter(s as any); setShowFilterMenu(false); }}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm font-medium ${statusFilter === s ? 'bg-orange-50 text-orange-700' : 'hover:bg-slate-50 text-slate-700'}`}
                            >
                                {s.charAt(0) + s.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                )}
            </div>
         </div>

         <div className="flex bg-slate-100 p-1 rounded-xl w-full xl:w-auto">
            <button 
                onClick={() => setViewMode('timeline')}
                className={`flex-1 xl:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${viewMode === 'timeline' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Calendar size={16} /> Timeline
            </button>
            <button 
                onClick={() => setViewMode('list')}
                className={`flex-1 xl:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${viewMode === 'list' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <LayoutList size={16} /> List View
            </button>
         </div>
      </div>

      {viewMode === 'timeline' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-left">
                            <th className="p-4 w-80 font-bold text-slate-700 uppercase text-xs tracking-wider sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">Audit Engagement</th>
                            <th className="p-4 w-32 font-bold text-slate-700 uppercase text-xs tracking-wider border-r border-slate-200">Owner</th>
                            <th className="p-4 w-24 font-bold text-slate-700 uppercase text-xs tracking-wider text-center border-r border-slate-200">Days</th>
                            {months.map(m => (
                                <th key={m} className="p-3 w-16 text-center font-bold text-slate-500 uppercase text-xs border-r border-slate-100">{m}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredAudits.map(audit => (
                            <tr key={audit.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                            audit.status === 'COMPLETED' ? 'bg-emerald-500' : 
                                            audit.status === 'FIELDWORK' ? 'bg-blue-500' : 
                                            audit.status === 'CONTINUOUS' ? 'bg-orange-500' : 'bg-slate-300'
                                        }`} />
                                        <div>
                                            <div className="font-bold text-slate-900">{audit.title}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{audit.code}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-600 border-r border-slate-200 truncate max-w-[150px]" title={audit.processOwner}>
                                    {audit.processOwner}
                                </td>
                                <td className="p-4 text-center font-mono font-bold text-slate-700 border-r border-slate-200 bg-slate-50/50">
                                    {audit.budgetedDays}
                                </td>
                                {months.map(m => {
                                    const days = audit.monthlyDistribution[m] || 0;
                                    const isEditing = editingMonthCell?.auditId === audit.id && editingMonthCell?.month === m;
                                    
                                    return (
                                        <td 
                                            key={m} 
                                            onClick={() => handleTimelineCellClick(audit.id, m, days)}
                                            className={`p-1 text-center border-r border-slate-100 cursor-pointer transition-colors relative ${days > 0 ? 'bg-orange-50/50 hover:bg-orange-100' : 'hover:bg-slate-100'}`}
                                        >
                                            {isEditing ? (
                                                <input 
                                                    autoFocus
                                                    className="w-full h-full text-center bg-white border-2 border-orange-500 rounded outline-none text-xs font-bold"
                                                    value={tempMonthDays}
                                                    onChange={e => setTempMonthDays(e.target.value)}
                                                    onBlur={saveTimelineCell}
                                                    onKeyDown={e => e.key === 'Enter' && saveTimelineCell()}
                                                />
                                            ) : (
                                                days > 0 && <span className="text-xs font-bold text-orange-600">{days}</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-900 text-white">
                            <td className="p-4 font-bold sticky left-0 bg-slate-900 z-10 border-r border-slate-700">Total Man Days Allocation</td>
                            <td className="p-4 border-r border-slate-700"></td>
                            <td className="p-4 text-center font-bold border-r border-slate-700">{timelineTotals.grandTotal}</td>
                            {months.map(m => (
                                <td key={m} className="p-3 text-center font-bold text-xs border-r border-slate-700 opacity-80">
                                    {timelineTotals.colTotals[m] > 0 ? timelineTotals.colTotals[m] : '-'}
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
      )}

      {viewMode === 'list' && (
          <div className="space-y-10">
              {quarterGroups.map(group => {
                  const groupAudits = auditsByQuarter[group];
                  if (groupAudits.length === 0) return null;

                  return (
                      <div key={group} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                              {group.includes('Continuous') ? <Zap size={16} className="text-amber-500"/> : <Calendar size={16} className="text-orange-500"/>}
                              {group} <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] ml-2">{groupAudits.length}</span>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                              {groupAudits.map(audit => (
                                  <div key={audit.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative flex flex-col h-full">
                                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                          <button className="p-1.5 text-slate-400 hover:text-orange-600 bg-white border border-slate-200 rounded-lg shadow-sm"><Pencil size={14}/></button>
                                          <button onClick={() => handleDeleteAudit(audit.id)} className="p-1.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-200 rounded-lg shadow-sm"><Trash2 size={14}/></button>
                                      </div>
                                      
                                      <div className="flex justify-between items-start mb-4">
                                          <div className="flex flex-col gap-2">
                                              <StatusBadge status={audit.status} />
                                              <span className="text-[10px] font-mono text-slate-400">{audit.code}</span>
                                          </div>
                                          <RiskBadge rating={audit.riskRating} />
                                      </div>
                                      
                                      <h4 className="font-bold text-slate-900 text-lg mb-2 leading-tight">{audit.title}</h4>
                                      <p className="text-xs text-slate-500 mb-6 line-clamp-2">{audit.category}</p>
                                      
                                      <div className="space-y-4 mt-auto">
                                          {audit.status === 'CONTINUOUS' && (
                                              <button 
                                                onClick={() => handleOpenActivityModal(audit)}
                                                className="w-full py-2 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg border border-orange-100 hover:bg-orange-100 flex items-center justify-center gap-2 mb-2 transition-colors"
                                              >
                                                  <Activity size={14} /> Log Assurance Activity
                                              </button>
                                          )}

                                          <div>
                                              <div className="flex justify-between text-xs mb-1.5">
                                                  <span className="font-bold text-slate-500">Progress</span>
                                                  <span className="font-bold text-slate-900">{audit.progress}%</span>
                                              </div>
                                              <ProgressBar progress={audit.progress} status={audit.status} />
                                          </div>
                                          
                                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                              <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                                                  <Calendar size={14} /> {audit.budgetedDays} days
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  );
              })}
          </div>
      )}

      {/* CREATE AUDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900">New Engagement</h3>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Engagement Title</label>
                        <input 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                            placeholder="e.g. Q3 Sales Cycle Audit"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category / Area</label>
                             <input 
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 outline-none"
                                placeholder="e.g. Operations"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                             />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Section</label>
                             <select 
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 outline-none"
                                value={formData.section}
                                onChange={e => setFormData({...formData, section: e.target.value})}
                             >
                                 {sections.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                        </div>
                    </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assign Template</label>
                         <select 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 outline-none"
                            value={formData.templateId}
                            onChange={e => setFormData({...formData, templateId: e.target.value})}
                         >
                             <option value="">-- No Template --</option>
                             {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                         </select>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                    <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-white bg-transparent border border-transparent hover:border-slate-200 rounded-xl transition-all">Cancel</button>
                    <button onClick={handleCreateAudit} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5">Create Plan</button>
                </div>
            </div>
        </div>
      )}

      {/* ACTIVITY MODAL */}
      {showActivityModal && selectedContinuousAudit && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-orange-50/50">
                      <div>
                          <h3 className="text-lg font-bold text-slate-900">Log Assurance Activity</h3>
                          <p className="text-xs text-slate-500">{selectedContinuousAudit.title}</p>
                      </div>
                      <button onClick={() => setShowActivityModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                  </div>
                  <div className="p-6 space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date</label>
                              <input 
                                  type="date"
                                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 outline-none"
                                  value={activityData.date}
                                  onChange={e => setActivityData({...activityData, date: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hours Spent</label>
                              <input 
                                  type="number"
                                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 outline-none"
                                  value={activityData.hours}
                                  onChange={e => setActivityData({...activityData, hours: parseInt(e.target.value) || 0})}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Activity Description</label>
                          <textarea 
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 outline-none"
                              rows={3}
                              placeholder="Describe the review performed..."
                              value={activityData.activity}
                              onChange={e => setActivityData({...activityData, activity: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Outcome / Result</label>
                          <textarea 
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 outline-none"
                              rows={2}
                              placeholder="Any exceptions noted?"
                              value={activityData.outcome}
                              onChange={e => setActivityData({...activityData, outcome: e.target.value})}
                          />
                      </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                      <button onClick={() => setShowActivityModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-white bg-transparent border border-transparent hover:border-slate-200 rounded-xl transition-all">Cancel</button>
                      <button onClick={handleSaveActivity} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5">Save Log</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
