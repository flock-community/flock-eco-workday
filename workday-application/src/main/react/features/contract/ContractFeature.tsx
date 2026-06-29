import { useState } from 'react';
import type { Person } from '../../clients/PersonClient';
import { ContractDialog } from './ContractDialog';
import { ContractList } from './ContractList';

type ContractFeatureProps = {
  person: Person;
};

export function ContractFeature({ person }: ContractFeatureProps) {
  const [reload, setReload] = useState(true);
  const [dialog, setDialog] = useState({ open: false, code: null });

  function handleClickAdd() {
    setDialog({ open: true, code: null });
  }

  function handleClose() {
    setDialog({ open: false, code: null });
    setReload(!reload);
  }

  function handleItemClick(it) {
    setDialog({ open: true, code: it.code });
  }

  return (
    <>
      <ContractList
        personId={person?.uuid}
        onItemClick={handleItemClick}
        refresh={reload}
        onClickAdd={handleClickAdd}
      />
      <ContractDialog
        code={dialog.code}
        open={dialog.open}
        onClose={handleClose}
      />
    </>
  );
}
