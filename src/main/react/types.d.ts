export type StatusProps = "REQUESTED" | "APPROVED" | "REJECTED";
export type typeProp =
  | "WORKDAY"
  | "SICKDAY"
  | "HOLIDAY"
  | "PLUSDAY"
  | "EXPENSE";

export type DayProps = {
  type: typeProp;
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

export type InputItemProps = {
  id: string;
  type: typeProp;
  personId: string;
  personName: string;
  description: string;
};

export type GroupedItemProps = {
  type: typeProp;
  items: InputItem[];
};

const TransitionStateProps = {
  from: StatusProp,
  to: StatusProp,
};
