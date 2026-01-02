import AddIcon from '@mui/icons-material/Add';
import { Box, Card, CardContent, CardHeader } from '@mui/material';
import Button from '@mui/material/Button';
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
      className={'flow'}
      flow-gap={'wide'}
      style={{ paddingBottom: '1.5rem' }}
    >
      <Card>
        <CardHeader
          title="Clients"
          action={
            <Button onClick={handleAdd}>
              <AddIcon /> Add
            </Button>
          }
        />
        <CardContent>
          <ClientList refresh={reload} onItemClick={handleItem} />
        </CardContent>
      </Card>
      <ClientDialog
        code={dialog.code}
        open={dialog.open}
        onClose={handleClose}
      />
    </Box>
  );
}
