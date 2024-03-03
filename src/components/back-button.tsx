import { Button } from '@mantine/core';
import type { FC } from 'react';
import { Link } from 'wouter';

import { ArrowBackOutline } from './icons/arrow-back-outline';

type BackButtonProps = {
  onBack?: () => void;
  url: string;
};

export const BackButton: FC<BackButtonProps> = ({ onBack, url }) => (
  <Link onClick={onBack} href={url}>
    <Button className="back-button" color="gray" variant="subtle" leftSection={<ArrowBackOutline />}>
      Back
    </Button>
  </Link>
);
