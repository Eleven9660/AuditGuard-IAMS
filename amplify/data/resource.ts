import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // ========== AUDIT ==========
  Audit: a.model({
    code: a.string().required(),
    section: a.string().required(),
    category: a.string().required(),
    title: a.string().required(),
    quarter: a.string(),
    year: a.string().required(),
    status: a.enum(['PLANNED', 'FIELDWORK', 'REVIEW', 'COMPLETED', 'CONTINUOUS']),
    riskRating: a.enum(['HIGH', 'MEDIUM', 'LOW']),
    auditor: a.string(),
    processOwner: a.string(),
    standardsMap: a.string().array(),
    progress: a.integer().default(0),
    monthlyDistribution: a.json(),
    budgetedDays: a.integer(),
    templateId: a.string(),
    // Relationships
    findings: a.hasMany('Finding', 'auditId'),
    activityLogs: a.hasMany('ActivityLog', 'auditId'),
  }).authorization((allow) => [
    allow.groups(['Admins']).to(['create', 'read', 'update', 'delete']),
    allow.groups(['Auditors']).to(['create', 'read', 'update']),
    allow.groups(['Managers', 'Viewers']).to(['read']),
  ]),

  // ========== FINDING ==========
  Finding: a.model({
    auditId: a.id().required(),
    title: a.string().required(),
    description: a.string(),
    riskRating: a.enum(['HIGH', 'MEDIUM', 'LOW']),
    status: a.enum(['OPEN', 'PENDING_EVIDENCE', 'CLOSED', 'OVERDUE']),
    type: a.enum(['FINDING', 'IMPROVEMENT']),
    identifiedDate: a.date(),
    dueDate: a.date(),
    owner: a.string(),
    rootCause: a.string(),
    linkedControl: a.string(),
    impact: a.string(),
    recommendation: a.string(),
    managementResponse: a.string(),
    actionPlan: a.string(),
    // Relationships
    audit: a.belongsTo('Audit', 'auditId'),
    actionItems: a.hasMany('ActionItem', 'findingId'),
    followUpLogs: a.hasMany('FollowUpLog', 'findingId'),
  }).authorization((allow) => [
    allow.groups(['Admins']).to(['create', 'read', 'update', 'delete']),
    allow.groups(['Auditors']).to(['create', 'read', 'update']),
    allow.groups(['Managers']).to(['read', 'update']),
    allow.groups(['Viewers']).to(['read']),
  ]),

  // ========== ACTION ITEM ==========
  ActionItem: a.model({
    findingId: a.id().required(),
    description: a.string().required(),
    owner: a.string().required(),
    dueDate: a.date(),
    status: a.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
    evidence: a.string().array(),
    // Relationships
    finding: a.belongsTo('Finding', 'findingId'),
  }).authorization((allow) => [
    allow.groups(['Admins']).to(['create', 'read', 'update', 'delete']),
    allow.groups(['Auditors', 'Managers']).to(['create', 'read', 'update']),
    allow.groups(['Viewers']).to(['read']),
  ]),

  // ========== USER PROFILE ==========
  UserProfile: a.model({
    cognitoId: a.string().required(),
    name: a.string().required(),
    email: a.string().required(),
    role: a.enum(['ADMIN', 'AUDITOR', 'MANAGER', 'VIEWER']),
    status: a.enum(['ACTIVE', 'INACTIVE']),
    lastActive: a.datetime(),
    department: a.string(),
    jobTitle: a.string(),
    // Relationships
    notifications: a.hasMany('Notification', 'userId'),
  }).authorization((allow) => [
    allow.groups(['Admins']).to(['create', 'read', 'update', 'delete']),
    allow.authenticated().to(['read']),
    allow.owner().to(['read', 'update']),
  ]),

  // ========== AUDIT TEMPLATE ==========
  AuditTemplate: a.model({
    name: a.string().required(),
    description: a.string(),
    riskProfile: a.enum(['HIGH', 'MEDIUM', 'LOW', 'ALL']),
    steps: a.json(),
  }).authorization((allow) => [
    allow.groups(['Admins']).to(['create', 'read', 'update', 'delete']),
    allow.authenticated().to(['read']),
  ]),

  // ========== NOTIFICATION ==========
  Notification: a.model({
    userId: a.id().required(),
    title: a.string().required(),
    message: a.string(),
    date: a.datetime(),
    read: a.boolean().default(false),
    type: a.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR']),
    owner: a.string(),
    // Relationships
    user: a.belongsTo('UserProfile', 'userId'),
  }).authorization((allow) => [
    allow.owner().to(['create', 'read', 'update', 'delete']),
    allow.groups(['Admins']).to(['create', 'read', 'update', 'delete']),
  ]),

  // ========== FOLLOW UP LOG ==========
  FollowUpLog: a.model({
    findingId: a.id().required(),
    date: a.date(),
    note: a.string(),
    user: a.string(),
    type: a.enum(['EMAIL', 'MEETING', 'SYSTEM_UPDATE']),
    // Relationships
    finding: a.belongsTo('Finding', 'findingId'),
  }).authorization((allow) => [
    allow.groups(['Admins', 'Auditors', 'Managers']).to(['create', 'read', 'update', 'delete']),
    allow.groups(['Viewers']).to(['read']),
  ]),

  // ========== ACTIVITY LOG ==========
  ActivityLog: a.model({
    auditId: a.id().required(),
    date: a.date(),
    activity: a.string(),
    hours: a.float(),
    outcome: a.string(),
    user: a.string(),
    // Relationships
    audit: a.belongsTo('Audit', 'auditId'),
  }).authorization((allow) => [
    allow.groups(['Admins', 'Auditors']).to(['create', 'read', 'update', 'delete']),
    allow.groups(['Managers', 'Viewers']).to(['read']),
  ]),

  // ========== REPORT CONFIGURATION ==========
  ReportConfig: a.model({
    reportType: a.enum(['ENGAGEMENT', 'MONTHLY', 'BOARD']),
    sectionId: a.string().required(),
    label: a.string().required(),
    defaultValue: a.string(),
    sortOrder: a.integer(),
  }).authorization((allow) => [
    allow.groups(['Admins']).to(['create', 'read', 'update', 'delete']),
    allow.authenticated().to(['read']),
  ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInMinutes: 20,
    },
  },
});
