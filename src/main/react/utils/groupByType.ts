import type { InputItemProps, GroupedItemProps } from "../types";

/**
 * Groups an array of input items by their type.
 *
 * @param {InputItemProps[]} input - The array of input items to group.
 * @returns {GroupedItemProps[]} An array of grouped items, where each group contains all items of a given type.
 */
export const groupByType = (input: InputItemProps[]): GroupedItemProps[] => {
  const grouped: Record<string, GroupedItemProps> = {};

  for (const item of input) {
    if (!grouped[item.type]) {
      grouped[item.type] = {
        type: item.type,
        items: [],
      };
    }
    grouped[item.type].items.push(item);
  }

  return Object.values(grouped);
};
