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
      <AssignmentList
        personId={person?.uuid}
        onItemClick={handleItemClick}
        refresh={reload}
        disableEdit={!hasWriteAuthority}
        onClickAdd={handleClickAdd}
      />
      <AssignmentDialog
        code={dialog.code}
        open={dialog.open}
        onClose={handleClose}
      />
    </>
  );
}
