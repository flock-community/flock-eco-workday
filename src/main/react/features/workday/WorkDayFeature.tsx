import React, { useContext, useState } from "react";
import { Card, CardContent, CardHeader } from "@material-ui/core";
import { WorkDayDialog } from "./WorkDayDialog";
import { WorkDayList } from "./WorkDayList";
import { ApplicationContext } from "../../application/ApplicationContext";
import { WorkDayClient } from "../../clients/WorkDayClient";
import { addError } from "../../hooks/ErrorHook";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import { Person } from "../../clients/PersonClient";

type WorkDayFeatureProps = {
  person: Person;
};

export function WorkDayFeature({ person }: WorkDayFeatureProps) {
  const [refresh, setRefresh] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<any>();
  const { authorities } = useContext(ApplicationContext);

  function handleCompleteDialog() {
    setRefresh(!refresh);
    setOpen(false);
    setValue(undefined);
  }

  function handleClickAdd() {
    if (person === null) {
      addError("No person selected");
    } else {
      setValue(undefined);
      setOpen(true);
    }
  }

  function handleClickRow(item) {
    setValue(item);
    setOpen(true);
  }

  function handleStatusChange(status, it) {
    WorkDayClient.put(it.code, {
      ...it,
      from: it.from.format("YYYY-MM-DD"),
      to: it.to.format("YYYY-MM-DD"),
      status,
      assignmentCode: it.assignment.code,
      days: it.days.length > 0 ? it.days : null,
    }).then(() => setRefresh(!refresh));
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Work days"
          action={
            <Button onClick={handleClickAdd}>
              <AddIcon /> Add
            </Button>
          }
        />
        <CardContent>
          <WorkDayList
            personId={person?.uuid}
            onClickRow={handleClickRow}
            refresh={refresh}
            onClickStatus={handleStatusChange}
          />
        </CardContent>
      </Card>
      <WorkDayDialog
        open={open}
        code={value?.code}
        onComplete={handleCompleteDialog}
      />
    </>
  );
}
