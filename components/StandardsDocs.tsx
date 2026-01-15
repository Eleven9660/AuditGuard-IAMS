
import React from 'react';
import { BookOpen, Database, Shield, Layers, FileText, CheckCircle, GitMerge, Landmark } from 'lucide-react';

export const StandardsDocs: React.FC = () => {
  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16">
      <div className="bg-gradient-to-br from-orange-900 to-slate-900 p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-4xl font-heading font-bold mb-3 tracking-tight">Governance & Standards Framework</h1>
            <p className="text-orange-100 text-lg max-w-2xl">System architecture, deliverables, and alignment with the IIA Global Internal Audit Standards (2024).</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Strategic Alignment: Three Lines Model */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 mb-6">
           <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-purple-600"><GitMerge size={24} /></div>
           <h2 className="text-2xl font-heading font-bold text-slate-900">Strategic Alignment: IIA Three Lines Model</h2>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-600 mb-8 leading-relaxed max-w-4xl">
                AuditGuard is architected to function as the technology enabler for the <strong className="text-emerald-600">Third Line</strong>, maintaining independence while facilitating rigorous interaction with Management (1st and 2nd Lines) and reporting to the Governing Body.
            </p>
            
            {/* Diagram container */}
            <div className="relative border border-slate-100 rounded-2xl p-10 bg-slate-50/50">
                {/* Top: Governing Body */}
                <div className="mx-auto max-w-lg bg-slate-800 text-white p-5 rounded-xl text-center mb-10 shadow-lg relative z-10">
                    <div className="flex justify-center mb-2 text-orange-300"><Landmark size={24} /></div>
                    <h4 className="font-bold text-lg">Governing Body</h4>
                    <p className="text-sm text-slate-400">Accountability to stakeholders • Oversight</p>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-slate-300 border-l-2 border-dashed border-slate-300"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Management Group (1st and 2nd Lines) */}
                    <div className="md:col-span-8 border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-white relative">
                        <div className="absolute -top-3 left-8 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500 uppercase tracking-wider">Management (Risk Owners)</div>
                        
                        <div className="grid grid-cols-2 gap-6 h-full">
                            {/* 1st Line */}
                            <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl text-center flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="font-bold text-blue-900 mb-2 text-lg">First Line</div>
                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-3">Operational Management</p>
                                <p className="text-sm text-slate-600 leading-snug">Provision of products/services; managing risk</p>
                                <div className="mt-6 pt-4 border-t border-blue-200 text-xs text-slate-500">
                                   Audited via <strong>Fieldwork Module</strong>
                                </div>
                            </div>

                            {/* 2nd Line */}
                            <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl text-center flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="font-bold text-orange-900 mb-2 text-lg">Second Line</div>
                                <p className="text-xs text-orange-600 font-bold uppercase tracking-wide mb-3">Risk & Compliance</p>
                                <p className="text-sm text-slate-600 leading-snug">Expertise, support, monitoring, and challenge on risk-related matters</p>
                                 <div className="mt-6 pt-4 border-t border-orange-200 text-xs text-slate-500">
                                   Audited via <strong>Risk & Control Matrix</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3rd Line: Audit */}
                    <div className="md:col-span-4 bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center shadow-lg transform md:-translate-y-6 flex flex-col justify-center relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wider border border-emerald-200 rounded-full">AuditGuard Scope</div>
                        <div className="font-bold text-emerald-900 mb-1 text-2xl">Third Line</div>
                        <div className="font-medium text-emerald-700 mb-4">(Internal Audit)</div>
                        <p className="text-sm text-emerald-800 mb-6 font-medium">Independent and objective assurance and advice</p>
                        
                        <div className="space-y-3">
                           <div className="bg-white/80 border border-emerald-100 rounded-lg p-3 shadow-sm text-left flex items-center gap-3">
                              <CheckCircle size={16} className="text-emerald-500"/>
                              <span className="text-xs font-bold text-slate-700">Risk-Based Planning</span>
                           </div>
                           <div className="bg-white/80 border border-emerald-100 rounded-lg p-3 shadow-sm text-left flex items-center gap-3">
                              <CheckCircle size={16} className="text-emerald-500"/>
                              <span className="text-xs font-bold text-slate-700">Evidence Integrity</span>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Standards Mapping */}
      <section>
        <div className="flex items-center gap-4 mb-6">
           <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-emerald-600"><BookOpen size={24} /></div>
           <h2 className="text-2xl font-heading font-bold text-slate-900">Standards Alignment Matrix</h2>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="p-5">App Module</th>
                <th className="p-5">Global Internal Audit Standards (2024)</th>
                <th className="p-5">ISO 19011 Clause</th>
                <th className="p-5">System Enforcement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-5 font-bold text-slate-800">Audit Plan</td>
                <td className="p-5">
                  <div className="font-bold text-slate-800 mb-1">Domain 4: Managing the Function</div>
                  <div className="text-xs text-slate-500">Principle 9: Plan Strategically (Risk-based)</div>
                </td>
                <td className="p-5 text-slate-600">5.2 Establishing audit programme</td>
                <td className="p-5 text-slate-600">Dynamic risk rating logic prioritizes high-risk entities.</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-5 font-bold text-slate-800">Fieldwork</td>
                <td className="p-5">
                   <div className="font-bold text-slate-800 mb-1">Domain 5: Performing Services</div>
                   <div className="text-xs text-slate-500">Principle 13: Gather Information</div>
                </td>
                <td className="p-5 text-slate-600">6.4 Conducting audit activities</td>
                <td className="p-5 text-slate-600">Mandatory evidence upload before workpaper closure.</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-5 font-bold text-slate-800">Reporting</td>
                <td className="p-5">
                   <div className="font-bold text-slate-800 mb-1">Domain 5: Performing Services</div>
                   <div className="text-xs text-slate-500">Principle 15: Communicate Results</div>
                </td>
                <td className="p-5 text-slate-600">6.5 Preparing audit report</td>
                <td className="p-5 text-slate-600">Tamper-evident final reports locked after issuance.</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-5 font-bold text-slate-800">Monitoring</td>
                <td className="p-5">
                   <div className="font-bold text-slate-800 mb-1">Domain 5: Performing Services</div>
                   <div className="text-xs text-slate-500">Principle 15: Monitor Progress</div>
                </td>
                <td className="p-5 text-slate-600">6.6 Completing audit</td>
                <td className="p-5 text-slate-600">Automated CAP (Corrective Action Plan) aging and escalation.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Architecture Section */}
      <section>
        <div className="flex items-center gap-4 mb-6">
           <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-blue-600"><Layers size={24} /></div>
           <h2 className="text-2xl font-heading font-bold text-slate-900">System Architecture</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <h3 className="font-bold text-lg text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div> Frontend (Logical)
             </h3>
             <ul className="space-y-3 text-sm text-slate-600">
               <li className="flex gap-2"><span className="text-slate-400">•</span> <strong>Framework:</strong> React 18 + TypeScript (Strict Mode)</li>
               <li className="flex gap-2"><span className="text-slate-400">•</span> <strong>State Management:</strong> React Context API (Global) + React Query (Server state)</li>
               <li className="flex gap-2"><span className="text-slate-400">•</span> <strong>Styling:</strong> Tailwind CSS (Utility-first, responsive)</li>
               <li className="flex gap-2"><span className="text-slate-400">•</span> <strong>Visualization:</strong> Recharts for dashboards</li>
               <li className="flex gap-2"><span className="text-slate-400">•</span> <strong>Security:</strong> Client-side route guards based on Role (Auditor vs Manager)</li>
             </ul>
           </div>
           <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <h3 className="font-bold text-lg text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div> Backend & Data (Physical)
             </h3>
             <ul className="space-y-3 text-sm text-slate-600">
               <li className="flex gap-2"><span className="text-slate-400">•</span> <strong>API Layer:</strong> RESTful Node.js / Express or Serverless Functions</li>
               <li className="flex gap-2"><span className="text-slate-400">•</span> <strong>Database:</strong> PostgreSQL (Relational integrity for Audit linkage)</li>
               <li className="flex gap-2"><span className="text-slate-400">•</span> <strong>Storage:</strong> S3 Compatible Object Storage (Encrypted Evidence)</li>
               <li className="flex gap-2"><span className="text-slate-400">•</span> <strong>Auth:</strong> OIDC / SAML integration (MFA enforced)</li>
               <li className="flex gap-2"><span className="text-slate-400">•</span> <strong>Audit Logs:</strong> Immutable append-only ledger for all transactions</li>
             </ul>
           </div>
        </div>
      </section>

      {/* Security Features */}
      <section>
        <div className="flex items-center gap-4 mb-6">
           <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-rose-600"><Shield size={24} /></div>
           <h2 className="text-2xl font-heading font-bold text-slate-900">Security & Audit Trail</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
             <div className="flex items-center gap-3 mb-3 font-bold text-slate-900">
               <CheckCircle size={20} className="text-emerald-500"/> Tamper-Evident Logs
             </div>
             <p className="text-sm text-slate-500 leading-relaxed">Every record modification creates a SHA-256 hashed log entry. Histories cannot be overwritten, only appended.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
             <div className="flex items-center gap-3 mb-3 font-bold text-slate-900">
               <CheckCircle size={20} className="text-emerald-500"/> Role Segregation
             </div>
             <p className="text-sm text-slate-500 leading-relaxed">Auditors have R/W access. Management is restricted to Action Plan updates only. Audit Committee is Read-Only.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
             <div className="flex items-center gap-3 mb-3 font-bold text-slate-900">
               <CheckCircle size={20} className="text-emerald-500"/> Evidence Integrity
             </div>
             <p className="text-sm text-slate-500 leading-relaxed">Files uploaded are immutable. Deletion requires "Dual Control" (Approval from a second admin).</p>
          </div>
        </div>
      </section>

      {/* Deliverables Checklist */}
       <section>
        <div className="flex items-center gap-4 mb-6">
           <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-amber-600"><FileText size={24} /></div>
           <h2 className="text-2xl font-heading font-bold text-slate-900">Deliverable Checklist</h2>
        </div>
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
           <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium text-slate-700">
             <li className="flex items-center gap-3"><CheckCircle size={16} className="text-orange-600"/> System Architecture (Logical+Physical)</li>
             <li className="flex items-center gap-3"><CheckCircle size={16} className="text-orange-600"/> Data Model / ER Diagram</li>
             <li className="flex items-center gap-3"><CheckCircle size={16} className="text-orange-600"/> Module-level Functional Req</li>
             <li className="flex items-center gap-3"><CheckCircle size={16} className="text-orange-600"/> Role-based Access Matrix</li>
             <li className="flex items-center gap-3"><CheckCircle size={16} className="text-orange-600"/> Sample Dashboards & Reports</li>
             <li className="flex items-center gap-3"><CheckCircle size={16} className="text-orange-600"/> Security & Audit Trail Design</li>
             <li className="flex items-center gap-3"><CheckCircle size={16} className="text-orange-600"/> Standards Mapping Matrix (Updated IIA 2024)</li>
             <li className="flex items-center gap-3"><CheckCircle size={16} className="text-orange-600"/> MVP Feature Set</li>
           </ul>
        </div>
      </section>
    </div>
  );
};
