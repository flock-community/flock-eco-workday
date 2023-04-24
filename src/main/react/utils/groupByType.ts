type InputItem = {
  id: string;
  type: string;
  personId: string;
  personName: string;
  description: string;
};

type GroupedItem = {
  type: string;
  items: InputItem[];
};

export const groupByType = (input: InputItem[]): GroupedItem[] => {
  const grouped: Record<string, GroupedItem> = {};

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
