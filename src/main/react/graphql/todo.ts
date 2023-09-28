export interface Todo {
  id: UUID;
  type: TodoType;
  personId: UUID;
  personName: string;
  description: string;
}

export type TodoType =
  | "WORKDAY"
  | "SICKDAY"
  | "HOLIDAY"
  | "PAID_PARENTAL_LEAVE"
  | "UNPAID_PARENTAL_LEAVE"
  | "EXPENSE"
  | "PLUSDAY";
