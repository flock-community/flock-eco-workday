import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import { Container } from "@material-ui/core";
import { HolidayDialog } from "./HolidayDialog";
import { HolidayList } from "./HolidayList";
import { PersonSelector } from "../../components/selector";
import { AddActionFab } from "../../components/FabButtons";
import { usePerson } from "../../hooks/PersonHook.ts";
import { HolidayClient } from "../../clients/HolidayClient";

const useStyles = makeStyles({
  root: {
    padding: 20
  }
});

/**
 * @return {null}
 */
export function HolidayFeature() {
  const classes = useStyles();

  const [refresh, setRefresh] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [person, setPerson] = usePerson();

  function handleCompleteDialog() {
    setRefresh(!refresh);
    setOpen(false);
    setValue(null);
  }

  function handleClickAdd() {
    setValue(null);
    setOpen(true);
  }

  function handleClickRow(e, it) {
    setValue(it);
    setOpen(true);
  }

  function handlePersonChange(it) {
    setPerson(it);
  }

  function handleStatusChange(status, it) {
    HolidayClient.put(it.code, {
      ...it,
      status,
      from: it.from.format("YYYY-MM-DD"),
      to: it.to.format("YYYY-MM-DD")
    }).then(() => setRefresh(!refresh));
  }

  return (
    <Container className={classes.root}>
      <Grid container spacing={1}>
        <UserAuthorityUtil has={"HolidayAuthority.ADMIN"}>
          <Grid item xs={12}>
            <PersonSelector
              value={person && person.code}
              onChange={handlePersonChange}
            />
          </Grid>
        </UserAuthorityUtil>
        <Grid item xs={12}>
          <HolidayList
            personCode={person && person.code}
            refresh={refresh}
            onClickRow={handleClickRow}
            onClickStatus={handleStatusChange}
          />
        </Grid>
      </Grid>
      <HolidayDialog
        open={open}
        code={value && value.code}
        personCode={person && person.code}
        onComplete={handleCompleteDialog}
      />
      <AddActionFab color="primary" onClick={handleClickAdd} />
    </Container>
  );
}
