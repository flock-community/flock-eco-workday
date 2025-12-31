import type { Person } from '../../clients/PersonClient';
import PersonLayout from '../../components/layouts/PersonLayout';
import { SickDayFeature } from './SickDayFeature';

export default function SickDayPage() {
  return (
    <PersonLayout requireAuthority={'SickdayAuthority.ADMIN'}>
      {(person: Person) => <SickDayFeature person={person} />}
    </PersonLayout>
  );
}
