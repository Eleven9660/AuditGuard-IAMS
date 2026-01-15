import { Audit, Finding, AuditStep, ActionItem, AuditTemplate, ReportSectionConfig, User, Notification } from './types';

// Helper to create constant distribution for Risk Reviews
const constantDist = (val: number) => ({
  'Aug': val, 'Sep': val, 'Oct': val, 'Nov': val, 'Dec': val, 'Jan': val, 
  'Feb': val, 'Mar': val, 'Apr': val, 'May': val, 'Jun': val, 'Jul': val
});

// --- REPORT CONFIGURATION STORE ---
export let REPORT_CONFIG: Record<string, ReportSectionConfig[]> = {
  ENGAGEMENT: [
    { id: 'exec_summary', label: 'Executive Summary Boilerplate', defaultValue: 'This internal audit report summarizes the findings from the audit conducted on [Audit Title]. The overall control environment was found to be [Rating].', rows: 3 },
    { id: 'purpose', label: 'Purpose of Audit', defaultValue: 'The purpose of this audit was to evaluate the effectiveness of internal controls and compliance with regulatory requirements, ensuring operational efficiency and asset protection.', rows: 3 },
    { id: 'methodology', label: 'Methodology', defaultValue: '» Document review and verification\n» Risk-based methodology focusing on the Three Lines of Defense\n» Management interviews\n» Site inspections\n» Physical verification', rows: 5 },
    { id: 'distribution', label: 'Report Distribution List', defaultValue: '1. Board Audit & Risk Committee\n2. Chief Operating Officer\n3. Finance & Admin Manager\n4. Chief Commercial Officer', rows: 4 },
    { id: 'scope_inc', label: 'Scope (Included)', defaultValue: '- Inventory Management\n- Preventive Maintenance\n- Health & Safety Protocols', rows: 3 },
    { id: 'scope_exc', label: 'Scope (Excluded)', defaultValue: '- Transport Logistics (outsourced)\n- Financial Accounts (covered in separate audit)', rows: 3 },
    { id: 'docs', label: 'Related Documents', defaultValue: '- SOP Manual v2.1\n- ISO 9001:2015 Certification\n- Annual Budget 2025', rows: 3 }
  ],
  MONTHLY: [
     { id: 'resource_util', label: '2. Resource Utilization', defaultValue: '• Planned audit hours: 320\n• Actual audit hours: 290\n• Variance explanation: 30 hours savings due to efficient fieldwork phase in Plant Operations.', rows: 4 },
     { id: 'key_findings', label: '3. Key Findings This Month', defaultValue: '• Commercial Ops: Unreconciled sales data requires immediate reconciliation API fix.\n• IT Security: Access control review identified 3 super-users with expired approvals.', rows: 4 },
     { id: 'upcoming', label: '4. Upcoming Activities', defaultValue: '• Logistics Audit scheduled to begin Oct 15\n• Q4 Risk Assessment workshop scheduled for Oct 20', rows: 4 },
     { id: 'action_snapshot', label: '5. Management Action Items Snapshot', defaultValue: '• Total open items: 12\n• Items past due: 2\n• New items this month: 4\n• Items closed this month: 3', rows: 5 },
     { id: 'dept_updates', label: '6. Department Updates', defaultValue: '• 2 staff members completed CISA certification.\n• New audit software (AuditGuard) fully deployed.', rows: 4 }
  ],
  BOARD: [
     { id: 'board_exec_summary', label: '1. Executive Summary', defaultValue: 'During the quarter, Internal Audit completed 3 engagements. We noted an improvement in the control environment regarding inventory management, however, significant gaps remain in IT Access Control. \n\nKey metrics indicate 85% plan completion YTD with 2 high-risk findings identified this period.', rows: 5 },
     { id: 'risk_themes', label: '4. Key Risk Themes', defaultValue: '• Cyber Security: Increased phishing attempts noted across the industry.\n• Supply Chain Resilience: Vendor due diligence gaps identified in new procurement process.', rows: 4 },
     { id: 'resources', label: '7. Internal Audit Resources and Capacity', defaultValue: '• Staffing level: 4/5 positions filled\n• Specialized skills assessment: Gap in IT forensics\n• Budget utilization: 75%\n• Co-sourcing/guest auditor utilization: Data analytics support engaged for Q4', rows: 5 },
     { id: 'regulatory', label: '8. Regulatory and Compliance Updates', defaultValue: '• New Data Protection Act requirements effective next quarter.\n• ESG reporting standards draft released.', rows: 4 },
     { id: 'emerging', label: '9. Emerging Risks and Considerations', defaultValue: '• AI Governance: Lack of policy for generative AI usage.\n• Geopolitical instability affecting logistics routes.', rows: 4 },
     { id: 'initiatives', label: '10. Internal Audit Strategic Initiatives', defaultValue: '• Automating control testing for Accounts Payable.\n• Implementing new Audit Management System (AuditGuard).', rows: 4 },
     { id: 'upcoming_focus', label: '11. Upcoming Focus Areas', defaultValue: '• Q4: IT Disaster Recovery Audit\n• Q4: Procurement Fraud Risk Assessment', rows: 4 },
     { id: 'committee_matters', label: '12. Matters Requiring Committee Attention/Approval', defaultValue: '• Approval of Revised Audit Charter.\n• Approval of Q4 Audit Plan amendments.', rows: 4 },
     { id: 'appendices', label: '13. Appendices', defaultValue: '• Detailed audit reports\n• External audit coordination\n• Quality assurance results', rows: 4 }
  ]
};

