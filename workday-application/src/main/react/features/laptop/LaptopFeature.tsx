import { Box } from '@mui/material';
import { useState } from 'react';
import type { Laptop } from '../../clients/LaptopClient';
import { LaptopDialog } from './LaptopDialog';
import { LaptopList } from './LaptopList';

type DialogState = {
  open: boolean;
  code?: string;
};

export function LaptopFeature() {
  const [reload, setReload] = useState(false);
  const [dialog, setDialog] = useState<DialogState>({ open: false });

  const handleAdd = () => setDialog({ open: true });

  const handleItem = (laptop: Laptop) =>
    setDialog({ open: true, code: laptop.code });

  const handleClose = () => {
    setDialog({ open: false });
    setReload(!reload);
  };

  return (
    <Box
      className={'flow'}
      flow-gap={'wide'}
      style={{ paddingBottom: '1.5rem' }}
    >
      <LaptopList
        refresh={reload}
        onItemClick={handleItem}
        onClickAdd={handleAdd}
      />
      <LaptopDialog
        code={dialog.code}
        open={dialog.open}
        onClose={handleClose}
      />
    </Box>
  );
}
