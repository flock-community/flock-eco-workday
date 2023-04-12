import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@material-ui/core";
import { ExpenseList } from "./ExpenseList";
import { ExpenseDialog } from "./ExpenseDialog";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import { Person } from "../../clients/PersonClient";

type ExpenseFeatureProps = {
  person: Person;
};

export function ExpenseFeature({ person }: ExpenseFeatureProps) {
  const [reload, setReload] = useState(false);
  const [{ id, open }, setDialog] = useState({ id: null, open: false });

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

  const handleClickRow = (item) => {
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
          />
        </CardContent>
      </Card>
      <ExpenseDialog
        id={id!!}
        open={open}
        personId={person?.uuid}
        personFullName={person.fullName}
        onComplete={handleCompleteDialog}
      />
    </>
  );
}
