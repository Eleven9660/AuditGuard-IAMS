
import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, FileText, Save, CheckCircle2, 
  Clock, AlertTriangle, Briefcase, ArrowLeft,
  Pencil, Plus, Trash2, X, Upload, Lock, Printer,
  Download, GripVertical, AlertCircle, ListChecks, Target, Shield, Paperclip, ChevronDown, ArrowUpRight, Lightbulb
} from 'lucide-react';
import { Audit, Finding, RiskRating, FindingType, AuditTemplate } from '../types';

// --- Types ---
type TestStatus = 'pass' | 'fail' | 'pending' | 'wip';

interface AuditProcedure {
  id: string;
  text: string;
  completed: boolean;
}

interface UploadedFile {
  name: string;
  size: string;
  type: string;
}

interface WorkPaperData {
  id: number;
  title: string;
  status: TestStatus;
  ref: string;
  testType: string;
  objective: string;
  risk: string;
  procedures: AuditProcedure[];
  requiredEvidence: string[];
  uploadedEvidence: UploadedFile[];
  findings?: string;
  conclusion?: {
    rating: 'Effective' | 'Ineffective' | 'Needs Improvement';
    summary: string;
  };
}

interface FieldworkProps {
  onNavigate?: (view: string) => void;
  audits: Audit[];
  findings: Finding[];
  onAddFinding: (finding: Finding) => void;
  onUpdateFinding: (id: string, updates: Partial<Finding>) => void;
  templates: AuditTemplate[];
}

// Global store for workpapers to persist within session (could be lifted to App but works here for demo persistence)
const WORKPAPER_STORE: Record<string, WorkPaperData[]> = {};

// --- Helper Functions ---
const generateWorkpapersForAudit = (audit: Audit, templates: AuditTemplate[]): Record<number, WorkPaperData> => {
  if (audit.templateId) {
      const template = templates.find(t => t.id === audit.templateId);
      if (template) {
          const workpapers: Record<number, WorkPaperData> = {};
          template.steps.forEach((step, index) => {
              const id = index + 1;
              workpapers[id] = {
                  id,
                  title: step.title,
                  status: 'pending',
                  ref: `WP-${id.toString().padStart(2, '0')}`,
                  testType: 'Test of Design',
                  objective: step.objective,
                  risk: step.risk,
                  procedures: step.procedures.map((procText, i) => ({
                      id: (i + 1).toString().padStart(2, '0'),
                      text: procText,
                      completed: false
                  })),
                  requiredEvidence: [],
                  uploadedEvidence: []
              };
          });
          return workpapers;
      }
  }

  // Fallback logic for demo
  return {
    1: {
      id: 1,
      title: 'Policy & Governance',
      status: 'pending',
      ref: 'WP-GEN-01',
      testType: 'Test of Design',
      objective: 'Ensure policies are up to date and approved.',
      risk: 'Outdated practices.',
      procedures: [{ id: '01', text: 'Review Policy Header Document.', completed: false }],
      requiredEvidence: ['Policy_Doc_v4.pdf'],
      uploadedEvidence: []
    }
  };
};

const StatusIcon = ({ status }: { status: TestStatus }) => {
  switch (status) {
    case 'pass': return <CheckCircle2 size={16} className="text-emerald-500" />;
    case 'fail': return <AlertCircle size={16} className="text-red-500" />;
    case 'wip': return <Clock size={16} className="text-amber-500" />;
    default: return <div className="w-4 h-4 rounded-full border-2 border-slate-200" />;
  }
};

