import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
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
      className={'flow'}
      flow-gap={'wide'}
      style={{ paddingBottom: '1.5rem' }}
    >
      <Card>
        <CardHeader
          title="Users"
          action={
            <Button onClick={handleNewClick} startIcon={<AddIcon />}>
              Add
            </Button>
          }
        />
        <CardContent>
          <Box m={2}>
            <TextField
              value={searchState}
              onChange={(event) => setSearchState(event.target.value)}
              placeholder="Search name"
            />
          </Box>
          <Card>
            <CardContent>
              <UserTable
                refresh={reload}
                search={debouncedSearchState}
                onRowClick={handleRowClick}
              />
            </CardContent>
          </Card>
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