export const TEMPLATE_STORE: AuditTemplate[] = [
  {
    id: 'T-01',
    name: 'IT General Controls (ITGC)',
    description: 'Standard framework for auditing IT infrastructure, access control, and change management.',
    riskProfile: 'HIGH',
    steps: [
      {
        id: '1',
        title: 'Logical Access Management',
        objective: 'Ensure access is restricted to authorized users.',
        risk: 'Unauthorized access leading to data leakage.',
        procedures: [
          'Review new joiner access requests for approval.',
          'Verify termination process revokes access within 24 hours.',
          'Review periodic user access rights recertification.'
        ]
      },
      {
        id: '2',
        title: 'Change Management',
        objective: 'Verify changes to production are authorized and tested.',
        risk: 'System instability or unauthorized code changes.',
        procedures: [
          'Sample 10 changes and trace to CAB approval.',
          'Verify segregation of duties between dev and prod.'
        ]
      },
      {
        id: '3',
        title: 'Backup & Recovery',
        objective: 'Ensure data availability and recoverability.',
        risk: 'Data loss due to system failure.',
        procedures: [
            'Review backup logs for the last 30 days.',
            'Verify successful restoration test within the last year.'
        ]
      }
    ]
  },
  {
    id: 'T-02',
    name: 'Operational Efficiency Review',
    description: 'Generic program for assessing process efficiency in manufacturing or logistics.',
    riskProfile: 'MEDIUM',
    steps: [
      {
        id: '1',
        title: 'Process Design & Workflow',
        objective: 'Evaluate the efficiency of current workflows.',
        risk: 'Inefficient processes causing bottlenecks.',
        procedures: [
          'Map current state process flow.',
          'Identify non-value-added steps.',
          'Compare metrics against industry benchmarks.'
        ]
      },
      {
        id: '2',
        title: 'Resource Utilization',
        objective: 'Assess if resources are deployed effectively.',
        risk: 'Waste of labor or material resources.',
        procedures: [
            'Analyze shift utilization reports.',
            'Review overtime costs vs production output.'
        ]
      }
    ]
  }
];

export const generateAuditProgram = (audit: Audit): AuditStep[] => {
  return [
    {
      id: 'WP-01',
      phase: 'Planning',
      title: 'Walkthrough & Process Understanding',
      procedure: `Conduct interviews with ${audit.processOwner} to map the ${audit.title} process flow. Identify key control points.`,
      objective: 'Confirm process understanding and design of controls.'
    },
    {
      id: 'WP-02',
      phase: 'Fieldwork',
      title: 'Test of Design (ToD)',
      procedure: 'Review policies, procedures, and system configurations against IPPF/ISO standards.',
      objective: 'Evaluate if controls are designed effectively to mitigate risk.'
    },
    {
      id: 'WP-03',
      phase: 'Fieldwork',
      title: 'Test of Operating Effectiveness (ToE)',
      procedure: 'Select sample of 25 transactions and verify evidence of control execution.',
      objective: 'Ensure controls are operating as intended over the audit period.'
    },
    {
      id: 'WP-04',
      phase: 'Reporting',
      title: 'Substantive Analytical Procedures',
      procedure: 'Perform trend analysis on data sets to identify anomalies.',
      objective: 'Detect errors or irregularities in financial/operational data.'
    }
  ];
};

