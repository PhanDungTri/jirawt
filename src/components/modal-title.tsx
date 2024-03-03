import { Group, Text } from '@mantine/core';
import type { FC, SVGProps } from 'react';

type ModalTitleProps = {
  icon?: FC<SVGProps<SVGSVGElement>>;
  title: string;
};

export const ModalTitle: FC<ModalTitleProps> = ({ icon: Icon, title }) => (
  <Text size="lg" c="lime" fw={500}>
    <Group gap="sm">
      {Icon ? <Icon /> : null}
      <span>{title}</span>
    </Group>
  </Text>
);
