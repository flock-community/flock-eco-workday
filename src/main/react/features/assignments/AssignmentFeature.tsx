import React, { useState } from "react";
import { AssignmentList } from "./AssignmentList";
import { AssignmentDialog } from "./AssignmentDialog";
import { Card, CardContent, CardHeader } from "@material-ui/core";
import { Person } from "../../clients/PersonClient";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";

type AssignmentFeatureProps = {
  person: Person;
};

export function AssignmentFeature({ person }: AssignmentFeatureProps) {
  const hasWriteAuthority = UserAuthorityUtil.hasAuthority(
    "AssignmentAuthority.WRITE"
  );
  const [reload, setReload] = useState(true);
  const [dialog, setDialog] = useState({ open: false, code: null });

  function handleClickAdd() {
    setDialog({ open: true, code: null });
  }

  function handleClose() {
    setDialog({ open: false, code: null });
    setReload(!reload);
  }

  function handleItemClick(it) {
    setDialog({ open: true, code: it.code });
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Assignments"
          action={
            hasWriteAuthority && (
              <Button onClick={handleClickAdd}>
                <AddIcon /> Add
              </Button>
            )
          }
        />
        <CardContent>
          <AssignmentList
            personId={person?.uuid}
            onItemClick={handleItemClick}
            reload={reload}
            disableEdit={!hasWriteAuthority}
          />
        </CardContent>
      </Card>
      <AssignmentDialog
        code={dialog.code}
        open={dialog.open}
        onClose={handleClose}
      />
    </>
  );
}

AssignmentFeature.propTypes = {};
