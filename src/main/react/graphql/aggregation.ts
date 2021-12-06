export interface AggregationClientPersonOverview {
  clientName: string;
  aggregationPerson: AggregationClientPersonItem[];
  totals: number[];
}

export interface AggregationClientPersonItem {
  personName: string;
  hours: number[];
  total: number;
}