const FindingTypeBadge = ({ type }: { type: FindingType }) => {
  if (type === 'IMPROVEMENT') {
    return (
      <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase border bg-blue-50 text-blue-700 border-blue-200 shadow-sm whitespace-nowrap">
        <Lightbulb size={10} /> Opp.
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase border bg-red-50 text-red-700 border-red-200 shadow-sm whitespace-nowrap">
      <AlertTriangle size={10} /> Finding
    </span>
  );
};

const RiskBadge = ({ rating }: { rating: RiskRating }) => {
  const styles = rating === 'HIGH' ? 'bg-rose-50 text-rose-700 border-rose-100' : rating === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100';
  return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${styles}`}>{rating}</span>;
};

export const Fieldwork: React.FC<FieldworkProps> = ({ onNavigate, audits, findings, onAddFinding, onUpdateFinding, templates }) => {
  const [viewTab, setViewTab] = useState<'ACTIVE' | 'PLANNED' | 'CLOSED'>('ACTIVE');
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [currentWorkpapers, setCurrentWorkpapers] = useState<WorkPaperData[]>([]);
  const [activeStepId, setActiveStepId] = useState<number | 'findings'>(1);
  const [isEditingProgram, setIsEditingProgram] = useState(false);
  const [newEvidenceInput, setNewEvidenceInput] = useState("");
  const [conclusionForm, setConclusionForm] = useState({ rating: 'Effective', summary: '' });
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [newFindingData, setNewFindingData] = useState({ 
    title: '', description: '', risk: 'MEDIUM' as RiskRating, rootCause: '', type: 'FINDING' as FindingType, impact: '', recommendation: '', managementComment: '', action: ''
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const displayedAudits = audits.filter(a => {
    if (viewTab === 'ACTIVE') return a.status === 'FIELDWORK';
    if (viewTab === 'PLANNED') return a.status === 'PLANNED';
    return a.status === 'COMPLETED' || a.status === 'REVIEW';
  });

  const selectedAudit = audits.find(a => a.id === selectedAuditId);
  const activeWP = typeof activeStepId === 'number' ? currentWorkpapers.find(wp => wp.id === activeStepId) : undefined;
  const linkedFindings = activeWP ? findings.filter(f => f.auditId === selectedAuditId && f.linkedControl === activeWP.ref) : [];
  const allAuditFindings = findings.filter(f => f.auditId === selectedAuditId);

  useEffect(() => {
    if (selectedAuditId && selectedAudit) {
      if (!WORKPAPER_STORE[selectedAuditId]) {
        const wpsMap = generateWorkpapersForAudit(selectedAudit, templates);
        WORKPAPER_STORE[selectedAuditId] = Object.values(wpsMap).sort((a,b) => a.id - b.id);
      }
      const initialArray = WORKPAPER_STORE[selectedAuditId] || [];
      setCurrentWorkpapers(initialArray);
      if (initialArray.length > 0) setActiveStepId(initialArray[0].id);
      else setActiveStepId('findings');
      setIsEditingProgram(false);
    }
  }, [selectedAuditId, selectedAudit, templates]);

  useEffect(() => {
    if (selectedAuditId) WORKPAPER_STORE[selectedAuditId] = currentWorkpapers;
  }, [currentWorkpapers, selectedAuditId]);

  useEffect(() => {
    if (activeWP) setConclusionForm({ rating: activeWP.conclusion?.rating || 'Effective', summary: activeWP.conclusion?.summary || '' });
  }, [activeWP]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateField = (field: keyof WorkPaperData, value: any) => {
    if (typeof activeStepId !== 'number') return;
    setCurrentWorkpapers(prev => prev.map(wp => wp.id === activeStepId ? { ...wp, [field]: value } : wp));
  };

  const handleProcedureChange = (procId: string, newText: string) => {
    if (!activeWP) return;
    handleUpdateField('procedures', activeWP.procedures.map(p => p.id === procId ? { ...p, text: newText } : p));
  };

  const handleProcedureToggle = (procId: string) => {
    if (!activeWP) return;
    handleUpdateField('procedures', activeWP.procedures.map(p => p.id === procId ? { ...p, completed: !p.completed } : p));
  };

  const handleAddProcedure = () => {
    if (!activeWP) return;
    const newId = (activeWP.procedures.length + 1).toString().padStart(2, '0');
    handleUpdateField('procedures', [...activeWP.procedures, { id: newId, text: "", completed: false }]);
  };

  const handleDeleteProcedure = (procId: string) => {
    if (!activeWP) return;
    handleUpdateField('procedures', activeWP.procedures.filter(p => p.id !== procId));
  };

  const handleAddEvidence = () => {
    if(!newEvidenceInput.trim() || !activeWP) return;
    handleUpdateField('requiredEvidence', [...activeWP.requiredEvidence, newEvidenceInput]);
    setNewEvidenceInput("");
  };

  const handleDeleteEvidence = (index: number) => {
    if (!activeWP) return;
    handleUpdateField('requiredEvidence', activeWP.requiredEvidence.filter((_, i) => i !== index));
  };

  const processFiles = (files: File[]) => {
    if (!activeWP) return;
    const newFiles: UploadedFile[] = files.map(f => ({ name: f.name, size: (f.size / 1024).toFixed(2) + ' KB', type: f.type }));
    handleUpdateField('uploadedEvidence', [...(activeWP.uploadedEvidence || []), ...newFiles]);
  };

  const handleSaveDraft = () => { handleUpdateField('status', 'wip'); showNotification("Workpaper saved as Draft"); };
  
  const handleMarkComplete = () => {
    if (!activeWP) return;
    if (!activeWP.findings && !conclusionForm.summary) { showNotification("Enter findings or conclusion before completing.", 'error'); return; }
    handleUpdateField('conclusion', { rating: conclusionForm.rating, summary: conclusionForm.summary });
    const newStatus = conclusionForm.rating === 'Ineffective' ? 'fail' : 'pass';
    handleUpdateField('status', newStatus);
    showNotification(`Workpaper marked as ${newStatus.toUpperCase()}`);
    setIsEditingProgram(false);
  };

  const handleAddWorkpaper = () => {
    const newId = currentWorkpapers.length > 0 ? Math.max(...currentWorkpapers.map(wp => wp.id)) + 1 : 1;
    setCurrentWorkpapers(prev => [...prev, {
      id: newId, title: 'New Audit Procedure', status: 'pending', ref: `WP-${newId.toString().padStart(2, '0')}`, testType: 'Test of Design', objective: '', risk: '', procedures: [{ id: '01', text: '', completed: false }], requiredEvidence: [], uploadedEvidence: []
    }]);
    setActiveStepId(newId);
    setIsEditingProgram(true);
    showNotification("New workpaper added");
  };

  const handleDeleteWorkpaper = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (selectedAudit?.status === 'COMPLETED' || selectedAudit?.status === 'REVIEW') return;
    if (!window.confirm("Delete this workpaper?")) return;
    setCurrentWorkpapers(prev => prev.filter(wp => wp.id !== id));
    if (activeStepId === id) setActiveStepId('findings');
    showNotification("Workpaper deleted");
  };

  const handleRaiseFinding = () => {
    setShowFindingModal(true);
    setNewFindingData({ title: '', description: '', risk: 'MEDIUM', rootCause: '', type: 'FINDING', impact: '', recommendation: '', managementComment: '', action: '' });
  };

  const saveFinding = () => {
    if (!newFindingData.title || !activeWP || !selectedAuditId) return;
    const finding: Finding = {
        id: `F-${Date.now()}`,
        auditId: selectedAuditId,
        title: newFindingData.title,
        description: newFindingData.description,
        riskRating: newFindingData.risk,
        status: 'OPEN',
        identifiedDate: new Date().toISOString().split('T')[0],
        dueDate: 'TBD',
        owner: 'TBD',
        rootCause: newFindingData.rootCause || 'To be determined',
        linkedControl: activeWP.ref,
        type: newFindingData.type,
        impact: newFindingData.impact,
        recommendation: newFindingData.recommendation,
        managementResponse: newFindingData.managementComment,
        actionPlan: newFindingData.action
    };
    onAddFinding(finding);
    setShowFindingModal(false);
    showNotification("Finding raised successfully");
  };

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _workpapers = [...currentWorkpapers];
    const draggedItemContent = _workpapers.splice(dragItem.current, 1)[0];
    _workpapers.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setCurrentWorkpapers(_workpapers);
  };

  if (!selectedAuditId || !selectedAudit) {
    return (
      <div className="space-y-8">
         <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Fieldwork Management</h2>
              <p className="text-slate-500 mt-2">Execute audit steps, document evidence, and raise findings.</p>
            </div>
         </div>
         <div className="flex border-b border-slate-200">
            <button onClick={() => setViewTab('ACTIVE')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${viewTab === 'ACTIVE' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Active ({audits.filter(a => a.status === 'FIELDWORK').length})</button>
            <button onClick={() => setViewTab('PLANNED')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${viewTab === 'PLANNED' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Planned ({audits.filter(a => a.status === 'PLANNED').length})</button>
            <button onClick={() => setViewTab('CLOSED')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${viewTab === 'CLOSED' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Closed ({audits.filter(a => a.status === 'COMPLETED' || a.status === 'REVIEW').length})</button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
            {displayedAudits.map(audit => (
               <div key={audit.id} onClick={() => setSelectedAuditId(audit.id)} className={`bg-white rounded-3xl border shadow-sm hover:shadow-md transition-all cursor-pointer group p-8 flex flex-col h-full ${audit.status === 'COMPLETED' ? 'border-emerald-100 opacity-90' : 'border-slate-100'}`}>
                  <h3 className="font-heading font-bold text-slate-900 text-xl mb-3 group-hover:text-orange-600">{audit.title}</h3>
                  <div className="flex justify-between items-center text-xs text-slate-500"><span className="font-mono bg-slate-50 px-2 py-1 rounded">{audit.code}</span><span>{audit.status}</span></div>
               </div>
            ))}
         </div>
      </div>
    );
  }

  const isClosedAudit = selectedAudit.status === 'COMPLETED' || selectedAudit.status === 'REVIEW';

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-120px)] relative">
      {notification && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
             {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />} <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}
      <div className="flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-4">
            <button onClick={() => setSelectedAuditId(null)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all"><ArrowLeft size={20} /></button>
            <div><h2 className="text-2xl font-heading font-bold text-slate-900">{selectedAudit.title}</h2></div>
        </div>
        <div className="flex gap-3">
           {isClosedAudit ? <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold uppercase flex items-center gap-2"><Lock size={14} /> Read-Only</span> : <span className="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-100 rounded-xl text-xs font-bold uppercase flex items-center gap-2"><Pencil size={14} /> Editing</span>}
        </div>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
        <div className="w-80 flex-shrink-0 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
               <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">Audit Program</span>
               {!isClosedAudit && <button onClick={handleAddWorkpaper} className="text-orange-600 hover:bg-orange-50 p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold"><Plus size={14} /> Add Step</button>}
            </div>
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
              {currentWorkpapers.map((step, index) => (
                <div key={step.id} draggable={!isClosedAudit} onDragStart={() => dragItem.current = index} onDragEnter={() => dragOverItem.current = index} onDragEnd={handleSort} onClick={() => setActiveStepId(step.id)} className={`p-3 rounded-xl text-sm cursor-pointer flex justify-between items-center font-medium transition-all group ${activeStepId === step.id ? 'bg-orange-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-600'}`}>
                  <div className="flex items-center gap-3 truncate flex-1">
                    {!isClosedAudit && <GripVertical size={14} className="cursor-grab opacity-50" />}
                    <span className="truncate">{step.title}</span>
                  </div>
                  {activeStepId === step.id ? <ChevronRight size={16} /> : <StatusIcon status={step.status} />}
                </div>
              ))}
              <div className="my-2 border-t border-slate-100"></div>
              <div onClick={() => setActiveStepId('findings')} className={`p-3 rounded-xl text-sm cursor-pointer flex justify-between items-center font-medium transition-all ${activeStepId === 'findings' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-600'}`}>
                <div className="flex items-center gap-3 truncate"><AlertTriangle size={16} /> <span>Findings Summary</span></div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{allAuditFindings.length}</span>
              </div>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        {activeStepId === 'findings' ? (
           <div className="flex-1 flex flex-col min-w-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                 <h3 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-3"><AlertTriangle className="text-rose-500" /> Findings & Observations</h3>
              </div>
              <div className="flex-1 overflow-x-auto p-0">
                 {allAuditFindings.length > 0 ? (
                    <div className="min-w-[1000px]"><table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200"><tr><th className="px-6 py-4">Risk</th><th className="px-6 py-4">Title</th><th className="px-6 py-4">Observation</th><th className="px-6 py-4">Recommendation</th></tr></thead>
                        <tbody>{allAuditFindings.map(f => (
                            <tr key={f.id} className="hover:bg-slate-50"><td className="px-6 py-4">{f.riskRating}</td><td className="px-6 py-4 font-bold">{f.title}</td><td className="px-6 py-4">{f.description}</td><td className="px-6 py-4">{f.recommendation}</td></tr>
                        ))}</tbody>
                    </table></div>
                 ) : <div className="h-full flex flex-col items-center justify-center text-slate-400">No findings recorded.</div>}
              </div>
           </div>
        ) : activeWP ? (
          <div className="flex-1 flex flex-col min-w-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 px-8 border-b border-slate-100 flex justify-between items-start bg-white/80 backdrop-blur-sm sticky top-0 z-20">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                   {isEditingProgram ? <input type="text" value={activeWP.title} onChange={(e) => handleUpdateField('title', e.target.value)} className="text-2xl font-bold border-b-2 border-orange-500 w-full" /> : <h3 className="text-2xl font-bold text-slate-900">{activeWP.title}</h3>}
                   {!isClosedAudit && <button onClick={() => setIsEditingProgram(!isEditingProgram)} className="p-2 rounded-full hover:bg-slate-50"><Pencil size={16} /></button>}
                </div>
              </div>
              {!isClosedAudit && <div className="flex gap-3"><button onClick={handleSaveDraft} className="px-4 py-2 text-xs bg-white border rounded-xl font-bold">Save Draft</button><button onClick={handleMarkComplete} className="px-4 py-2 text-xs bg-orange-600 text-white rounded-xl font-bold">Mark Complete</button></div>}
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="font-bold text-sm mb-3">Audit Objective</div>
                    {isEditingProgram ? <textarea className="w-full p-3 border rounded-xl" rows={3} value={activeWP.objective} onChange={(e) => handleUpdateField('objective', e.target.value)} /> : <p className="text-sm text-slate-600">{activeWP.objective}</p>}
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="font-bold text-sm mb-3">Risk Statement</div>
                    {isEditingProgram ? <textarea className="w-full p-3 border rounded-xl" rows={3} value={activeWP.risk} onChange={(e) => handleUpdateField('risk', e.target.value)} /> : <p className="text-sm text-slate-600">{activeWP.risk}</p>}
                  </div>
              </div>

              <div className={`transition-all rounded-2xl ${isEditingProgram ? 'p-6 border border-dashed border-orange-200 bg-orange-50/30' : ''}`}>
                <div className="flex justify-between mb-4"><div className="font-bold text-sm">Testing Procedures</div>{isEditingProgram && <button onClick={handleAddProcedure} className="text-xs font-bold text-orange-600">+ Add</button>}</div>
                <div className="space-y-3">
                  {activeWP.procedures.map((proc) => (
                    <div key={proc.id} className="flex gap-4 text-sm p-4 bg-white border rounded-xl shadow-sm items-center">
                      <input type="checkbox" checked={proc.completed} onChange={() => handleProcedureToggle(proc.id)} className="w-4 h-4 text-orange-600" />
                      {isEditingProgram ? <div className="flex-1 flex gap-2"><input value={proc.text} onChange={(e) => handleProcedureChange(proc.id, e.target.value)} className="flex-1 border p-1 rounded" /><button onClick={() => handleDeleteProcedure(proc.id)}><Trash2 size={14}/></button></div> : <span className={proc.completed ? 'line-through text-slate-400' : ''}>{proc.text}</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100"></div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div>
                     <div className="font-bold text-sm mb-4">Observations</div>
                     <textarea className="w-full h-48 p-4 border rounded-2xl text-sm" value={activeWP.findings || ''} onChange={(e) => handleUpdateField('findings', e.target.value)} placeholder="Testing results..." readOnly={isClosedAudit} />
                  </div>
                  <div>
                      <div className="font-bold text-sm mb-4">Conclusion</div>
                      {!isClosedAudit ? (
                          <div className="p-5 rounded-2xl border bg-white h-48 flex flex-col gap-4">
                                <select className="w-full p-3 border rounded-xl" value={conclusionForm.rating} onChange={(e) => setConclusionForm({...conclusionForm, rating: e.target.value as any})}><option value="Effective">Effective</option><option value="Ineffective">Ineffective</option><option value="Needs Improvement">Needs Improvement</option></select>
                                <textarea className="w-full p-3 border rounded-xl h-full resize-none" placeholder="Summary..." value={conclusionForm.summary} onChange={(e) => setConclusionForm({...conclusionForm, summary: e.target.value})} />
                          </div>
                      ) : <div className="p-6 border bg-slate-50 h-48">{activeWP.conclusion ? `${activeWP.conclusion.rating}: ${activeWP.conclusion.summary}` : 'Pending'}</div>}
                  </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4"><label className="font-bold text-sm">Linked Findings</label>{!isClosedAudit && <button onClick={handleRaiseFinding} className="text-xs font-bold text-orange-600 flex items-center gap-2"><Plus size={14}/> Raise Issue</button>}</div>
                <div className="space-y-3">
                    {linkedFindings.map(f => <div key={f.id} className="p-4 rounded-xl border flex justify-between"><div className="font-bold text-sm">{f.title}</div><RiskBadge rating={f.riskRating}/></div>)}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {showFindingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden border">
                <div className="p-5 border-b flex justify-between items-center bg-slate-50"><h3>Raise Issue</h3><button onClick={() => setShowFindingModal(false)}><X size={20}/></button></div>
                <div className="p-8 space-y-4">
                    <input className="w-full border p-3 rounded-xl" placeholder="Title" value={newFindingData.title} onChange={e => setNewFindingData({...newFindingData, title: e.target.value})} />
                    <textarea className="w-full border p-3 rounded-xl" placeholder="Description" rows={3} value={newFindingData.description} onChange={e => setNewFindingData({...newFindingData, description: e.target.value})} />
                    <div className="flex justify-end gap-2"><button onClick={() => setShowFindingModal(false)} className="px-4 py-2">Cancel</button><button onClick={saveFinding} className="px-4 py-2 bg-orange-600 text-white rounded-xl font-bold">Save</button></div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
