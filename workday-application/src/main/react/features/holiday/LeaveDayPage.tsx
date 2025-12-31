import PersonLayout from '../../components/layouts/PersonLayout';
import { LeaveDayFeature } from './LeaveDayFeature';

export default function LeaveDayPage() {
  return (
    <PersonLayout requireAuthority={'LeaveDayAuthority.ADMIN'}>
      {(person) => <LeaveDayFeature person={person} />}
    </PersonLayout>
  );
}
