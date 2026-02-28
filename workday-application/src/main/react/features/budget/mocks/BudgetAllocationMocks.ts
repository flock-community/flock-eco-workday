/**
 * Mock Data for Budget Allocation Feature
 * Phase 1.1: UX Prototype with Mocked Data
 */

import {
  BudgetAllocationType,
  type BudgetAllocation,
  type BudgetAllocationDetails,
  type BudgetSummary,
  type ContractInternal,
  type Event,
  type HackTimeBudgetAllocation,
  type StudyMoneyBudgetAllocation,
  type StudyTimeBudgetAllocation,
} from './BudgetAllocationTypes';

// Re-export all types for backwards compatibility
export type {
  BudgetAllocation,
  BudgetAllocationDetails,
  BudgetItem,
  BudgetSummary,
  ContractInternal,
  DailyTimeAllocation,
  Document,
  Event,
  HackTimeBudgetAllocation,
  StudyMoneyBudgetAllocation,
  StudyTimeBudgetAllocation,
  BudgetAllocationBase,
} from './BudgetAllocationTypes';
export { BudgetAllocationType } from './BudgetAllocationTypes';

// ==================== MOCK DATA GENERATORS ====================

const mockPersonIds = [
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
];

const mockPersonNames = ['Alice Johnson', 'Bob Smith', 'Charlie Davis'];

// ==================== MOCK BUDGET SUMMARY ====================

export const mockBudgetSummary: BudgetSummary = {
  hackHours: {budget: 120, used: 45, available: 75},
  studyHours: {budget: 40, used: 16, available: 24},
  studyMoney: {budget: 5000, used: 1200, available: 3800},
};

export const mockBudgetSummaryOverBudget: BudgetSummary = {
  hackHours: {budget: 120, used: 135, available: -15},
  studyHours: {budget: 40, used: 48, available: -8},
  studyMoney: {budget: 5000, used: 5500, available: -500},
};

export const mockBudgetSummaryEmpty: BudgetSummary = {
  hackHours: {budget: 120, used: 0, available: 120},
  studyHours: {budget: 40, used: 0, available: 40},
  studyMoney: {budget: 5000, used: 0, available: 5000},
};

// ==================== MOCK ALLOCATIONS ====================

export const mockStudyTimeBudgetAllocation: StudyTimeBudgetAllocation = {
  id: 1,
  type: 'StudyTime',
  eventCode: 'REACT_CONF_2026',
  eventName: 'React Conference 2026',
  dateFrom: '2026-01-15',
  dateTo: '2026-01-20',
  description: 'Attended React Conference',

  personId: mockPersonIds[0],
  personName: mockPersonNames[0],
  dailyTimeAllocations: [
    {date: '2026-01-15', hours: 8, type: BudgetAllocationType.STUDY},
    {date: '2026-01-16', hours: 8, type: BudgetAllocationType.STUDY},
    {date: '2026-01-17', hours: 8, type: BudgetAllocationType.STUDY},
    {date: '2026-01-20', hours: 8, type: BudgetAllocationType.STUDY},
  ],
  totalHours: 32,
};

export const mockStudyMoneyBudgetAllocation: StudyMoneyBudgetAllocation = {
  id: 2,
  type: 'StudyMoney',
  eventCode: 'REACT_CONF_2026',
  eventName: 'React Conference 2026',
  dateFrom: '2026-01-15',
  dateTo: '2026-01-20',
  description: 'Conference ticket and travel',

  personId: mockPersonIds[0],
  personName: mockPersonNames[0],
  amount: 800,
  files: [
    {
      id: 'doc1',
      name: 'conference_ticket.pdf',
      url: '/api/documents/doc1',
    },
    {
      id: 'doc2',
      name: 'hotel_receipt.pdf',
      url: '/api/documents/doc2',
    },
  ],
};

