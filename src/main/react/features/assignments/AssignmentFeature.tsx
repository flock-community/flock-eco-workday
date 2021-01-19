import React, { useState } from "react";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import Grid from "@material-ui/core/Grid";
import { PersonSelector } from "../../components/selector";
import { AssignmentList } from "./AssignmentList";
import { AddActionFab } from "../../components/FabButtons";
import { AssignmentDialog } from "./AssignmentDialog";
import { usePerson } from "../../hooks/PersonHook";
import { Box } from "@material-ui/core";

export function AssignmentFeature() {
  const [person, setPerson] = usePerson();

  const [reload, setReload] = useState(true);
  const [dialog, setDialog] = useState({ open: false, code: null });

  function handleClickAdd() {
    setDialog({ open: true, code: null });
  }

  function handleClose() {
    setDialog({ open: false, code: null });
    setReload(!reload);
  }

  function handleChangePerson(it) {
    setPerson(it);
  }

  function handleItemClick(it) {
    setDialog({ open: true, code: it.code });
  }

  return (
    <Box m={2}>
      <Grid container spacing={1}>
        <UserAuthorityUtil has={"AssignmentAuthority.ADMIN"}>
          <Grid item xs={12}>
            <PersonSelector
              value={person?.uuid}
              onChange={handleChangePerson}
              fullWidth
            />
          </Grid>
        </UserAuthorityUtil>
        <Grid item xs={12}>
          <AssignmentList
            personId={person?.uuid}
            onItemClick={handleItemClick}
            reload={reload}
          />
        </Grid>
      </Grid>
      <AssignmentDialog
        code={dialog.code}
        open={dialog.open}
        onClose={handleClose}
      />
      <AddActionFab color="primary" onClick={handleClickAdd} />
    </Box>
  );
}

AssignmentFeature.propTypes = {};
