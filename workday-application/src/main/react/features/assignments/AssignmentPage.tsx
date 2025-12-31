import PersonLayout from '../../components/layouts/PersonLayout';
import { AssignmentFeature } from './AssignmentFeature';

export default function AssignmentPage() {
  return (
    <PersonLayout requireAuthority={'AssignmentAuthority.ADMIN'}>
      {(person) => <AssignmentFeature person={person} />}
    </PersonLayout>
  );
}
