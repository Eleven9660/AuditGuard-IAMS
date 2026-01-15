
import React, { useState, useMemo } from 'react';
import { FileText, ShieldCheck, Send, Printer, Calendar, FileBarChart, Download, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Audit, Finding, ActionItem, ReportSectionConfig, RiskRating } from '../types';

interface ReportingProps {
    audits: Audit[];
    findings: Finding[];
    actions: Record<string, ActionItem[]>;
    reportConfig: Record<string, ReportSectionConfig[]>;
}

const EditableHeader = ({ defaultValue, className = "" }: { defaultValue: string, className?: string }) => {
    const [value, setValue] = useState(defaultValue);
    return (
        <div className="group relative break-inside-avoid">
            <input className={`w-full bg-transparent border-none focus:ring-0 p-0 ${className} print:hidden focus:bg-orange-50/50 rounded px-1 -ml-1 transition-colors outline-none`} value={value} onChange={(e) => setValue(e.target.value)} />
            <div className={`hidden print:block ${className}`}>{value}</div>
        </div>
    );
};

const EditableParagraph = ({ defaultValue, className = "" }: { defaultValue: string, className?: string }) => {
    const [value, setValue] = useState(defaultValue);
    return (
        <div className="group relative break-inside-avoid mb-4">
            <textarea className={`w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-500/10 p-2 -ml-2 rounded-lg transition-all outline-none resize-y overflow-hidden print:hidden ${className}`} value={value} onChange={(e) => setValue(e.target.value)} rows={3} />
            <div className={`hidden print:block ${className} whitespace-pre-wrap`}>{value}</div>
        </div>
    );
};

const EditableSection = ({ label, defaultValue, heightClass = "h-32", className = "", titleClass }: { label?: string, defaultValue: string, heightClass?: string, className?: string, titleClass?: string }) => {
    const [value, setValue] = useState(defaultValue);
    const [title, setTitle] = useState(label || "");
    const effectiveTitleClass = titleClass || "block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5 transition-colors group-focus-within:text-orange-600";

    return (
        <div className={`break-inside-avoid mb-6 group ${className}`}>
            {label && (
                <div className="mb-2">
                     <input className={`w-full bg-transparent border-none p-0 ${effectiveTitleClass} print:hidden focus:bg-orange-50/50 rounded px-1 -ml-1 transition-colors outline-none cursor-text`} value={title} onChange={(e) => setTitle(e.target.value)} />
                    <div className={`hidden print:block ${effectiveTitleClass}`}>{title}</div>
                </div>
            )}
            <textarea className={`w-full ${heightClass} p-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none leading-relaxed text-slate-700 resize-y print:hidden shadow-inner transition-all`} value={value} onChange={(e) => setValue(e.target.value)} />
            <div className="hidden print:block text-sm text-slate-800 leading-relaxed whitespace-pre-wrap text-justify border-none p-0 font-serif">{value}</div>
        </div>
    );
};

const A4Page = ({ children, className = "", orientation = "portrait" }: { children?: React.ReactNode, className?: string, orientation?: "portrait" | "landscape" }) => {
    const isLandscape = orientation === "landscape";
    const containerClasses = isLandscape ? "w-[297mm] min-h-[210mm]" : "w-[210mm] min-h-[297mm]";
    const printClasses = isLandscape ? "print-landscape" : "";
    return <div className={`${containerClasses} bg-white shadow-2xl mx-auto p-[25mm] mb-8 relative print:shadow-none print:w-full print:min-h-0 print:mb-0 print:p-0 print:mx-0 break-after-page ${printClasses} ${className}`}>{children}</div>;
};