export const mockStudyMoneyBudgetAllocationFreeForm: StudyMoneyBudgetAllocation =
  {
    id: 3,
    type: 'StudyMoney',
    eventCode: null,
    eventName: null,
    dateFrom: '2026-01-20',
    dateTo: '2026-01-20',
    description: 'Online course: Advanced TypeScript Patterns',

    personId: mockPersonIds[0],
    personName: mockPersonNames[0],
    amount: 199,
    files: [
      {
        id: 'doc3',
        name: 'course_receipt.pdf',
        url: '/api/documents/doc3',
      },
    ],
  };

export const mockHackTimeBudgetAllocation: HackTimeBudgetAllocation[] = [

  {
    id: 4,
    type: 'HackTime',
    eventCode: 'FLOCK_HACK_DAY_JAN',
    eventName: 'Flock Hack Day - January',
    dateFrom: '2026-01-10',
    dateTo: '2026-01-11',
    description: 'Internal hackathon',

    personId: mockPersonIds[0],
    personName: mockPersonNames[0],
    dailyTimeAllocations: [{date: '2026-01-10', hours: 8, type: BudgetAllocationType.HACK}],
    totalHours: 8,
  },
  {
    id: 10010234,
    type: 'HackTime',
    eventCode: 'REACT_CONF_20262',
    eventName: 'React Conference 2026 abc',
    dateFrom: '2026-01-15',
    dateTo: '2026-01-20',
    description: 'Attended React Conference',

    personId: mockPersonIds[0],
    personName: mockPersonNames[0],
    dailyTimeAllocations: [
      {date: '2026-01-18', hours: 8, type: BudgetAllocationType.HACK},
      {date: '2026-01-19', hours: 8, type: BudgetAllocationType.HACK},
    ],
    totalHours: 16,
  }];

// ==================== MOCK ALLOCATION COLLECTIONS ====================

export const mockAllocationsForPerson: BudgetAllocation[] = [
  mockStudyTimeBudgetAllocation,
  mockStudyMoneyBudgetAllocation,
  mockStudyMoneyBudgetAllocationFreeForm,
  ...mockHackTimeBudgetAllocation,
  {
    id: 6,
    type: 'HackTime',
    eventCode: 'FLOCK_HACK_DAY_FEB',
    eventName: 'Flock Hack Day - February',
    dateFrom: '2026-02-14',
    dateTo: '2026-02-14',
    description: 'Monthly hackathon',

    personId: mockPersonIds[0],
    personName: mockPersonNames[0],
    dailyTimeAllocations: [{date: '2026-02-14', hours: 8, type: BudgetAllocationType.HACK}],
    totalHours: 8,
  },
  {
    id: 7,
    type: 'StudyTime',
    eventCode: 'KOTLIN_WORKSHOP',
    eventName: 'Kotlin Workshop',
    dateFrom: '2026-02-20',
    dateTo: '2026-02-20',
    description: 'Kotlin workshop attendance',

    personId: mockPersonIds[0],
    personName: mockPersonNames[0],
    dailyTimeAllocations: [{date: '2026-02-20', hours: 4, type: BudgetAllocationType.STUDY}],
    totalHours: 4,
  },
  {
    id: 8,
    type: 'StudyMoney',
    eventCode: null,
    eventName: null,
    dateFrom: '2026-03-01',
    dateTo: '2026-03-01',
    description: 'Book purchase: Clean Architecture',

    personId: mockPersonIds[0],
    personName: mockPersonNames[0],
    amount: 45,
    files: [],
  },
];

// ==================== MOCK CONTRACT DATA ====================

export const mockContractInternal: ContractInternal = {
  id: 'contract-1',
  personId: mockPersonIds[0],
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  hackHours: 120,
  studyHours: 40,
  studyMoney: 5000,
};

export const mockContracts: ContractInternal[] = [
  mockContractInternal,
  {
    id: 'contract-2',
    personId: mockPersonIds[1],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    hackHours: 96,
    studyHours: 32,
    studyMoney: 3000,
  },
  {
    id: 'contract-3',
    personId: mockPersonIds[2],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    hackHours: 144,
    studyHours: 48,
    studyMoney: 7500,
  },
];

