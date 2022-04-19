export interface AggregationClientPersonOverview {
  client: AggregationClientPersonOverviewClient;
  aggregationPersonAssignment: AggregationClientPersonItem[];
  totals: number[];
}

export interface AggregationClientPersonItem {
  person: AggregationClientPersonOverviewPerson;
  hours: number[];
  total: number;
}

export interface AggregationClientPersonOverviewClient {
  id: string;
  name: string;
}

export interface AggregationClientPersonOverviewPerson {
  id: string;
  name: string;
}
