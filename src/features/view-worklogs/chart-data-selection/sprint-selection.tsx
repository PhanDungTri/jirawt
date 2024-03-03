import { boardAtom } from '@atoms/board';
import { COMMAND } from '@constants/commands';
import type { SprintDTO } from '@dtos/sprint';
import { isCriticalError } from '@errors/critical-error';
import { useUnauthorziedHandler } from '@hooks/use-unauthorized-handler';
import { Loader, Select } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';
import { filterSelectItems } from '@utils/filter';
import { isNullOrUndefined } from '@utils/helper';
import { showCriticalErrorNotification } from '@utils/notification';
import { useAtomValue } from 'jotai';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { sortByDateString } from '../../../utils/sort';

type SprintSelectionProps = {
  disabled: boolean;
  onChangeSprint: (sprint: number) => void;
};

const generatePlaceHolder = (length?: number) => {
  if (isNullOrUndefined(length)) {
    return 'Retrieving sprint list';
  }

  return length === 0 ? 'No available sprint' : 'Select a sprint';
};

export const SprintSelection: FC<SprintSelectionProps> = ({ disabled, onChangeSprint }) => {
  const [sprints, setSprints] = useState<SprintDTO[] | null>(null);
  const handleUnauthorizedError = useUnauthorziedHandler();
  const board = useAtomValue(boardAtom);
  const handleChangeSprint = (sprint: string | null) => {
    const sprintId = parseInt(sprint ?? '', 10);

    if (!isNaN(sprintId)) {
      onChangeSprint(sprintId);
    }
  };

  useEffect(() => {
    invoke<SprintDTO[]>(COMMAND.FETCH_SPRINTS, { boardId: board?.id })
      .then((sprints) => {
        setSprints(sprints.sort((a, b) => sortByDateString(b.createdDate, a.createdDate)));
      })
      .catch((e) => {
        handleUnauthorizedError(e);

        if (isCriticalError(e)) {
          showCriticalErrorNotification(e);
        }
      });
  }, []);

  return (
    <Select
      data={sprints?.map((item) => ({ label: item.name, value: `${item.id}` }))}
      onChange={handleChangeSprint}
      placeholder={generatePlaceHolder(sprints?.length)}
      disabled={disabled || isNullOrUndefined(sprints)}
      filter={filterSelectItems}
      rightSection={isNullOrUndefined(sprints) && <Loader size="xs" />}
      searchable
    />
  );
};
