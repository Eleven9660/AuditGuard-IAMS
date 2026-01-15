import React from 'react';

export type RiskRating = 'HIGH' | 'MEDIUM' | 'LOW';
export type AuditStatus = 'PLANNED' | 'FIELDWORK' | 'REVIEW' | 'COMPLETED' | 'CONTINUOUS';
export type FindingStatus = 'OPEN' | 'PENDING_EVIDENCE' | 'CLOSED' | 'OVERDUE';
export type StandardRef = 'IPPF' | 'ISO19011' | 'COSO' | 'ISO31000' | 'ISO27001';
export type FindingType = 'FINDING' | 'IMPROVEMENT';

export interface AuditTemplateStep {
  id: string;
  title: string;
  objective: string;
  risk: string;
  procedures: string[];
}

export interface AuditTemplate {
  id: string;
  name: string;
  description: string;
  riskProfile: RiskRating | 'ALL';
  steps: AuditTemplateStep[];
}

export interface ReportSectionConfig {
  id: string;
  label: string;
  defaultValue: string;
  rows?: number;
}

export interface AuditActivityLog {
  id: string;
  date: string;
  activity: string;
  hours: number;
  outcome: string;
  user: string;
}

export interface Audit {
  id: string;
  code: string;
  section: string; // High level group: "Planning Stage", "Audit Fieldwork", "Risk based reviews"
  category: string; // "Audit" column from PDF
  title: string;    // "Focus Area" column from PDF
  quarter: string;
  year: string; 
  status: AuditStatus;
  riskRating: RiskRating;
  auditor: string;
  processOwner: string;
  standardsMap: StandardRef[];
  progress: number;
  monthlyDistribution: Record<string, number>; // e.g. { "Aug": 2, "Sep": 5 }
  budgetedDays: number; // "Total Days" from PDF
  templateId?: string; // ID of the AuditTemplate used to generate workpapers
  activityLog?: AuditActivityLog[]; // For Continuous Assurance updates
}

export interface FollowUpLog {
  id: string;
  date: string;
  note: string;
  user: string;
  type: 'Email' | 'Meeting' | 'System Update';
}

export interface Finding {
  id: string;
  auditId: string;
  title: string;
  description: string;
  riskRating: RiskRating;
  status: FindingStatus;
  type: FindingType;
  identifiedDate: string;
  dueDate: string;
  owner: string;
  rootCause: string;
  linkedControl: string;
  impact: string;          // Used for "Risk Statement"
  recommendation: string;
  managementResponse?: string; // New: Management Comment
  actionPlan?: string;         // New: Action Description
  followUpLog?: FollowUpLog[]; // New: Audit Follow-up functions
}

export interface ActionItem {
  id: string;
  description: string;
  owner: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  evidence: string[];
}

export interface AuditStep {
  id: string;
  phase: string;
  title: string;
  procedure: string;
  objective: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendColor?: 'green' | 'red' | 'neutral';
}

export interface NavItem {
  id: string;
  label: string;
  icon: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Auditor' | 'Manager' | 'Viewer';
  status: 'Active' | 'Inactive';
  lastActive: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}