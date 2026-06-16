import type {Person} from "../../clients/PersonClient";
import PersonLayout from '../../components/layouts/PersonLayout';
import {ExpenseFeature} from './ExpenseFeature';

export default function ExpensePage() {
  return (
    <PersonLayout requireAuthority={'ExpenseAuthority.ADMIN'}>
      {(person: Person) => <ExpenseFeature person={person}/>}
    </PersonLayout>
  );
}
