import { Box, Card, CardHeader } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import { useState } from 'react';
import { addError } from '../../hooks/ErrorHook';
// Types
import type { StatusProps } from '../../types';
import type { Todo } from '../../wirespec/model';
import { TodoList } from './TodoList';
import { updateStatus } from './TodoService';

export function TodoFeature() {
  const [refresh, setRefresh] = useState(false);

  const handleItemClick = (status: StatusProps, item: Todo) => {
    updateStatus(status, item)
      .then(() => {
        setRefresh((current) => !current);
      })
      .catch((error) => {
        addError(`Could not update status: ${error?.message ?? error}`);
      });
  };

  return (
    <Box
      className={'flow'}
      flow-gap={'wide'}
      style={{ paddingBottom: '1.5rem' }}
    >
      <Card>
        <CardHeader title="Todo's" />
        <CardContent>
          <TodoList onItemClick={handleItemClick} refresh={refresh} />
        </CardContent>
      </Card>
    </Box>
  );
}
