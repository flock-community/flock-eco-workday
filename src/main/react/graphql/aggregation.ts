export interface AggregationIdentifier {
  id: string;
  name: string;
}

export interface AggregationClientPersonOverview {
  client: AggregationIdentifier;
  aggregationPerson: AggregationClientPersonItem[];
  totals: number[];
}

export interface AggregationClientPersonAssignmentOverview {
  client: AggregationIdentifier;
  aggregationPersonAssignment: AggregationClientPersonAssignmentItem[];
  totals: number[];
}

export interface AggregationClientPersonItem {
  person: AggregationIdentifier;
  hours: number[];
  total: number;
}

export interface AggregationClientPersonAssignmentItem {
  person: AggregationIdentifier;
  assignment: AggregationIdentifier;
  hours: number[];
  total: number;
}

export interface AggregationPersonClientRevenueOverview {
  clients: AggregationPersonClientRevenueItem[];
  total: BigDecimal;
}

export interface AggregationPersonClientRevenueItem {
  client: AggregationIdentifier;
  revenue: BigDecimal;
}
