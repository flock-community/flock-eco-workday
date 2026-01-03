import type { GroupedTodos } from '../types';
import type { Todo } from '../wirespec/model';

export const getItemsPerPage: (
  data: GroupedTodos,
  page: number,
  pageSize: number,
) => Todo[] = (data: GroupedTodos, page: number, pageSize: number) =>
  data.todos.slice(page * pageSize, page * pageSize + pageSize);

export const getPaginatedTabs: (
  data: GroupedTodos[],
  page: number,
  pageSize: number,
) => GroupedTodos[] = (data: GroupedTodos[], page: number, pageSize: number) =>
  data.map((item) => ({
    todoType: item.todoType,
    todos: getItemsPerPage(item, page, pageSize),
  }));