export const MOCK_AUDITS: Audit[] = [
  // Planning Stage
  {
    id: 'P-01',
    code: 'PLAN-01',
    section: 'Planning Stage',
    category: '1. Preplanning',
    title: 'Strategic Planning & Resource Allocation',
    quarter: 'All',
    year: '2025/26',
    status: 'COMPLETED',
    riskRating: 'LOW',
    auditor: 'IA',
    processOwner: 'Head of Audit',
    standardsMap: ['IPPF'],
    progress: 100,
    monthlyDistribution: constantDist(2),
    budgetedDays: 24
  },
  {
    id: 'P-02',
    code: 'PLAN-02',
    section: 'Planning Stage',
    category: '2. Risk mapping',
    title: 'Audit Universe Risk Assessment',
    quarter: 'All',
    year: '2025/26',
    status: 'COMPLETED',
    riskRating: 'LOW',
    auditor: 'IA',
    processOwner: 'Head of Audit',
    standardsMap: ['IPPF', 'ISO31000'],
    progress: 100,
    monthlyDistribution: constantDist(1),
    budgetedDays: 12
  },

  // Audit Fieldwork
  {
    id: 'A-01',
    code: 'OPS-SOS-01',
    section: 'Audit Fieldwork',
    category: 'A. Sosiani Plant 1 and 2',
    title: '1. Sosiani - Production Operations, Engineering & Technical',
    quarter: 'Q3',
    year: '2025/26',
    status: 'FIELDWORK',
    riskRating: 'HIGH',
    auditor: 'Internal Audit',
    processOwner: 'Plant Manager',
    standardsMap: ['ISO19011', 'COSO'],
    progress: 45,
    monthlyDistribution: { 'Mar': 5 },
    budgetedDays: 15,
    templateId: 'T-02'
  },
  {
    id: 'B-01',
    code: 'OPS-COM-01',
    section: 'Audit Fieldwork',
    category: 'B. Commercial Operations',
    title: '2. Sales & Marketing',
    quarter: 'Q1, Q4',
    year: '2025/26',
    status: 'FIELDWORK',
    riskRating: 'HIGH',
    auditor: 'Internal Audit',
    processOwner: 'Head of Sales',
    standardsMap: ['COSO'],
    progress: 15,
    monthlyDistribution: { 'Sep': 5, 'May': 3, 'Jun': 5 },
    budgetedDays: 13
  },
  {
    id: 'C-01',
    code: 'OPS-KAG-01',
    section: 'Audit Fieldwork',
    category: 'C. Kagwe Plant',
    title: '3. Kagwe - Production Operations, Engineering & Technical',
    quarter: 'Q2, Q4',
    year: '2025/26',
    status: 'PLANNED',
    riskRating: 'HIGH',
    auditor: 'Internal Audit',
    processOwner: 'Plant Manager',
    standardsMap: ['ISO19011'],
    progress: 0,
    monthlyDistribution: { 'Nov': 10, 'Jun': 5 },
    budgetedDays: 15
  },
  {
    id: 'D-01',
    code: 'FIN-CORP-01',
    section: 'Audit Fieldwork',
    category: 'D. Corporate Functions',
    title: '4. Finance & Treasury - Finance, Accounts department',
    quarter: 'Q2, Q4',
    year: '2025/26',
    status: 'PLANNED',
    riskRating: 'HIGH',
    auditor: 'Internal Audit',
    processOwner: 'CFO',
    standardsMap: ['IPPF', 'COSO'],
    progress: 0,
    monthlyDistribution: { 'Dec': 5, 'Jul': 3 },
    budgetedDays: 8
  },
  {
    id: 'D-02',
    code: 'HR-MGMT-01',
    section: 'Audit Fieldwork',
    category: 'D. Corporate Functions',
    title: '5. Human Resource Management',
    quarter: 'Q1, Q3',
    year: '2025/26',
    status: 'PLANNED',
    riskRating: 'MEDIUM',
    auditor: 'Internal Audit',
    processOwner: 'Head of HR',
    standardsMap: ['IPPF'],
    progress: 0,
    monthlyDistribution: { 'Oct': 10, 'Mar': 5 },
    budgetedDays: 15
  },
  {
    id: 'E-01',
    code: 'SCM-PROC-01',
    section: 'Audit Fieldwork',
    category: 'E. Support Functions',
    title: '6. Supply Chain & Procurement',
    quarter: 'Q2, Q4',
    year: '2025/26',
    status: 'PLANNED',
    riskRating: 'HIGH',
    auditor: 'Internal Audit',
    processOwner: 'Head of SCM',
    standardsMap: ['COSO'],
    progress: 0,
    monthlyDistribution: { 'Dec': 5, 'Jan': 5, 'Jul': 3 },
    budgetedDays: 13
  },
  {
    id: 'E-02',
    code: 'HSE-01',
    section: 'Audit Fieldwork',
    category: 'E. Support Functions',
    title: '7. Health, Safety & Environment',
    quarter: '-',
    year: '2025/26',
    status: 'PLANNED',
    riskRating: 'MEDIUM',
    auditor: 'Internal Audit',
    processOwner: 'HSE Mgr',
    standardsMap: ['ISO31000'],
    progress: 0,
    monthlyDistribution: {},
    budgetedDays: 0
  },
  {
    id: 'F-01',
    code: 'DIST-FLEET-01',
    section: 'Audit Fieldwork',
    category: 'F. Distribution Operations',
    title: '8. Fleet Management',
    quarter: 'Q1, Q4',
    year: '2025/26',
    status: 'PLANNED',
    riskRating: 'MEDIUM',
    auditor: 'Internal Audit',
    processOwner: 'Logistics Mgr',
    standardsMap: ['ISO31000'],
    progress: 0,
    monthlyDistribution: { 'Sep': 3, 'May': 2 },
    budgetedDays: 5
  },
  {
    id: 'F-02',
    code: 'DIST-STOR-01',
    section: 'Audit Fieldwork',
    category: 'F. Distribution Operations',
    title: '9. Storage & Distribution',
    quarter: 'Q1, Q4',
    year: '2025/26',
    status: 'PLANNED',
    riskRating: 'MEDIUM',
    auditor: 'Internal Audit',
    processOwner: 'Logistics Mgr',
    standardsMap: ['ISO31000'],
    progress: 0,
    monthlyDistribution: { 'Sep': 3, 'May': 5 },
    budgetedDays: 8
  },
  {
    id: 'F-03',
    code: 'DIST-DEPOT-01',
    section: 'Audit Fieldwork',
    category: 'F. Distribution Operations',
    title: '10. Depot Operations',
    quarter: 'Q3',
    year: '2025/26',
    status: 'PLANNED',
    riskRating: 'MEDIUM',
    auditor: 'Internal Audit',
    processOwner: 'Depot Mgr',
    standardsMap: ['ISO31000'],
    progress: 0,
    monthlyDistribution: { 'Mar': 5 }, // PDF has 5 in Mar column on Pg 2
    budgetedDays: 5
  },
  {
    id: 'G-01',
    code: 'QA-01',
    section: 'Audit Fieldwork',
    category: 'G. Quality & Technical',
    title: '12. Quality Assurance (Kagwe & Sosiani)',
    quarter: 'Q3',
    year: '2025/26',
    status: 'PLANNED',
    riskRating: 'MEDIUM',
    auditor: 'IA',
    processOwner: 'QA Mgr',
    standardsMap: ['ISO19011'],
    progress: 0,
    monthlyDistribution: { 'Apr': 5 }, // PDF Pg 2 shows 5 in April
    budgetedDays: 5
  },
  {
    id: 'G-02',
    code: 'TECH-SUP-01',
    section: 'Audit Fieldwork',
    category: 'G. Quality & Technical',
    title: '12. Technical Support (Kagwe & Sosiani)',
    quarter: 'Q3',
    year: '2025/26',
    status: 'PLANNED',
    riskRating: 'MEDIUM',
    auditor: 'IA',
    processOwner: 'Tech Mgr',
    standardsMap: ['ISO19011'],
    progress: 0,
    monthlyDistribution: { 'Apr': 5 }, // PDF Pg 2 shows 5 in April
    budgetedDays: 5
  },
  {
    id: 'G-03',
    code: 'IT-SEC-01',
    section: 'Audit Fieldwork',
    category: 'G. Quality & Technical',
    title: '13. IT Department',
    quarter: 'Q2, Q4',
    year: '2025/26',
    status: 'FIELDWORK',
    riskRating: 'HIGH',
    auditor: 'Internal Audit',
    processOwner: 'CIO',
    standardsMap: ['ISO27001', 'COSO'],
    progress: 25,
    monthlyDistribution: { 'Jan': 5, 'Jun': 3 },
    budgetedDays: 8,
    templateId: 'T-01'
  },
  {
    id: 'H-01',
    code: 'ENG-DEPT-01',
    section: 'Audit Fieldwork',
    category: 'H. Engineering & Technical',
    title: '14. Engineering Department',
    quarter: 'Q2',
    year: '2025/26',
    status: 'PLANNED',
    riskRating: 'MEDIUM',
    auditor: 'IA',
    processOwner: 'Chief Engineer',
    standardsMap: ['ISO19011'],
    progress: 0,
    monthlyDistribution: { 'Feb': 5 },
    budgetedDays: 5
  },

  // Risk Based Reviews
  {
    id: 'RB-01',
    code: 'RB-PROC-01',
    section: 'Risk Based Reviews',
    category: 'A. Cross-Functional Reviews',
    title: '1. End-to-End Process Reviews (O2C, P2P, etc)',
    quarter: 'All',
    year: '2025/26',
    status: 'CONTINUOUS',
    riskRating: 'MEDIUM',
    auditor: 'Internal Audit',
    processOwner: 'Various',
    standardsMap: ['COSO'],
    progress: 20,
    monthlyDistribution: constantDist(2),
    budgetedDays: 24,
    activityLog: [
      { id: 'LOG-01', date: '2025-08-15', activity: 'Reviewed Q1 P2P metrics', hours: 4, outcome: 'No anomalies', user: 'Jane Doe' }
    ]
  },
  {
    id: 'RB-02',
    code: 'RB-PROJ-01',
    section: 'Risk Based Reviews',
    category: 'A. Cross-Functional Reviews',
    title: '2. Project Audits (Capital, Tech, Safety)',
    quarter: 'All',
    year: '2025/26',
    status: 'CONTINUOUS',
    riskRating: 'HIGH',
    auditor: 'Internal Audit',
    processOwner: 'PMO',
    standardsMap: ['COSO'],
    progress: 10,
    monthlyDistribution: constantDist(2),
    budgetedDays: 24
  },
  {
    id: 'RB-03',
    code: 'RB-REG-01',
    section: 'Risk Based Reviews',
    category: 'B. Compliance Reviews',
    title: '1. Regulatory Compliance',
    quarter: 'All',
    year: '2025/26',
    status: 'CONTINUOUS',
    riskRating: 'HIGH',
    auditor: 'Internal Audit',
    processOwner: 'Compliance Officer',
    standardsMap: ['IPPF'],
    progress: 25,
    monthlyDistribution: constantDist(1),
    budgetedDays: 12
  },
  {
    id: 'RB-04',
    code: 'RB-INT-01',
    section: 'Risk Based Reviews',
    category: 'B. Compliance Reviews',
    title: '2. Internal Compliance',
    quarter: 'All',
    year: '2025/26',
    status: 'CONTINUOUS',
    riskRating: 'MEDIUM',
    auditor: 'Internal Audit',
    processOwner: 'Compliance Officer',
    standardsMap: ['IPPF'],
    progress: 25,
    monthlyDistribution: constantDist(1),
    budgetedDays: 12
  },
  {
    id: 'RB-05',
    code: 'RB-RISK-01',
    section: 'Risk Based Reviews',
    category: 'C. Risk Management',
    title: 'Risk Management Framework Review',
    quarter: 'All',
    year: '2025/26',
    status: 'CONTINUOUS',
    riskRating: 'HIGH',
    auditor: 'Internal Audit',
    processOwner: 'CRO',
    standardsMap: ['ISO31000'],
    progress: 15,
    monthlyDistribution: { 'Aug':1, 'Sep':1, 'Oct':2, 'Nov':1, 'Dec':1, 'Jan':2, 'Feb':1, 'Mar':1, 'Apr':2, 'May':1, 'Jun':1, 'Jul':2 }, // Matching pattern 1-1-2...
    budgetedDays: 16
  },
  {
    id: 'RB-06',
    code: 'RB-ADHOC-01',
    section: 'Risk Based Reviews',
    category: 'D. Contingency',
    title: 'Contingency, Adhoc and other assignments',
    quarter: 'All',
    year: '2025/26',
    status: 'CONTINUOUS',
    riskRating: 'MEDIUM',
    auditor: 'Internal Audit',
    processOwner: 'Audit Committee',
    standardsMap: ['IPPF'],
    progress: 5,
    monthlyDistribution: constantDist(5),
    budgetedDays: 60
  }
];

