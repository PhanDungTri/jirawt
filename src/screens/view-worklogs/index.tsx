import { boardAtom } from '@atoms/board';
import { BackButton } from '@components/back-button';
import type { WorklogDTO } from '@dtos/worklog';
import { ChartDataSelection } from '@features/view-worklogs/chart-data-selection';
import type { ViewMode } from '@features/view-worklogs/utils/types';
import { WorklogsChart } from '@features/view-worklogs/worklogs-chart';
import { Box, Center, LoadingOverlay, Title } from '@mantine/core';
import { useAtomValue } from 'jotai';
import type { FC } from 'react';
import { useState } from 'react';

type ViewWorklogsScreenProps = {
  boardId: number;
};

export const ViewWorklogsScreen: FC<ViewWorklogsScreenProps> = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('date');
  const [detailed, setDetailed] = useState(false);
  const [worklogs, setWorklogs] = useState<WorklogDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const board = useAtomValue(boardAtom);

  const onLoadWorklogs = () => {
    setLoading(true);
  };

  const onRetrieveWorklogs = (worklogs: WorklogDTO[]) => {
    setWorklogs(worklogs);
    setLoading(false);
  };

  return (
    <Box className="view-worklogs-page">
      <BackButton url="/boards" />
      <Title order={2}>{board?.name ?? 'Unknown board'}</Title>
      <ChartDataSelection
        viewMode={viewMode}
        detailed={detailed}
        disabled={loading}
        onLoadWorklogs={onLoadWorklogs}
        onRetrieveWorklogs={onRetrieveWorklogs}
        onChangeDetailMode={setDetailed}
        onChangeViewMode={setViewMode}
      />
      <Center pos="relative">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 1, radius: 'sm' }} />
        <WorklogsChart worklogs={worklogs} viewMode={viewMode} detailed={detailed} />
      </Center>
    </Box>
  );
};
