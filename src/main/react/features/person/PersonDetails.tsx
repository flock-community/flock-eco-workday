import React, { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ConfirmDialog } from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import { Person, PersonClient } from "../../clients/PersonClient";
import { PersonWidget } from "../../components/person-widget/PersonWidget";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import { PersonDialog } from "./PersonDialog";
import { ContractFeature } from "../contract/ContractFeature";
import { WorkDayFeature } from "../workday/WorkDayFeature";
import { AssignmentFeature } from "../assignments/AssignmentFeature";
import { HolidayFeature } from "../holiday/HolidayFeature";
import { SickDayFeature } from "../sickday/SickDayFeature";
import { ExpenseFeature } from "../expense/ExpenseFeature";
import { usePerson } from "../../hooks/PersonHook";

const useStyles = makeStyles(() => ({
  root: { margin: "-8px" },
  marginLeft: {
    marginLeft: "1rem",
  },
  defaultPadding: {
    padding: "1rem",
  },
}));

export const PersonDetails = (props) => {
  const history = useHistory();
  const { params } = useRouteMatch();
  const [reload, setReload] = useState(false);
  const [personContext, setPersonContext] = usePerson();
  const [person, setPerson] = useState<Person>();
  const [dialog, setDialog] = useState({ edit: false, del: false });
  const classes = useStyles();

  useEffect(() => {
    PersonClient.get(params.personId).then((person) => {
      setPerson(person);
      setPersonContext(person.uuid);
    });
  }, [reload]);

  const handleEditDialog = () => {
    const { edit, del } = dialog;
    setDialog({ edit: !edit, del });
    setReload(!reload);
  };

  const handleDelDialog = () => {
    const { edit, del } = dialog;
    setDialog({ edit, del: !del });
  };

  const handleDelete = () => {
    PersonClient.delete(person!!.uuid).then(() => {
      handleDelDialog();
      history.push("/person");
    });
  };

  if (person === undefined) {
    return <AlignedLoader />;
  }

  const contracts = (
    <Grid item xs={12} sm={6}>
      <ContractFeature person={person} />
    </Grid>
  );

  const workDays = (
    <Grid item xs={12} sm={12}>
      <WorkDayFeature person={person} />
    </Grid>
  );

  const assignments = (
    <Grid item xs={12} sm={6}>
      <AssignmentFeature person={person} />
    </Grid>
  );

  const holidays = (
    <Grid item xs={12} sm={6}>
      <HolidayFeature person={person} />
    </Grid>
  );

  const sickdays = (
    <Grid item xs={12} sm={6}>
      <SickDayFeature person={person} />
    </Grid>
  );

  const expenses = (
    <Grid item xs={12} sm={6}>
      <ExpenseFeature person={person} />
    </Grid>
  );

  return (
    // <Grid container> wrapper is defined @PersonFeature
    <div>
      <Grid container item xs={12} spacing={2} className={classes.root}>
        <Grid item xs={12} sm={6}>
          <PersonWidget
            person={person}
            handleEditDialog={handleEditDialog}
            handleDelDialog={handleDelDialog}
          />
        </Grid>
        {expenses}
        {workDays}
        {contracts}
        {assignments}
        {holidays}
        {sickdays}
      </Grid>

      <PersonDialog
        open={dialog.edit}
        onClose={handleEditDialog}
        item={person}
      />
      <ConfirmDialog
        open={dialog.del}
        onConfirm={handleDelete}
        onClose={handleDelDialog}
      >
        Surely you cant be serious? Delete {person.firstname} {person.lastname}
      </ConfirmDialog>
    </div>
  );
};
