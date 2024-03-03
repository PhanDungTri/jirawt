import { COMMAND } from '@constants/commands';
import type { WorklogDTO } from '@dtos/worklog';
import { isCriticalError } from '@errors/critical-error';
import { useUnauthorziedHandler } from '@hooks/use-unauthorized-handler';
import { Group, Select, Switch } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';
import { showCriticalErrorNotification } from '@utils/notification';
import type { ChangeEvent, FC } from 'react';

import type { ViewMode } from '../utils/types';
import { SprintSelection } from './sprint-selection';

type ChartDataSelectionProps = {
  viewMode: ViewMode;
  detailed: boolean;
  disabled: boolean;
  onLoadWorklogs: () => void;
  onRetrieveWorklogs: (data: WorklogDTO[]) => void;
  onChangeViewMode: (viewMode: ViewMode) => void;
  onChangeDetailMode: (detailed: boolean) => void;
};

export const ChartDataSelection: FC<ChartDataSelectionProps> = ({
  viewMode,
  detailed,
  disabled,
  onLoadWorklogs,
  onRetrieveWorklogs,
  onChangeDetailMode,
  onChangeViewMode,
}) => {
  const handleUnauthorizedError = useUnauthorziedHandler();

  const onChangeSprint = async (sprintId: number) => {
    try {
      onLoadWorklogs();

      const worklogs = await invoke<WorklogDTO[]>(COMMAND.FETCH_WORKLOGS, {
        sprintId,
      });

      onRetrieveWorklogs(worklogs);
    } catch (e) {
      handleUnauthorizedError(e);

      if (isCriticalError(e)) {
        showCriticalErrorNotification(e);
      }

      onRetrieveWorklogs([]);
    }
  };

  const handleChangeViewMode = (mode: string | null) => {
    if (mode) {
      onChangeViewMode(mode as ViewMode);
    }
  };

  const handleChangeDetailMode = (e: ChangeEvent<HTMLInputElement>) => {
    onChangeDetailMode(e.currentTarget.checked);
  };

  return (
    <Group>
      <SprintSelection onChangeSprint={onChangeSprint} disabled={disabled} />
      <Select
        data={[
          { label: 'View by date', value: 'date' },
          { label: 'View by issue', value: 'issue' },
        ]}
        value={viewMode}
        allowDeselect={false}
        onChange={handleChangeViewMode}
        disabled={disabled}
      />
      <Switch onChange={handleChangeDetailMode} label={detailed ? 'Detailed' : 'Overall'} disabled={disabled} />
    </Group>
  );
};
