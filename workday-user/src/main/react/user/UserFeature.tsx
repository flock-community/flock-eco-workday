import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { UserDialog } from './UserDialog';
import { UserTable } from './UserTable';

type UserFeatureProps = {
  enablePassword?: boolean;
};

export function UserFeature({ enablePassword }: UserFeatureProps) {
  const [searchState, setSearchState] = useState<string>('');
  const [debouncedSearchState, setDebouncedSearchState] = useState<string>('');

  const [dialogState, setDialogState] = useState({
    open: false,
    id: null,
  });

  const [reload, setReload] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchState(searchState);
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [searchState]);

  const handleRowClick = (item) => {
    setDialogState({
      open: true,
      id: item.id,
    });
  };

  const handleNewClick = () => {
    setDialogState({
      open: true,
      id: null,
    });
  };

  const handleComplete = () => {
    setDialogState({
      open: false,
      id: null,
    });
    setReload(!reload);
  };

  return (
    <Box
      className={'flow full-width'}
      flow-gap={'wide'}
      style={{ paddingInline: 24, paddingBottom: '1.5rem' }}
    >
      <Card>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="h6">Users</Typography>
          </Box>
          <Box
            sx={{
              ml: 'auto',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              minWidth: 0,
            }}
          >
            <TextField
              size="small"
              value={searchState}
              onChange={(event) => setSearchState(event.target.value)}
              placeholder="Search name"
            />
          </Box>
          <Button onClick={handleNewClick} startIcon={<AddIcon />}>
            Add
          </Button>
        </Box>
        <CardContent
          sx={{
            '& tbody tr:last-child td, & tbody tr:last-child th': {
              borderBottom: 0,
            },
          }}
        >
          <UserTable
            refresh={reload}
            search={debouncedSearchState}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>
      <UserDialog
        open={dialogState.open}
        id={dialogState.id}
        onComplete={handleComplete}
        enablePassword={enablePassword}
      />
    </Box>
  );
}
