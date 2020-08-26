import React, { useContext, useState } from "react";

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

const useStyles = makeStyles({
  root: {
    marginTop: 20
  }
});

/**
 * @return {null}
 */
export function WorkDayFeature() {
  const classes = useStyles();

  const [person, setPerson] = usePerson();

  const [refresh, setRefresh] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const { authorities } = useContext(ApplicationContext);

  function isSuperUser() {
    if (authorities !== null)
      // @ts-ignore
      // not sure why typescript thinks this can be null -.-
      return authorities.includes("WorkDayAuthority.ADMIN");
    return false;
  }

  function handleCompleteDialog() {
    setRefresh(!refresh);
    setOpen(false);
    setValue(null);
  }

  function handleClickAdd() {
    setValue(null);
    setOpen(true);
  }

  function handleClickRow(e, item) {
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
      days: it.days.length > 0 ? it.days : null
    }).then(() => setRefresh(!refresh));
  }

  return (
    <Container className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {isSuperUser() && (
            // @ts-ignore
            <PersonSelector
              value={person && person.code}
              onChange={handlePersonChange}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <WorkDayList
            personCode={person && person.code}
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
      <AddActionFab color="primary" onClick={handleClickAdd} />
    </Container>
  );
}