// ==================== MOCK EVENT DATA ====================

export const mockEventWithBudgetAllocations: Event = {
  code: 'REACT_CONF_2026',
  name: 'React Conference 2026',
  description: 'Annual React conference in Amsterdam',
  from: '2026-01-15',
  to: '2026-01-16',
  defaultTimeAllocationType: BudgetAllocationType.STUDY,
  totalBudget: 3000,
  budgetAllocations: [
    mockStudyTimeBudgetAllocation,
    mockStudyMoneyBudgetAllocation,
    {
      id: 9,
      type: 'StudyTime',
      eventCode: 'REACT_CONF_2026',
      eventName: 'React Conference 2026',
      dateFrom: '2026-01-15',
      dateTo: '2026-01-20',
      description: 'Conference attendance',

      personId: mockPersonIds[1],
      personName: mockPersonNames[1],
      dailyTimeAllocations: [
        {date: '2026-01-15', hours: 8, type: BudgetAllocationType.STUDY},
        {date: '2026-01-16', hours: 8, type: BudgetAllocationType.STUDY},
      ],
      totalHours: 16,
    },
    {
      id: 91,
      type: 'HackTime',
      eventCode: 'REACT_CONF_2026',
      eventName: 'React Conference 2026',
      dateFrom: '2026-01-15',
      dateTo: '2026-01-20',
      description: 'Conference attendance',

      personId: mockPersonIds[1],
      personName: mockPersonNames[1],
      dailyTimeAllocations: [
        {date: '2026-01-17', hours: 8, type: BudgetAllocationType.HACK},
        {date: '2026-01-18', hours: 8, type: BudgetAllocationType.HACK},
      ],
      totalHours: 16,
    },
    {
      id: 10,
      type: 'StudyMoney',
      eventCode: 'REACT_CONF_2026',
      eventName: 'React Conference 2026',
      dateFrom: '2026-01-15',
      dateTo: '2026-01-20',
      description: 'Conference expenses',

      personId: mockPersonIds[1],
      personName: mockPersonNames[1],
      amount: 22,
      files: [],
    },
  ],
};

export const mockEvents: Event[] = [
  mockEventWithBudgetAllocations,
  {
    code: 'FLOCK_HACK_DAY_JAN',
    name: 'Flock Hack Day - January',
    description: 'Monthly internal hackathon',
    from: '2026-01-10',
    to: '2026-01-10',
    defaultTimeAllocationType: BudgetAllocationType.HACK,
    budgetAllocations: [
      ...mockHackTimeBudgetAllocation,
      {
        id: 11,
        type: 'HackTime',
        eventCode: 'FLOCK_HACK_DAY_JAN',
        eventName: 'Flock Hack Day - January',
        dateFrom: '2026-01-10',
        dateTo: '2026-01-10',
        description: 'Hack day participation',

        personId: mockPersonIds[1],
        personName: mockPersonNames[1],
        dailyTimeAllocations: [{date: '2026-01-10', hours: 8, type: BudgetAllocationType.HACK}],
        totalHours: 8,
      },
      {
        id: 12,
        type: 'HackTime',
        eventCode: 'FLOCK_HACK_DAY_JAN',
        eventName: 'Flock Hack Day - January',
        dateFrom: '2026-01-10',
        dateTo: '2026-01-10',
        description: 'Hack day participation',

        personId: mockPersonIds[2],
        personName: mockPersonNames[2],
        dailyTimeAllocations: [{date: '2026-01-10', hours: 8, type: BudgetAllocationType.HACK}],
        totalHours: 8,
      },
    ],
  },
  {
    code: 'KOTLIN_WORKSHOP',
    name: 'Kotlin Workshop',
    description: 'Half-day Kotlin workshop',
    from: '2026-02-20',
    to: '2026-02-20',
    defaultTimeAllocationType: BudgetAllocationType.STUDY,
    budgetAllocations: [],
  },
];

