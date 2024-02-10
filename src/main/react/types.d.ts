import { Todo } from "./wirespec/Openapispec";

export type StatusProps = "REQUESTED" | "APPROVED" | "REJECTED";
export type TypeProp =
  | "WORKDAY"
  | "SICKDAY"
  | "HOLIDAY"
  | "PAID_PARENTAL_LEAVE"
  | "UNPAID_PARENTAL_LEAVE"
  | "PLUSDAY"
  | "EXPENSE";

export type DayProps = {
  type: TypeProp;
  id: number;
  code: string;
  from: Dayjs;
  to: Dayjs;
  hours: number;
  days: number[];
  description: null;
  status: StatusProps;
  personId: string;
};

export type DayListProps = {
  personId?: string;
  refresh: boolean;
  onClickRow: (item: any) => void;
  onClickStatus: (status: string, item: any) => void;
};

export type GroupedTodos = {
  todoType: TypeProp;
  todos: Todo[];
};
