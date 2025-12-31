import PersonLayout from '../../components/layouts/PersonLayout';
import { WorkDayFeature } from './WorkDayFeature';

export default function WorkDayPage() {
  return (
    <PersonLayout requireAuthority={'WorkDayAuthority.ADMIN'}>
      {(person) => <WorkDayFeature person={person} />}
    </PersonLayout>
  );
}