// ==================== MOCK BUDGET ALLOCATION DETAILS ====================

export const mockBudgetAllocationDetails: BudgetAllocationDetails = {
  personId: mockPersonIds[0],
  personName: mockPersonNames[0],
  year: 2026,
  summary: mockBudgetSummary,
  allocations: mockAllocationsForPerson,
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate mock budget summary with random values
 */
export function generateMockBudgetSummary(
  hackBudget = 120,
  studyHoursBudget = 40,
  studyMoneyBudget = 5000
): BudgetSummary {
  const hackUsed = Math.floor(Math.random() * hackBudget * 0.8);
  const studyHoursUsed = Math.floor(Math.random() * studyHoursBudget * 0.8);
  const studyMoneyUsed = Math.floor(Math.random() * studyMoneyBudget * 0.8);

  return {
    hackHours: {
      budget: hackBudget,
      used: hackUsed,
      available: hackBudget - hackUsed,
    },
    studyHours: {
      budget: studyHoursBudget,
      used: studyHoursUsed,
      available: studyHoursBudget - studyHoursUsed,
    },
    studyMoney: {
      budget: studyMoneyBudget,
      used: studyMoneyUsed,
      available: studyMoneyBudget - studyMoneyUsed,
    },
  };
}

/**
 * Generate mock budget details for multiple persons
 */
export function generateMockBudgetDetailsForAllPersons(): BudgetAllocationDetails[] {
  return mockPersonIds.map((personId, index) => ({
    personId,
    personName: mockPersonNames[index],
    year: 2026,
    summary: generateMockBudgetSummary(
      mockContracts[index].hackHours,
      mockContracts[index].studyHours,
      mockContracts[index].studyMoney
    ),
    allocations: mockAllocationsForPerson.filter((allocation) => allocation.personId === personId)
  }));
}

/**
 * Calculate budget summary from allocations
 */
export function calculateBudgetSummaryFromAllocations(
  allocations: BudgetAllocation[],
  contract: ContractInternal
): BudgetSummary {
  let hackHoursUsed = 0;
  let studyHoursUsed = 0;
  let studyMoneyUsed = 0;

  allocations.forEach((allocation) => {
    switch (allocation.type) {
      case 'HackTime':
        hackHoursUsed += allocation.totalHours;
        break;
      case 'StudyTime':
        studyHoursUsed += allocation.totalHours;
        break;
      case 'StudyMoney':
        studyMoneyUsed += allocation.amount;
        break;
    }
  });

  return {
    hackHours: {
      budget: contract.hackHours,
      used: hackHoursUsed,
      available: contract.hackHours - hackHoursUsed,
    },
    studyHours: {
      budget: contract.studyHours,
      used: studyHoursUsed,
      available: contract.studyHours - studyHoursUsed,
    },
    studyMoney: {
      budget: contract.studyMoney,
      used: studyMoneyUsed,
      available: contract.studyMoney - studyMoneyUsed,
    },
  };
}

/**
 * Mock API delay simulation
 */
export async function mockApiDelay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get mock data for a specific person
 */
export function getMockBudgetDetailsForPerson(
  personId: string
): BudgetAllocationDetails {
  const personIndex = mockPersonIds.indexOf(personId);
  if (personIndex === -1) {
    return mockBudgetAllocationDetails;
  }

  return {
    personId: mockPersonIds[personIndex],
    personName: mockPersonNames[personIndex],
    year: 2026,
    summary: generateMockBudgetSummary(
      mockContracts[personIndex].hackHours,
      mockContracts[personIndex].studyHours,
      mockContracts[personIndex].studyMoney
    ),
    allocations: mockAllocationsForPerson.filter(
      (a) => a.personId === personId
    ),
  };
}