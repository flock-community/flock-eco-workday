import PersonLayout from '../../components/layouts/PersonLayout';
import { ContractFeature } from './ContractFeature';

export default function ContractPage() {
  return (
    <PersonLayout requireAuthority={'ContractAuthority.ADMIN'}>
      {(person) => <ContractFeature person={person} />}
    </PersonLayout>
  );
}
