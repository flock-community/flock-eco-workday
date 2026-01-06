import AddIcon from '@mui/icons-material/Add';
import { Card, CardContent, CardHeader } from '@mui/material';
import Button from '@mui/material/Button';
import { useState } from 'react';
import type { Person } from '../../clients/PersonClient';
import type { Expense } from '../../wirespec/model';
import { ExpenseDialog } from './ExpenseDialog';
import { ExpenseList } from './ExpenseList';

type ExpenseFeatureProps = {
  person: Person;
};

export function ExpenseFeature({ person }: ExpenseFeatureProps) {
  const [reload, setReload] = useState(false);
  const [{ id, open }, setDialog] = useState<{
    id?: string | null;
    open: boolean;
  }>({ id: null, open: false });

  const handleCompleteDialog = () => {
    setReload(!reload);
    setDialog({
      id: null,
      open: false,
    });
  };

  const handleClickAdd = () => {
    setDialog({
      id: null,
      open: true,
    });
  };

  const handleClickRow = (item: Expense) => {
    setDialog({
      id: item.id,
      open: true,
    });
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Expenses"
          action={
            <Button onClick={handleClickAdd}>
              <AddIcon /> Add
            </Button>
          }
        />
        <CardContent>
          <ExpenseList
            personId={person?.uuid}
            onClickRow={handleClickRow}
            refresh={reload}
            onClickStatus={() => {}}
          />
        </CardContent>
      </Card>
      <ExpenseDialog
        id={id}
        open={open}
        personId={person?.uuid}
        personFullName={person.fullName}
        onComplete={handleCompleteDialog}
      />
    </>
  );
}
