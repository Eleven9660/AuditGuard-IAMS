
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AuditPlan } from './components/AuditPlan';
import { FindingsManager } from './components/FindingsManager';
import { StandardsDocs } from './components/StandardsDocs';
import { Fieldwork } from './components/Fieldwork';
import { Reporting } from './components/Reporting';
import { Settings } from './components/Settings';
import { KPITracker } from './components/KPITracker';
import { Notifications } from './components/Notifications';
import { MOCK_AUDITS, MOCK_FINDINGS, MOCK_ACTIONS, TEMPLATE_STORE, REPORT_CONFIG } from './constants';
import { Finding, Audit, ActionItem, AuditTemplate, ReportSectionConfig } from './types';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  
  // --- Global State ---
  const [audits, setAudits] = useState<Audit[]>(MOCK_AUDITS);
  const [findings, setFindings] = useState<Finding[]>(MOCK_FINDINGS);
  const [actions, setActions] = useState<Record<string, ActionItem[]>>(MOCK_ACTIONS);
  const [templates, setTemplates] = useState<AuditTemplate[]>(TEMPLATE_STORE);
  const [reportConfig, setReportConfig] = useState<Record<string, ReportSectionConfig[]>>(REPORT_CONFIG);

  // --- Handlers ---

  const handleAddFinding = (newFinding: Finding) => {
    setFindings(prev => [newFinding, ...prev]);
  };

  const handleUpdateFinding = (id: string, updates: Partial<Finding>) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleUpdateActions = (findingId: string, newActions: ActionItem[]) => {
      setActions(prev => ({
          ...prev,
          [findingId]: newActions
      }));
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
          audits={audits} 
          findings={findings} 
          actions={actions} 
        />;
      case 'planning':
        return <AuditPlan 
          audits={audits} 
          setAudits={setAudits} 
          templates={templates}
        />;
      case 'findings':
        return <FindingsManager 
          onNavigate={setCurrentView} 
          findings={findings}
          onAddFinding={handleAddFinding}
          onUpdateFinding={handleUpdateFinding}
          actions={actions}
          onUpdateActions={handleUpdateActions}
        />;
      case 'fieldwork':
        return <Fieldwork 
          onNavigate={setCurrentView} 
          audits={audits}
          findings={findings}
          onAddFinding={handleAddFinding}
          onUpdateFinding={handleUpdateFinding}
          templates={templates}
        />;
      case 'reports':
        return <Reporting 
          audits={audits}
          findings={findings}
          actions={actions}
          reportConfig={reportConfig}
        />;
      case 'kpi':
        return <KPITracker />;
      case 'notifications':
        return <Notifications />;
      case 'standards':
        return <StandardsDocs />;
      case 'settings':
        return <Settings 
          templates={templates}
          setTemplates={setTemplates}
          reportConfig={reportConfig}
          setReportConfig={setReportConfig}
        />;
      default:
        return <Dashboard audits={audits} findings={findings} actions={actions} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 ml-72 p-8 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;
