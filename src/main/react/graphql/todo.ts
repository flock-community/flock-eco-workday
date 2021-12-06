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
  | "EXPENSE"
  | "PLUSDAY";
