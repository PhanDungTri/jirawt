import type { MantineColor, StyleProp } from '@mantine/core';
import { Card, Loader, Stack, Text } from '@mantine/core';
import { clsx } from 'clsx';
import type { FC, ReactNode, SVGProps } from 'react';

type SelectableCardProps = {
  onSelect: () => void;
  icon: FC<SVGProps<SVGSVGElement>>;
  children: ReactNode;
  className?: string;
  color?: StyleProp<MantineColor>;
  loading?: boolean;
  disabled?: boolean;
};

export const SelectableCard: FC<SelectableCardProps> = ({
  onSelect,
  icon: Icon,
  children,
  className,
  color = 'lime',
  loading,
  disabled,
}) => (
  <Card
    shadow="md"
    className={clsx('card', className, disabled && 'disabled', (disabled || loading) && 'disabled-pointer-event')}
    onClick={loading || disabled ? undefined : onSelect}
  >
    <Text c={disabled ? 'dimmed' : color} fw={500} ta="center">
      <Stack align="center">
        {loading ? <Loader size={32} /> : <Icon fontSize={32} />}
        {children}
      </Stack>
    </Text>
  </Card>
);
