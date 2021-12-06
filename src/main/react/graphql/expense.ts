export interface Expense {
  id: string;
  personId: UUID;
  description: string;
  date: Date;
  status: Status;
}

export interface CostExpense extends Expense {
  id: string;
  personId: UUID;
  description: string;
  date: Date;
  status: Status;
  amount: number;
  files: CostExpenseFile[];
}

export interface CostExpenseFile {
  name: string;
  file: UUID;
}

export interface TravelExpense extends Expense {
  id: string;
  personId: UUID;
  description: string;
  date: Date;
  status: Status;
  distance: number;
  allowance: number;
}

export interface CostExpenseInput {
  personId: UUID;
  description: string;
  date: Date;
  status: Status;
  amount: number;
  files: CostExpenseFileInput[];
}

export interface CostExpenseFileInput {
  name: string;
  file: UUID;
}

export interface TravelExpenseInput {
  personId: UUID;
  description: string;
  date: Date;
  status: Status;
  distance: number;
  allowance: number;
}
