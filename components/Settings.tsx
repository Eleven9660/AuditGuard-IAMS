
import React, { useState } from 'react';
import { User, Bell, Shield, Sliders, Save, Check, LayoutTemplate, FileText, Users, ChevronDown, ArrowLeft, ListChecks, GripVertical, Plus, Trash2, Edit2, PlusCircle, FileBarChart, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { AuditTemplate, AuditTemplateStep, ReportSectionConfig, User as UserType } from '../types';
import { MOCK_USERS } from '../constants';

interface SettingsProps {
    templates: AuditTemplate[];
    setTemplates: React.Dispatch<React.SetStateAction<AuditTemplate[]>>;
    reportConfig: Record<string, ReportSectionConfig[]>;
    setReportConfig: React.Dispatch<React.SetStateAction<Record<string, ReportSectionConfig[]>>>;
}

export const Settings: React.FC<SettingsProps> = ({ templates, setTemplates, reportConfig, setReportConfig }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'notifications' | 'security' | 'system' | 'templates' | 'reports'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [users, setUsers] = useState<UserType[]>(MOCK_USERS);
  const [editingTemplate, setEditingTemplate] = useState<AuditTemplate | null>(null);
  const [activeReportType, setActiveReportType] = useState<'ENGAGEMENT' | 'MONTHLY' | 'BOARD'>('ENGAGEMENT');

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 3000); }, 1000);
  };

  const handleReportConfigChange = (type: string, id: string, field: 'label' | 'defaultValue', value: string) => {
      setReportConfig(prev => ({ ...prev, [type]: prev[type].map(section => section.id === id ? { ...section, [field]: value } : section) }));
  };

  const handleAddReportSection = (type: string) => {
      const newSection: ReportSectionConfig = { id: `SEC-${Date.now()}`, label: 'New Report Section', defaultValue: 'Enter boilerplate text here...', rows: 3 };
      setReportConfig(prev => ({ ...prev, [type]: [...prev[type], newSection] }));
  };

  const handleRemoveReportSection = (type: string, id: string) => {
      if(!window.confirm("Remove section?")) return;
      setReportConfig(prev => ({ ...prev, [type]: prev[type].filter(s => s.id !== id) }));
  };

  const handleDeleteTemplate = (id: string) => { if (window.confirm("Delete template?")) setTemplates(prev => prev.filter(t => t.id !== id)); };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
        setTemplates(prev => prev.some(t => t.id === editingTemplate.id) ? prev.map(t => t.id === editingTemplate.id ? editingTemplate : t) : [...prev, editingTemplate]);
        setEditingTemplate(null);
    }
  };

  const handleAddStep = () => {
    if (editingTemplate) setEditingTemplate({ ...editingTemplate, steps: [...editingTemplate.steps, { id: `STEP-${Date.now()}`, title: "New Step", objective: "", risk: "", procedures: [""] }] });
  };

  const updateStep = (stepId: string, field: keyof AuditTemplateStep, value: any) => {
      if (editingTemplate) setEditingTemplate({ ...editingTemplate, steps: editingTemplate.steps.map(s => s.id === stepId ? { ...s, [field]: value } : s) });
  };

  const tabs = [{ id: 'profile', label: 'My Profile', icon: User }, { id: 'team', label: 'Team Management', icon: Users }, { id: 'templates', label: 'Audit Templates', icon: LayoutTemplate }, { id: 'reports', label: 'Report Config', icon: FileText }];

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-end">
        <h2 className="text-3xl font-heading font-bold text-slate-900">Settings</h2>
        <button onClick={handleSave} disabled={isLoading} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${showSuccess ? 'bg-emerald-500' : 'bg-slate-900'}`}>{showSuccess ? <><Check size={18} /> Saved</> : <><Save size={18} /> Save Changes</>}</button>
      </div>
      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-2">
          {tabs.map((tab) => { const Icon = tab.icon; return <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 border ${activeTab === tab.id ? 'bg-white border-orange-100 shadow-lg' : 'hover:bg-white hover:border-slate-100'}`}><Icon size={20} /> <span className="font-bold text-sm">{tab.label}</span></button>; })}
        </aside>
        <main className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 overflow-y-auto custom-scrollbar">
          {activeTab === 'profile' && <div><h3 className="text-xl font-bold mb-4">Profile Settings</h3><p className="text-slate-500">Manage user details here.</p></div>}
          {activeTab === 'templates' && (
            <div className="space-y-8">
                {!editingTemplate ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div onClick={() => setEditingTemplate({ id: `T-${Date.now()}`, name: "New Template", description: "", riskProfile: 'MEDIUM', steps: [] })} className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-orange-400 hover:bg-orange-50"><Plus size={24} className="text-orange-600 mb-2"/><span className="font-bold text-orange-700">Create Template</span></div>
                        {templates.map(t => <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md relative group"><div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={() => setEditingTemplate(t)} className="p-2 hover:bg-slate-100 rounded-lg"><Edit2 size={16}/></button><button onClick={() => handleDeleteTemplate(t.id)} className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg"><Trash2 size={16}/></button></div><h4 className="font-bold text-slate-900">{t.name}</h4><p className="text-sm text-slate-500 mt-2 line-clamp-2">{t.description}</p></div>)}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b pb-4"><button onClick={() => setEditingTemplate(null)}><ArrowLeft size={20}/></button><h3 className="text-xl font-bold">Editing Template</h3><button onClick={handleSaveTemplate} className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold">Save</button></div>
                        <div className="grid gap-6 bg-slate-50 p-6 rounded-2xl"><input className="w-full p-3 border rounded-xl" value={editingTemplate.name} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})} placeholder="Template Name" /><textarea className="w-full p-3 border rounded-xl" value={editingTemplate.description} onChange={e => setEditingTemplate({...editingTemplate, description: e.target.value})} placeholder="Description" /></div>
                        <div><div className="flex justify-between mb-4"><h4 className="font-bold">Steps</h4><button onClick={handleAddStep} className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg">+ Add Step</button></div><div className="space-y-4">{editingTemplate.steps.map((step, idx) => <div key={step.id} className="border p-4 rounded-xl"><input className="font-bold text-lg border-none w-full" value={step.title} onChange={e => updateStep(step.id, 'title', e.target.value)} placeholder="Step Title" /><textarea className="w-full mt-2 p-2 border rounded" value={step.objective} onChange={e => updateStep(step.id, 'objective', e.target.value)} placeholder="Objective" /></div>)}</div></div>
                    </div>
                )}
            </div>
          )}
          {activeTab === 'reports' && (
            <div className="space-y-8">
                <div className="flex justify-between items-center border-b pb-6"><div><h3 className="text-xl font-bold">Report Config</h3></div><div className="flex bg-slate-100 p-1 rounded-xl">{(['ENGAGEMENT', 'MONTHLY', 'BOARD'] as const).map(t => <button key={t} onClick={() => setActiveReportType(t)} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeReportType === t ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>{t}</button>)}</div></div>
                <div className="grid gap-6">{reportConfig[activeReportType].map((section) => <div key={section.id} className="bg-white border p-6 rounded-2xl shadow-sm relative group"><button onClick={() => handleRemoveReportSection(activeReportType, section.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-50 text-rose-500 rounded"><Trash2 size={16}/></button><input className="font-bold text-sm w-full mb-2" value={section.label} onChange={(e) => handleReportConfigChange(activeReportType, section.id, 'label', e.target.value)} /><textarea className="w-full p-3 bg-slate-50 border rounded-xl text-sm" rows={3} value={section.defaultValue} onChange={(e) => handleReportConfigChange(activeReportType, section.id, 'defaultValue', e.target.value)} /></div>)}<button onClick={() => handleAddReportSection(activeReportType)} className="w-full py-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-bold hover:bg-orange-50 hover:text-orange-600"><PlusCircle size={18}/> Add Section</button></div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
