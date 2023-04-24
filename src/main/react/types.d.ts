export type DayProps = {
  type: string;
  id: number;
  code: string;
  from: Dayjs;
  to: Dayjs;
  hours: number;
  days: number[];
  description: null;
  status: string;
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
  type: string;
  personId: string;
  personName: string;
  description: string;
};

export type GroupedItemProps = {
  type: string;
  items: InputItem[];
};
