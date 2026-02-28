/**
 * Type definitions for Budget Allocation Feature
 * These types will be replaced by wirespec-generated types in Phase 3.
 */

// ==================== ENUMS ====================

export enum BudgetAllocationType {
  STUDY = 'STUDY',
  HACK = 'HACK',
}

// ==================== VALUE OBJECTS ====================

export interface DailyTimeAllocation {
  date: string; // ISO date string
  hours: number;
  type: BudgetAllocationType; // Per-day type override (STUDY or HACK)
}

// ==================== BASE TYPES ====================

export interface BudgetAllocationBase {
  id: number;
  eventCode?: string | null;
  eventName?: string | null;
  dateFrom: string; // ISO date string
  dateTo: string; // ISO date string
  description?: string | null;
}

export interface StudyTimeBudgetAllocation extends BudgetAllocationBase {
  type: 'StudyTime';
  personId: string;
  personName: string;
  dailyTimeAllocations: DailyTimeAllocation[];
  totalHours: number;
}

export interface StudyMoneyBudgetAllocation extends BudgetAllocationBase {
  type: 'StudyMoney';
  personId: string;
  personName: string;
  amount: number;
  files: Document[];
}

export interface HackTimeBudgetAllocation extends BudgetAllocationBase {
  type: 'HackTime';
  personId: string;
  personName: string;
  dailyTimeAllocations: DailyTimeAllocation[];
  totalHours: number;
}

export type BudgetAllocation =
  | StudyTimeBudgetAllocation
  | StudyMoneyBudgetAllocation
  | HackTimeBudgetAllocation;

export interface Document {
  id: string;
  name: string;
  url: string;
}

// ==================== SUMMARY TYPES ====================

export interface BudgetItem {
  budget: number;
  used: number;
  available: number;
}

export interface BudgetSummary {
  hackHours: BudgetItem;
  studyHours: BudgetItem;
  studyMoney: BudgetItem;
}

export interface BudgetAllocationDetails {
  personId: string;
  personName: string;
  year: number;
  summary: BudgetSummary;
  allocations: BudgetAllocation[];
}

// ==================== CONTRACT TYPES ====================

export interface ContractInternal {
  id: string;
  personId: string;
  startDate: string;
  endDate?: string | null;
  hackHours: number;
  studyHours: number;
  studyMoney: number;
}

// ==================== EVENT TYPES ====================

export interface Event {
  code: string;
  name: string;
  description?: string;
  from: string;
  to: string;
  defaultTimeAllocationType?: BudgetAllocationType | null;
  totalBudget?: number;
  budgetAllocations: BudgetAllocation[];
}