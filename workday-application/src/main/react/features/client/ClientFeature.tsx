import { Box } from '@mui/material';
import { useState } from 'react';
import { ClientDialog } from './ClientDialog';
import { ClientList } from './ClientList';

export function ClientFeature() {
  const [reload, setReload] = useState(false);

  const [dialog, setDialog] = useState({
    open: false,
    code: undefined,
  });

  const handleAdd = () => {
    setDialog({
      open: true,
      code: undefined,
    });
  };

  const handleItem = (it) => {
    setDialog({
      open: true,
      code: it.code,
    });
  };

  const handleClose = () => {
    setDialog({
      open: false,
      code: undefined,
    });
    setReload(!reload);
  };

  return (
    <Box
      className={'flow full-width'}
      flow-gap={'wide'}
      style={{ paddingInline: 24, paddingBottom: '1.5rem' }}
    >
      <ClientList
        refresh={reload}
        onItemClick={handleItem}
        onClickAdd={handleAdd}
      />
      <ClientDialog
        code={dialog.code}
        open={dialog.open}
        onClose={handleClose}
      />
    </Box>
  );
}
