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
      <ExpenseList
        personId={person?.uuid}
        onClickRow={handleClickRow}
        refresh={reload}
        onClickStatus={() => {}}
        onClickAdd={handleClickAdd}
      />
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
