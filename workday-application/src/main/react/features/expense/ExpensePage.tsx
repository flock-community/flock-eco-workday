import PersonLayout from '../../components/layouts/PersonLayout';
import { ExpenseFeature } from './ExpenseFeature';

export default function ExpensePage() {
  return (
    <PersonLayout requireAuthority={'ExpenseAuthority.ADMIN'}>
      {(person) => <ExpenseFeature person={person} />}
    </PersonLayout>
  );
}
