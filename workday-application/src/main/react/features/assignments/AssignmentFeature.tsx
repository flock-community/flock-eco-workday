import AddIcon from '@mui/icons-material/Add';
import { Card, CardContent, CardHeader } from '@mui/material';
import Button from '@mui/material/Button';
import UserAuthorityUtil from '@workday-user/user_utils/UserAuthorityUtil';
import { useState } from 'react';
import type { Person } from '../../clients/PersonClient';
import { AssignmentDialog } from './AssignmentDialog';
import { AssignmentList } from './AssignmentList';

type AssignmentFeatureProps = {
  person: Person;
};

export function AssignmentFeature({ person }: AssignmentFeatureProps) {
  const hasWriteAuthority = UserAuthorityUtil.hasAuthority(
    'AssignmentAuthority.WRITE',
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
