import {Card} from '@mui/material';
import {useEffect, useState} from 'react';
import {UserDialog} from './UserDialog';
import {UserTable} from './UserTable';
import {UserToolbar} from './UserToolbar';

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

  const handleSearchChange = (search: string) => {
    setSearchState(search);
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
    <>
      <Card>
        <UserToolbar
          onAdd={handleNewClick}
          onSearchChange={handleSearchChange}
        />
        <UserTable
          refresh={reload}
          search={debouncedSearchState}
          onRowClick={handleRowClick}
        />
      </Card>
      <UserDialog
        open={dialogState.open}
        id={dialogState.id}
        onComplete={handleComplete}
        enablePassword={enablePassword}
      />
    </>
  );
}
