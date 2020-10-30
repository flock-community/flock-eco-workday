import React, { useState } from "react";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { PersonSelector } from "../../components/selector";
import { ContractList } from "./ContractList";
import { AddActionFab } from "../../components/FabButtons";
import { usePerson } from "../../hooks/PersonHook";
import { ContractDialog } from "./ContractDialog";

const useStyles = makeStyles({
  root: {
    padding: 20
  }
});

/**
 * @return {null}
 */
export function ContractFeature() {
  const classes = useStyles();

  const [reload, setReload] = useState(true);
  const [dialog, setDialog] = useState({ open: false, code: null });
  const [person, setPerson] = usePerson();

  function handleClickAdd() {
    setDialog({ open: true, code: null });
  }

  function handleClose() {
    setDialog({ open: false, code: null });
    setReload(!reload);
  }

  function handleChangePerson(it) {
    if (it) setPerson(it);
  }

  function handleItemClick(it) {
    setDialog({ open: true, code: it.code });
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <UserAuthorityUtil has={"AssignmentAuthority.ADMIN"}>
          <Grid item xs={12}>
            <PersonSelector
              value={person && person.code}
              onChange={handleChangePerson}
              label="Select person"
              embedded={false}
              multiple={false}
            />
          </Grid>
        </UserAuthorityUtil>
        <Grid item xs={12}>
          <ContractList
            personCode={person && person.code}
            onItemClick={handleItemClick}
            reload={reload}
          />
        </Grid>
      </Grid>
      <ContractDialog
        code={dialog.code}
        open={dialog.open}
        onClose={handleClose}
      />
      <AddActionFab color="primary" onClick={handleClickAdd} />
    </div>
  );
}
