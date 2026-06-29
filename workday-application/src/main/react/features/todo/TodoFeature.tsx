import { Box } from '@mui/material';
import { addError } from '../../hooks/ErrorHook';
import type { StatusProps } from '../../types';
import type { Todo } from '../../wirespec/model';
import { TodoList } from './TodoList';
import { updateStatus } from './TodoService';

export function TodoFeature() {
  const handleItemClick = (status: StatusProps, item: Todo) =>
    updateStatus(status, item).catch((error) => {
      addError(`Could not update status: ${error?.message ?? error}`);
      throw error;
    });

  return (
    <Box
      className={'flow'}
      flow-gap={'wide'}
      style={{ paddingBottom: '1.5rem' }}
    >
      <TodoList onItemClick={handleItemClick} refresh={false} />
    </Box>
  );
}
