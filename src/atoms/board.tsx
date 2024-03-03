import type { BoardDTO } from '@dtos/board';
import { atom } from 'jotai';

export const boardAtom = atom<BoardDTO | null>(null);
