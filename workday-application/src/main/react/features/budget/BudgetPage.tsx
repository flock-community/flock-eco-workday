import type { Person } from '../../clients/PersonClient';
import PersonLayout from '../../components/layouts/PersonLayout';
import { BudgetFeature } from './BudgetFeature';

export default function BudgetPage() {
  return (
    <PersonLayout requireAuthority={'AggregationAuthority.READ'}>
      {(person: Person) => <BudgetFeature person={person} />}
    </PersonLayout>
  );
}
