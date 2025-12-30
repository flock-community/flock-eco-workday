import React, { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { Box } from "@mui/material";
import { ConfirmDialog } from "@workday-core/components/ConfirmDialog";
import { Person, PersonClient } from "../../clients/PersonClient";
import { PersonWidget } from "../../components/person-widget/PersonWidget";
import { AlignedLoader } from "@workday-core/components/AlignedLoader";
import { PersonDialog } from "./PersonDialog";
import { ContractFeature } from "../contract/ContractFeature";
import { WorkDayFeature } from "../workday/WorkDayFeature";
import { AssignmentFeature } from "../assignments/AssignmentFeature";
import { LeaveDayFeature } from "../holiday/LeaveDayFeature";
import { SickDayFeature } from "../sickday/SickDayFeature";
import { ExpenseFeature } from "../expense/ExpenseFeature";
import { usePerson } from "../../hooks/PersonHook";

export const PersonDetails = () => {
  const history = useHistory();
  const { params } = useRouteMatch();
  const [reload, setReload] = useState(false);
  const [personContext, setPersonContext] = usePerson();
  const [person, setPerson] = useState<Person>();
  const [dialog, setDialog] = useState({ edit: false, del: false });

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

  return (
    <Box
      className={"flow"}
      flow-gap={"wide"}
      style={{ paddingBottom: "1.5rem" }}
    >
      <Box className={"even-columns"}>
        <PersonWidget
          person={person}
          handleEditDialog={handleEditDialog}
          handleDelDialog={handleDelDialog}
        />
        <ExpenseFeature person={person} />
      </Box>

      <Box>
        <WorkDayFeature person={person} />
      </Box>

      <Box className={"even-columns"}>
        <ContractFeature person={person} />
        <AssignmentFeature person={person} />
      </Box>

      <Box className={"even-columns"}>
        <LeaveDayFeature person={person} />
        <SickDayFeature person={person} />
      </Box>

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
    </Box>
  );
};
