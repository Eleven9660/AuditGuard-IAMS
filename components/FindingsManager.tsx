
import React, { useState, useMemo } from 'react';
import { AlertTriangle, Calendar, CheckSquare, Download, ChevronDown, Plus, Trash2, User, Clock, Search, Briefcase, MessageSquare, ArrowUpRight, Lightbulb, X } from 'lucide-react';
import { Finding, FindingType, ActionItem, RiskRating, FollowUpLog } from '../types';

interface FindingsManagerProps {
  onNavigate?: (view: string) => void;
  findings: Finding[];
  onAddFinding: (finding: Finding) => void;
  onUpdateFinding: (id: string, updates: Partial<Finding>) => void;
  actions: Record<string, ActionItem[]>;
  onUpdateActions: (findingId: string, actions: ActionItem[]) => void;
}

const FindingTypeBadge = ({ type }: { type: FindingType }) => type === 'IMPROVEMENT' ? <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100"><Lightbulb size={12} /> Opportunity</span> : <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100"><AlertTriangle size={12} /> Finding</span>;

const RiskBadge = ({ rating }: { rating: RiskRating }) => {
  const styles = rating === 'HIGH' ? 'bg-rose-50 text-rose-700 border-rose-100' : rating === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100';
  return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${styles}`}>{rating}</span>;
};

export const FindingsManager: React.FC<FindingsManagerProps> = ({ onNavigate, findings, onAddFinding, onUpdateFinding, actions, onUpdateActions }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newAction, setNewAction] = useState({ description: '', owner: '', dueDate: '' });
  const [newFollowUpNote, setNewFollowUpNote] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFindingData, setNewFindingData] = useState({ auditId: '', title: '', description: '', risk: 'MEDIUM' as RiskRating, type: 'FINDING' as FindingType, impact: '', rootCause: '', recommendation: '', managementComment: '', action: '', owner: '', dueDate: '' });

  const filteredFindings = useMemo(() => findings.filter(f => f.title.toLowerCase().includes(filterText.toLowerCase()) || f.description.toLowerCase().includes(filterText.toLowerCase()) || f.id.toLowerCase().includes(filterText.toLowerCase())), [findings, filterText]);
  const stats = useMemo(() => {
    const totalOpen = findings.filter(f => f.status === 'OPEN').length;
    const allActions = (Object.values(actions).flat() as ActionItem[]);
    const openActions = allActions.filter(a => a.status !== 'Completed').length;
    return { totalOpen, openActions };
  }, [findings, actions]);

  const handleAddAction = (findingId: string) => {
    if (!newAction.description || !newAction.owner) return;
    const action: ActionItem = { id: `ACT-${Date.now()}`, description: newAction.description, owner: newAction.owner, dueDate: newAction.dueDate || new Date().toISOString().split('T')[0], status: 'Not Started', evidence: [] };
    onUpdateActions(findingId, [...(actions[findingId] || []), action]);
    setNewAction({ description: '', owner: '', dueDate: '' }); setIsAdding(false);
  };

  const handleCreateFinding = () => {
      if (!newFindingData.title || !newFindingData.auditId) { alert("Please select an audit and enter a title."); return; }
      const finding: Finding = { id: `F-${Date.now()}`, auditId: newFindingData.auditId, title: newFindingData.title, description: newFindingData.description, riskRating: newFindingData.risk, status: 'OPEN', identifiedDate: new Date().toISOString().split('T')[0], dueDate: newFindingData.dueDate || 'TBD', owner: newFindingData.owner || 'TBD', rootCause: newFindingData.rootCause || 'To be determined', linkedControl: 'MANUAL', type: newFindingData.type, impact: newFindingData.impact, recommendation: newFindingData.recommendation, managementResponse: newFindingData.managementComment, actionPlan: newFindingData.action };
      onAddFinding(finding); setShowCreateModal(false); setNewFindingData({ auditId: '', title: '', description: '', risk: 'MEDIUM', type: 'FINDING', impact: '', rootCause: '', recommendation: '', managementComment: '', action: '', owner: '', dueDate: '' });
  };

  const handleAddFollowUp = (findingId: string) => {
      if (!newFollowUpNote.trim()) return;
      const finding = findings.find(f => f.id === findingId);
      if (!finding) return;
      const newLog: FollowUpLog = { id: `FUL-${Date.now()}`, date: new Date().toISOString().split('T')[0], note: newFollowUpNote, user: 'Jane Doe', type: 'System Update' };
      onUpdateFinding(findingId, { followUpLog: [newLog, ...(finding.followUpLog || [])] });
      setNewFollowUpNote('');
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div><h2 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Findings & Remediation</h2><p className="text-slate-500 mt-2">Track issues, root causes, and monitor management action plans.</p></div>
        <div className="flex gap-3"><button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-orange-200 hover:-translate-y-0.5"><Plus size={18} /> New Finding</button><button className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-sm font-bold transition-all shadow-sm bg-white hover:-translate-y-0.5"><Download size={18} /> Export Tracker</button></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] flex items-center justify-between group hover:shadow-lg transition-all"><div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Open Findings</p><p className="text-3xl font-heading font-bold text-slate-900">{stats.totalOpen}</p></div><div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors"><AlertTriangle size={24}/></div></div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] flex items-center justify-between group hover:shadow-lg transition-all"><div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Open Actions</p><p className="text-3xl font-heading font-bold text-slate-900">{stats.openActions}</p></div><div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors"><CheckSquare size={24}/></div></div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="p-1 flex flex-wrap gap-4 items-center"><div className="relative flex-1 min-w-[280px]"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Search findings..." className="w-full pl-11 pr-4 py-3 rounded-xl border border-transparent shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white placeholder-slate-400" value={filterText} onChange={(e) => setFilterText(e.target.value)} /></div></div>
        <div className="space-y-4">
          {filteredFindings.map((finding) => {
            const findingActions = actions[finding.id] || [];
            const completedCount = findingActions.filter(a => a.status === 'Completed').length;
            const progress = findingActions.length > 0 ? Math.round((completedCount / findingActions.length) * 100) : 0;
            return (
            <div key={finding.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all overflow-hidden group">
              <div onClick={() => setExpandedId(expandedId === finding.id ? null : finding.id)} className={`flex flex-col lg:flex-row lg:items-center gap-6 p-6 cursor-pointer transition-colors ${expandedId === finding.id ? 'bg-orange-50/30' : 'hover:bg-slate-50/50'}`}>
                <div className="flex-1"><div className="flex items-center gap-2 mb-2"><span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{finding.id}</span><FindingTypeBadge type={finding.type} /></div><h3 className={`text-base font-bold font-heading ${expandedId === finding.id ? 'text-orange-700' : 'text-slate-800'}`}>{finding.title}</h3><p className="text-sm text-slate-500 mt-1 line-clamp-1">{finding.description}</p></div>
                <div className="flex flex-wrap items-center gap-6 lg:gap-8 min-w-[50%] lg:justify-end"><div className="w-24"><div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-bold text-slate-500 uppercase">Progress</span><span className="text-[10px] font-bold text-slate-700 ml-auto">{progress}%</span></div><div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${progress}%` }}></div></div></div><RiskBadge rating={finding.riskRating} /><div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${expandedId === finding.id ? 'bg-orange-100 text-orange-600 rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500'}`}><ChevronDown size={18} /></div></div>
              </div>
              {expandedId === finding.id && (
                <div className="px-6 pb-6 lg:px-20 lg:pb-10 bg-orange-50/30 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-4">
                      <div className="xl:col-span-2 space-y-8 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100"><div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Risk Statement</label><p className="text-sm text-slate-700">{finding.impact}</p></div><div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Recommendation</label><p className="text-sm text-slate-700">{finding.recommendation}</p></div></div>
                        <div>
                            <div className="flex items-center justify-between mb-5"><h4 className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2"><CheckSquare size={18} className="text-orange-500"/> Detailed Action Steps</h4><button onClick={() => setIsAdding(true)} className="text-xs flex items-center gap-1.5 bg-orange-600 text-white px-3.5 py-2 rounded-lg hover:bg-orange-700 transition-all shadow-md shadow-orange-200 font-bold"><Plus size={14} /> Add Action Item</button></div>
                            {isAdding && (<div className="mb-6 bg-slate-50 p-6 rounded-xl border border-orange-100 animate-in fade-in zoom-in-95 shadow-sm"><div className="grid grid-cols-2 gap-4 mb-4"><input className="p-2 border rounded" placeholder="Description" value={newAction.description} onChange={e => setNewAction({...newAction, description: e.target.value})}/><input className="p-2 border rounded" placeholder="Owner" value={newAction.owner} onChange={e => setNewAction({...newAction, owner: e.target.value})}/></div><div className="flex justify-end gap-3"><button onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button><button onClick={() => handleAddAction(finding.id)} className="px-4 py-2 text-xs font-bold bg-orange-600 text-white rounded-lg">Save</button></div></div>)}
                            <div className="space-y-4">{findingActions.length > 0 ? findingActions.map((action) => (<div key={action.id} className="border border-slate-100 rounded-xl p-5 bg-white hover:border-orange-200 hover:shadow-md transition-all group"><div className="flex flex-col md:flex-row justify-between gap-6"><div className="flex-1"><div className="flex items-center gap-2.5 mb-2"><span className={`text-xs font-bold uppercase tracking-wide ${action.status === 'Completed' ? 'text-emerald-600' : action.status === 'In Progress' ? 'text-blue-600' : 'text-slate-400'}`}>{action.status}</span></div><p className="text-sm font-medium text-slate-900 leading-relaxed">{action.description}</p></div><div className="flex flex-col md:items-end gap-1.5 text-xs text-slate-500 min-w-[140px]"><div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded"><User size={12} className="text-orange-400"/> <span className="font-semibold text-slate-700">{action.owner}</span></div></div></div></div>)) : (<div className="text-center py-8 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm flex flex-col items-center gap-2"><Briefcase size={24} className="opacity-30" /><span>No detailed action steps.</span></div>)}</div>
                        </div>
                      </div>
                      <div className="xl:col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-inner flex flex-col h-full"><h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4"><MessageSquare size={14}/> Audit Follow-up Trail</h4><div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">{finding.followUpLog && finding.followUpLog.length > 0 ? (finding.followUpLog.map((log) => (<div key={log.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-xs"><div className="flex justify-between text-slate-400 mb-1"><span className="font-bold text-slate-600">{log.user}</span><span>{log.date}</span></div><p className="text-slate-700 leading-relaxed">{log.note}</p></div>))) : (<div className="text-center text-slate-400 text-xs italic py-10">No follow-up notes recorded.</div>)}</div><div className="mt-auto"><textarea className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white mb-2" rows={3} placeholder="Add follow-up note..." value={newFollowUpNote} onChange={(e) => setNewFollowUpNote(e.target.value)} /><button onClick={() => handleAddFollowUp(finding.id)} disabled={!newFollowUpNote.trim()} className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors">Add Note</button></div></div>
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
      {showCreateModal && (<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"><div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"><h3 className="text-base font-bold text-slate-900 flex items-center gap-2">Raise New Issue</h3><button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"><X size={20} /></button></div><div className="p-8 space-y-5 overflow-y-auto max-h-[70vh]"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Title</label><input type="text" className="w-full text-sm border border-slate-200 rounded-xl p-3" value={newFindingData.title} onChange={e => setNewFindingData({...newFindingData, title: e.target.value})} autoFocus/></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Audit ID</label><input type="text" className="w-full text-sm border border-slate-200 rounded-xl p-3" value={newFindingData.auditId} onChange={e => setNewFindingData({...newFindingData, auditId: e.target.value})} placeholder="e.g. A-01" /></div></div><div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50"><button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-white bg-transparent border border-transparent hover:border-slate-200 rounded-xl transition-all">Cancel</button><button onClick={handleCreateFinding} className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all">Create Finding</button></div></div></div>)}
    </div>
  );
};
