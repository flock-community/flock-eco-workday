import React, { useContext, useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Container } from "@material-ui/core";
import { WorkDayDialog } from "./WorkDayDialog";
import { WorkDayList } from "./WorkDayList";
import { PersonSelector } from "../../components/selector";
import { ApplicationContext } from "../../application/ApplicationContext";
import { AddActionFab } from "../../components/FabButtons";
import { usePerson } from "../../hooks/PersonHook";
import { WorkDayClient } from "../../clients/WorkDayClient";
import { addError } from "../../hooks/ErrorHook";

const useStyles = makeStyles({
  root: {
    marginTop: 20,
  },
});

/**
 * @return {null}
 */
export function WorkDayFeature() {
  const classes = useStyles();

  const [person, setPerson] = usePerson();

  const [refresh, setRefresh] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState();
  const { authorities } = useContext(ApplicationContext);

  function isSuperUser() {
    return authorities && authorities.includes("WorkDayAuthority.ADMIN");
  }

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

  function handlePersonChange(it) {
    setPerson(it);
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
    <Container className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {isSuperUser() && (
            // @ts-ignore
            <PersonSelector
              value={person?.uuid}
              onChange={handlePersonChange}
              fullWidth
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <WorkDayList
            personId={person?.uuid}
            onClickRow={handleClickRow}
            refresh={refresh}
            onClickStatus={handleStatusChange}
          />
        </Grid>
      </Grid>
      <WorkDayDialog
        open={open}
        // @ts-ignore
        code={value && value.code}
        onComplete={handleCompleteDialog}
      />
      {
        //@ts-ignore
        <AddActionFab color="primary" onClick={handleClickAdd} />
      }
    </Container>
  );
}
