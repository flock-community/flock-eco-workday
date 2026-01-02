import AddIcon from '@mui/icons-material/Add';
import { Card, CardContent, CardHeader } from '@mui/material';
import Button from '@mui/material/Button';
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
      <Card>
        <CardHeader
          title="Contracts"
          action={
            <Button color="primary" onClick={handleClickAdd}>
              <AddIcon /> Add
            </Button>
          }
        />
        <CardContent>
          <ContractList
            personId={person?.uuid}
            onItemClick={handleItemClick}
            refresh={reload}
          />
        </CardContent>
      </Card>
      <ContractDialog
        code={dialog.code}
        open={dialog.open}
        onClose={handleClose}
      />
    </>
  );
}
