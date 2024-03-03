import type { ComboboxItem, OptionsFilter } from '@mantine/core';

export const filterSelectItems: OptionsFilter = ({ options, search }) => {
  const searchTerm = search.toLowerCase();

  return options.filter((item) => {
    const { label, value } = item as ComboboxItem;
    const lowercaseLabel = label.toLowerCase();
    const lowercaseValue = value.toLowerCase();

    return lowercaseLabel.includes(searchTerm) || lowercaseValue.includes(searchTerm);
  });
};
