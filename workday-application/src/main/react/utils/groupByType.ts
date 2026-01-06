import type { GroupedTodos } from '../types';
import type { Todo } from '../wirespec/model';

/**
 * Groups an array of input items by their type.
 *
 * @param {Todo[]} input - The array of input items to group.
 * @returns {GroupedTodos[]} An array of grouped items, where each group contains all items of a given type.
 */
export const groupByType = (input: Todo[]): GroupedTodos[] => {
  const grouped: Record<string, GroupedTodos> = {};

  for (const item of input) {
    if (!grouped[item.todoType]) {
      grouped[item.todoType] = {
        todoType: item.todoType,
        todos: [],
      };
    }
    grouped[item.todoType].todos.push(item);
  }

  return Object.values(grouped);
};