export const MOCK_FINDINGS: Finding[] = [
  {
    id: 'F-2025-01',
    auditId: 'B-01',
    title: 'Unreconciled Sales in Commercial Ops',
    description: 'Discrepancy between dispatched goods and invoiced amounts in Sep sample.',
    riskRating: 'HIGH',
    type: 'FINDING',
    status: 'OPEN',
    identifiedDate: '2025-09-15',
    dueDate: '2025-10-30',
    owner: 'Head of Sales',
    rootCause: 'ERP Interface Latency',
    linkedControl: 'REV-04',
    impact: 'Potential revenue leakage and misstated financial reports.',
    recommendation: 'Implement real-time API sync between dispatch and billing modules.',
    managementResponse: 'Management accepts the risk and will implement the API sync by Q4.',
    actionPlan: 'IT team to develop and test API connector.',
    followUpLog: [
      { id: 'FU-01', date: '2025-10-01', user: 'Jane Doe', note: 'Sent reminder email to Head of Sales.', type: 'Email' }
    ]
  },
  {
    id: 'F-2025-02',
    auditId: 'RB-03',
    title: 'Regulatory Filing Delay',
    description: 'Monthly statutory return filed 2 days late.',
    riskRating: 'MEDIUM',
    type: 'FINDING',
    status: 'CLOSED',
    identifiedDate: '2025-08-20',
    dueDate: '2025-08-25',
    owner: 'Compliance Officer',
    rootCause: 'System downtime',
    linkedControl: 'REG-01',
    impact: 'Regulatory fines and reputational risk.',
    recommendation: 'Enable auto-filing features or redundancy systems.'
  },
  {
    id: 'F-2025-03',
    auditId: 'B-01',
    title: 'Automate Invoice Approval Workflow',
    description: 'Currently using email approvals. Implementing the ERP workflow module would reduce cycle time by 2 days.',
    riskRating: 'LOW',
    type: 'IMPROVEMENT',
    status: 'OPEN',
    identifiedDate: '2025-09-18',
    dueDate: '2025-12-31',
    owner: 'IT Manager',
    rootCause: 'Manual Process',
    linkedControl: 'REV-06',
    impact: 'Operational inefficiency and lack of audit trail.',
    recommendation: 'Deploy the ERP approval workflow module.'
  }
];

