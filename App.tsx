
import React, { useState, useMemo } from 'react';
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
import { REPORT_CONFIG } from './constants';
import { Finding, Audit, ActionItem, AuditTemplate, ReportSectionConfig } from './types';
import { useAudits, useFindings, useActionItems, useTemplates } from './src/hooks';
import { useAuth } from './src/context/AuthContext';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const { user, isLoading: authLoading } = useAuth();

  // --- Data Hooks ---
  const {
    audits: rawAudits,
    isLoading: auditsLoading,
    createAudit,
    updateAudit,
    deleteAudit
  } = useAudits();

  const {
    findings: rawFindings,
    isLoading: findingsLoading,
    createFinding,
    updateFinding: updateFindingApi
  } = useFindings();

  const {
    actionItems: rawActionItems,
    isLoading: actionsLoading,
    createActionItem,
    updateActionItem
  } = useActionItems();

  const {
    templates: rawTemplates,
    isLoading: templatesLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate
  } = useTemplates();

  // Report config remains local for now (can be migrated later)
  const [reportConfig, setReportConfig] = useState<Record<string, ReportSectionConfig[]>>(REPORT_CONFIG);

  // Transform database data to match component expectations
  const audits: Audit[] = useMemo(() => {
    return rawAudits.map(a => ({
      id: a.id,
      code: a.code,
      section: a.section,
      category: a.category,
      title: a.title,
      quarter: a.quarter || '',
      year: a.year,
      status: a.status as Audit['status'],
      riskRating: a.riskRating as Audit['riskRating'],
      auditor: a.auditor || '',
      processOwner: a.processOwner || '',
      standardsMap: (a.standardsMap || []) as Audit['standardsMap'],
      progress: a.progress || 0,
      monthlyDistribution: (a.monthlyDistribution || {}) as Record<string, number>,
      budgetedDays: a.budgetedDays || 0,
      templateId: a.templateId || undefined,
    }));
  }, [rawAudits]);

  const findings: Finding[] = useMemo(() => {
    return rawFindings.map(f => ({
      id: f.id,
      auditId: f.auditId,
      title: f.title,
      description: f.description || '',
      riskRating: f.riskRating as Finding['riskRating'],
      status: f.status as Finding['status'],
      type: f.type as Finding['type'],
      identifiedDate: f.identifiedDate || '',
      dueDate: f.dueDate || '',
      owner: f.owner || '',
      rootCause: f.rootCause || '',
      linkedControl: f.linkedControl || '',
      impact: f.impact || '',
      recommendation: f.recommendation || '',
      managementResponse: f.managementResponse || '',
      actionPlan: f.actionPlan || '',
    }));
  }, [rawFindings]);

  // Group action items by finding ID for component compatibility
  const actions: Record<string, ActionItem[]> = useMemo(() => {
    const grouped: Record<string, ActionItem[]> = {};
    rawActionItems.forEach(a => {
      const action: ActionItem = {
        id: a.id,
        description: a.description,
        owner: a.owner,
        dueDate: a.dueDate || '',
        status: (a.status === 'NOT_STARTED' ? 'Not Started' :
                 a.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed') as ActionItem['status'],
        evidence: (a.evidence || []).filter((e): e is string => e !== null),
      };
      if (!grouped[a.findingId]) {
        grouped[a.findingId] = [];
      }
      grouped[a.findingId].push(action);
    });
    return grouped;
  }, [rawActionItems]);

  const templates: AuditTemplate[] = useMemo(() => {
    return rawTemplates.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description || '',
      riskProfile: (t.riskProfile || 'ALL') as AuditTemplate['riskProfile'],
      steps: (t.steps || []) as AuditTemplate['steps'],
    }));
  }, [rawTemplates]);

  const isLoading = authLoading || auditsLoading || findingsLoading || actionsLoading || templatesLoading;

  // --- Handlers ---
  const handleAddFinding = async (newFinding: Finding) => {
    await createFinding({
      auditId: newFinding.auditId,
      title: newFinding.title,
      description: newFinding.description,
      riskRating: newFinding.riskRating,
      status: newFinding.status,
      type: newFinding.type,
      identifiedDate: newFinding.identifiedDate,
      dueDate: newFinding.dueDate,
      owner: newFinding.owner,
      rootCause: newFinding.rootCause,
      linkedControl: newFinding.linkedControl,
      impact: newFinding.impact,
      recommendation: newFinding.recommendation,
      managementResponse: newFinding.managementResponse,
      actionPlan: newFinding.actionPlan,
    });
  };

  const handleUpdateFinding = async (id: string, updates: Partial<Finding>) => {
    await updateFindingApi({ id, ...updates });
  };

  const handleUpdateActions = async (findingId: string, newActions: ActionItem[]) => {
    // For now, we'll create/update actions one by one
    // This could be optimized with batch operations
    for (const action of newActions) {
      if (action.id.startsWith('new-')) {
        // Create new action
        await createActionItem({
          findingId,
          description: action.description,
          owner: action.owner,
          dueDate: action.dueDate,
          status: action.status === 'Not Started' ? 'NOT_STARTED' :
                  action.status === 'In Progress' ? 'IN_PROGRESS' : 'COMPLETED',
          evidence: action.evidence,
        });
      } else {
        // Update existing action
        await updateActionItem({
          id: action.id,
          description: action.description,
          owner: action.owner,
          dueDate: action.dueDate,
          status: action.status === 'Not Started' ? 'NOT_STARTED' :
                  action.status === 'In Progress' ? 'IN_PROGRESS' : 'COMPLETED',
          evidence: action.evidence,
        });
      }
    }
  };

  // Wrapper for setAudits to work with the API
  const setAudits = async (updater: Audit[] | ((prev: Audit[]) => Audit[])) => {
    // This is a compatibility layer - components should migrate to use hooks directly
    console.warn('setAudits called - consider using createAudit/updateAudit/deleteAudit directly');
  };

  const setTemplates = async (updater: AuditTemplate[] | ((prev: AuditTemplate[]) => AuditTemplate[])) => {
    // This is a compatibility layer - components should migrate to use hooks directly
    console.warn('setTemplates called - consider using createTemplate/updateTemplate/deleteTemplate directly');
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-slate-600">Loading...</span>
        </div>
      );
    }

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
