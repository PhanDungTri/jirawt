import { boardAtom } from '@atoms/board';
import { Easel } from '@components/icons/easel';
import { SelectableCard } from '@components/selectable-card';
import { COMMAND } from '@constants/commands';
import type { BoardDTO } from '@dtos/board';
import { isCriticalError } from '@errors/critical-error';
import { useUnauthorziedHandler } from '@hooks/use-unauthorized-handler';
import { SimpleGrid } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';
import { showCriticalErrorNotification } from '@utils/notification';
import { useSetAtom } from 'jotai';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

import type { ScreenWithInitialLoadingListProps } from '../utils/types';
import { withInitialLoadingList } from '../with-initial-loading-list';

const InnerBoardListScreen: FC<ScreenWithInitialLoadingListProps> = ({ setCriticalError, setLoading }) => {
  const [, setLocation] = useLocation();
  const [boards, setBoards] = useState<BoardDTO[]>([]);
  const setBoard = useSetAtom(boardAtom);
  const handleUnauthorizedError = useUnauthorziedHandler();

  const handleChooseBoard = (boardId: number) => () => {
    try {
      setBoard(boards.find((item) => item.id === boardId) ?? null);
      setLocation(`/board/${boardId}/worklogs`);
    } catch (e) {
      if (isCriticalError(e)) {
        showCriticalErrorNotification(e);
      }
    }
  };

  const getBoards = async () => {
    setLoading(true);

    try {
      const boards = await invoke<BoardDTO[]>(COMMAND.FETCH_BOARDS);

      setBoards(boards);
    } catch (e) {
      handleUnauthorizedError(e);

      if (isCriticalError(e)) {
        setCriticalError(e.message);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    void getBoards();
  }, []);

  return (
    <SimpleGrid cols={3}>
      {boards.map((item) => (
        <SelectableCard onSelect={handleChooseBoard(item.id)} key={item.id} icon={Easel}>
          <span>{item.name}</span>
        </SelectableCard>
      ))}
    </SimpleGrid>
  );
};

const BoardListScreen = withInitialLoadingList(InnerBoardListScreen);

export { BoardListScreen };