export const MOCK_ACTIONS: Record<string, ActionItem[]> = {
  'F-2025-01': [
    {
      id: 'ACT-01',
      description: 'Update ERP role definitions to segregate duties between Sales and Dispatch modules.',
      owner: 'IT Director',
      dueDate: '2025-10-15',
      status: 'In Progress',
      evidence: []
    },
    {
      id: 'ACT-02',
      description: 'Conduct training for commercial team on new dispatch protocols.',
      owner: 'Head of Sales',
      dueDate: '2025-10-20',
      status: 'Not Started',
      evidence: []
    }
  ],
  'F-2025-02': [
     {
      id: 'ACT-03',
      description: 'Configure automated calendar alerts for all statutory deadlines.',
      owner: 'Compliance Officer',
      dueDate: '2025-09-01',
      status: 'Completed',
      evidence: ['System_Alert_Config.pdf']
    }
  ],
  'F-2025-03': [
     {
      id: 'ACT-04',
      description: 'Draft ERP Change Request for workflow module implementation.',
      owner: 'IT Manager',
      dueDate: '2025-11-15',
      status: 'In Progress',
      evidence: []
    }
  ]
};

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Jane Doe', email: 'jane.doe@auditguard.com', role: 'Admin', status: 'Active', lastActive: 'Just now' },
  { id: 'u2', name: 'John Smith', email: 'john.smith@auditguard.com', role: 'Auditor', status: 'Active', lastActive: '2 hours ago' },
  { id: 'u3', name: 'Emily Chen', email: 'emily.chen@auditguard.com', role: 'Manager', status: 'Active', lastActive: '1 day ago' },
  { id: 'u4', name: 'Michael Brown', email: 'm.brown@auditguard.com', role: 'Viewer', status: 'Inactive', lastActive: '30 days ago' }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Action Item Overdue', message: 'Action ACT-01 for Finding F-2025-01 is past due.', date: '2 hours ago', read: false, type: 'error' },
  { id: 'n2', title: 'Audit Plan Approved', message: 'The Q3 Audit Plan has been approved by the Committee.', date: '1 day ago', read: false, type: 'success' },
  { id: 'n3', title: 'New Comment', message: 'Head of Sales commented on finding F-2025-01.', date: '2 days ago', read: true, type: 'info' }
];