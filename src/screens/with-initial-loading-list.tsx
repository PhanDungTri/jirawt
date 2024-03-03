import { AlertCircle } from '@components/icons/alert-circle';
import { Alert, Box, Center, Loader, Title } from '@mantine/core';
import type { FC } from 'react';
import { useState } from 'react';

import { BackButton } from '../components/back-button';
import type { ScreenWithInitialLoadingListProps } from './utils/types';

type InnerScreenProps = {
  title: string;
  backUrl?: string;
  onBack?: () => void;
};

export const withInitialLoadingList = (Screen: FC<ScreenWithInitialLoadingListProps>) => {
  const InnerScreen: FC<InnerScreenProps> = ({ title, backUrl, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [criticalError, setCriticalError] = useState('');

    return (
      <>
        {backUrl ? <BackButton url={backUrl} onBack={onBack} /> : null}
        <Title order={2} ta="center" my="xl">
          {title}
        </Title>
        <Center>
          {loading ? <Loader size="lg" /> : null}
          {criticalError ? (
            <Alert color="red" icon={<AlertCircle />}>
              {criticalError}
            </Alert>
          ) : null}
          <Box display={loading || criticalError ? 'none' : undefined}>
            <Screen setCriticalError={setCriticalError} setLoading={setLoading} />
          </Box>
        </Center>
      </>
    );
  };

  return InnerScreen;
};
