import { GroupedItemProps } from "../types";

export const getItemsPerPage = (
  data: GroupedItemProps,
  page: number,
  pageSize: number
) => {
  return data.items.slice(page * pageSize, page * pageSize + pageSize);
};

export const getPaginatedTabs = (
  data: GroupedItemProps[],
  page: number,
  pageSize: number
) => {
  return data.map((item) => {
    return {
      type: item.type,
      items: getItemsPerPage(item, page, pageSize),
    };
  });
};
