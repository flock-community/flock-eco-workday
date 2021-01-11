import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import {AppBar, Button, Card, Container, IconButton, Toolbar} from "@material-ui/core";
import { HolidayDialog } from "./HolidayDialog";
import { HolidayList } from "./HolidayList";
import { PersonSelector } from "../../components/selector";
import { AddActionFab } from "../../components/FabButtons";
import { usePerson } from "../../hooks/PersonHook";
import { HolidayClient } from "../../clients/HolidayClient";
import AddIcon from "@material-ui/icons/Add";

export function HolidayFeature() {
  const [person, setPerson] = usePerson();

  const [refresh, setRefresh] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);

  function handleCompleteDialog() {
    setRefresh(!refresh);
    setOpen(false);
    setValue(null);
  }

  function handleClickAdd() {
    setValue(null);
    setOpen(true);
  }

  function handleClickRow(it) {
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
      to: it.to.format("YYYY-MM-DD"),
    }).then(() => setRefresh(!refresh));
  }

  return (
    <Container>

      <Grid container spacing={2}>
        <UserAuthorityUtil has={"HolidayAuthority.ADMIN"}>
          <Grid item xs={12}>
            <PersonSelector
              value={person?.uuid}
              onChange={handlePersonChange}
              fullWidth
            />
          </Grid>
        </UserAuthorityUtil>
        <Grid item xs={12}>
          <HolidayList
            personId={person?.uuid}
            refresh={refresh}
            onClickRow={handleClickRow}
            onClickStatus={handleStatusChange}
          />
        </Grid>
      </Grid>
      <HolidayDialog
        open={open}
        code={value?.code}
        personId={person?.uuid}
        onComplete={handleCompleteDialog}
      />
      <AddActionFab color="primary" onClick={handleClickAdd} />
    </Container>
  );
}