export const Reporting: React.FC<ReportingProps> = ({ audits, findings, actions, reportConfig }) => {
  const defaultAuditId = audits[0]?.id || "";
  const [reportType, setReportType] = useState<'ENGAGEMENT' | 'MONTHLY' | 'BOARD'>('ENGAGEMENT');
  const [selectedAuditId, setSelectedAuditId] = useState<string>(defaultAuditId);
  const [activeTab, setActiveTab] = useState<'DRAFT' | 'QA' | 'FINAL'>('DRAFT');

  const getConfig = (type: string, id: string) => reportConfig[type]?.find(c => c.id === id)?.defaultValue || '';

  const selectedAudit = audits.find(a => a.id === selectedAuditId);
  const auditFindings = findings.filter(f => f.auditId === selectedAuditId);
  const activeAudits = audits.filter(a => ['FIELDWORK', 'REVIEW', 'CONTINUOUS'].includes(a.status));

  // --- BOARD REPORT STATS ---
  const quarterStats = useMemo(() => {
      const stats = ['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
          const qAudits = audits.filter(a => a.quarter.includes(q) && a.quarter !== 'All');
          return {
              name: q,
              planned: qAudits.filter(a => a.status === 'PLANNED').length,
              completed: qAudits.filter(a => a.status === 'COMPLETED').length,
              inProgress: qAudits.filter(a => ['FIELDWORK', 'REVIEW'].includes(a.status)).length,
              deferred: 0
          };
      });
      return [...stats];
  }, [audits]);

  const highRiskFindings = findings.filter(f => f.riskRating === 'HIGH');
  const actionPlanChartData = useMemo(() => {
      const data = { HIGH: { name: 'High', Open: 0, PastDue: 0 }, MEDIUM: { name: 'Medium', Open: 0, PastDue: 0 }, LOW: { name: 'Low', Open: 0, PastDue: 0 } };
      findings.forEach(f => {
          const findingActions = actions[f.id] || [];
          findingActions.forEach(a => {
              if (a.status !== 'Completed') {
                  const r = f.riskRating;
                  if (data[r]) {
                      data[r].Open += 1;
                      if (new Date(a.dueDate) < new Date()) data[r].PastDue += 1;
                  }
              }
          });
      });
      return Object.values(data);
  }, [findings, actions]);

  const RiskBadge = ({ rating }: { rating: string }) => {
      const styles = rating === 'HIGH' ? 'bg-rose-100 text-rose-800' : rating === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';
      return <span className={`text-[10px] font-bold px-2 py-1 rounded border border-transparent ${styles}`}>{rating}</span>
  };

  return (
    <div className="space-y-8 h-[calc(100vh-100px)] flex flex-col">
      <style>{`@media print { @page { size: A4 portrait; margin: 1.5cm; } @page landscape { size: A4 landscape; margin: 1cm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; font-family: 'Times New Roman', serif; } .print-hidden { display: none !important; } .print-visible { display: block !important; } }`}</style>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 print-hidden flex-shrink-0">
        <div><h2 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Report Generator</h2><p className="text-slate-500 mt-2">Create audit reports, monthly updates, and board packs.</p></div>
        <div className="flex flex-wrap gap-3">
            <div className="bg-white p-1.5 rounded-xl flex border border-slate-200 shadow-sm">
                {(['ENGAGEMENT', 'MONTHLY', 'BOARD'] as const).map(t => (
                    <button key={t} onClick={() => setReportType(t)} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${reportType === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                        {t === 'ENGAGEMENT' ? <FileText size={16} /> : t === 'MONTHLY' ? <Calendar size={16} /> : <FileBarChart size={16} />} {t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>
            <button onClick={() => window.print()} className="px-4 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-transform hover:-translate-y-0.5"><Printer size={18} /> Print</button>
        </div>
      </div>

      {reportType === 'ENGAGEMENT' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 print:block items-stretch flex-1 min-h-0">
            <div className="lg:col-span-1 print-hidden h-full">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-500 uppercase tracking-wide">Select Engagement</div>
                    <div className="divide-y divide-slate-50 overflow-y-auto flex-1 p-2 space-y-1">
                        {audits.map(audit => (
                            <div key={audit.id} onClick={() => setSelectedAuditId(audit.id)} className={`p-3 rounded-xl cursor-pointer transition-all border-l-4 ${selectedAuditId === audit.id ? 'bg-orange-50 border-orange-500 shadow-sm' : 'border-transparent hover:bg-slate-50'}`}>
                                <p className={`text-sm font-bold leading-tight ${selectedAuditId === audit.id ? 'text-orange-900' : 'text-slate-700'}`}>{audit.title}</p>
                                <div className="flex justify-between items-center mt-3"><span className="text-xs text-slate-400 font-mono">{audit.code}</span><span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full">{audit.status}</span></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-3 print:w-full h-full flex flex-col">
                {selectedAudit && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col print:border-none print:shadow-none h-full overflow-hidden">
                        <div className="flex border-b border-slate-100 bg-white/80 backdrop-blur-md z-10 print-hidden pt-2 px-2 flex-shrink-0">
                            {['DRAFT', 'QA', 'FINAL'].map((tab) => <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-8 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === tab ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{tab === 'DRAFT' ? 'Report Draft' : tab === 'QA' ? 'QA Review' : 'Final Issuance'}</button>)}
                        </div>
                        <div className="flex-1 bg-slate-100 p-8 overflow-y-auto print:bg-white print:p-0 print:overflow-visible">
                            {activeTab === 'DRAFT' && (
                                <div className="w-full mx-auto print:w-full">
                                    <A4Page className="flex flex-col items-center justify-center text-center">
                                        <div className="mb-20 w-full"><EditableHeader defaultValue="Carbacid (Co2) Limited" className="text-4xl font-bold text-slate-900 font-sans mb-4 text-center" /></div>
                                        <div className="mb-8 w-full"><h2 className="text-3xl font-bold text-slate-900 font-sans max-w-2xl leading-tight mx-auto">{selectedAudit.title}</h2></div>
                                    </A4Page>
                                    <A4Page>
                                        <EditableSection label="1 EXECUTIVE SUMMARY" titleClass="text-lg font-bold text-slate-900 uppercase mb-4" defaultValue={getConfig('ENGAGEMENT', 'exec_summary').replace('[Audit Title]', selectedAudit.title)} heightClass="h-20" />
                                        <EditableHeader defaultValue="Key Risks & Recommended Actions" className="text-sm font-bold text-slate-800 uppercase mb-3" />
                                        <table className="w-full text-sm text-left border border-slate-300 mb-8">
                                            <thead className="bg-slate-100 text-slate-900 font-bold"><tr><th className="border p-2">Risk</th><th className="border p-2">Rating</th><th className="border p-2">Recommendation</th></tr></thead>
                                            <tbody>{auditFindings.map(f => <tr key={f.id}><td className="border p-2">{f.title}</td><td className="border p-2 text-center font-bold">{f.riskRating}</td><td className="border p-2">{f.recommendation}</td></tr>)}</tbody>
                                        </table>
                                        <EditableSection label="2 PURPOSE OF THE AUDIT" titleClass="text-lg font-bold text-slate-900 uppercase mb-4" defaultValue={getConfig('ENGAGEMENT', 'purpose')} heightClass="h-20" />
                                    </A4Page>
                                </div>
                            )}
                            {activeTab === 'FINAL' && (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-20 print-hidden">
                                    <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center animate-pulse"><CheckCircle size={48} /></div>
                                    <h3 className="text-3xl font-bold text-slate-900 mb-3">Ready for Issuance</h3>
                                    <div className="flex gap-4"><button className="px-6 py-3.5 bg-orange-600 text-white rounded-xl font-bold shadow-lg">Issue Final Report</button></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
      {reportType === 'BOARD' && (
           <div className="max-w-5xl mx-auto bg-white border border-slate-200 shadow-xl rounded-none my-6 print:border-none print:shadow-none print:w-full min-h-[1000px] p-16 flex-1 overflow-auto">
                  <EditableHeader defaultValue="Board Briefing" className="text-4xl font-serif font-bold text-slate-900 mb-2" />
                  <div className="space-y-12">
                      <section className="print-break-inside-avoid"><EditableSection label="1. EXECUTIVE SUMMARY" defaultValue={getConfig('BOARD', 'board_exec_summary')} heightClass="h-40" /></section>
                      <section className="print-break-inside-avoid">
                          <EditableHeader defaultValue="3. HIGH-RISK FINDINGS SUMMARY" className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4 border-l-4 border-slate-900 pl-4" />
                          <table className="w-full text-[11px] text-left border border-slate-200 mb-8"><thead className="bg-slate-50 font-bold text-slate-700"><tr><th className="border p-2">Finding</th><th className="border p-2">Risk</th><th className="border p-2">Response</th></tr></thead><tbody>{highRiskFindings.map(f => <tr key={f.id}><td className="border p-2">{f.title}</td><td className="border p-2"><RiskBadge rating={f.riskRating}/></td><td className="border p-2">{f.managementResponse}</td></tr>)}</tbody></table>
                      </section>
                      <section className="print-break-inside-avoid">
                           <EditableHeader defaultValue="4. REMEDIATION STATUS" className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4 border-l-4 border-slate-900 pl-4" />
                           <div className="h-64 mb-6"><ResponsiveContainer width="100%" height="100%"><BarChart data={actionPlanChartData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Legend/><Bar dataKey="Open" fill="#f97316"/><Bar dataKey="PastDue" fill="#ef4444"/></BarChart></ResponsiveContainer></div>
                      </section>
                  </div>
           </div>
      )}
    </div>
  );
};
