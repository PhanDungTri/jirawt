import dayjs from 'dayjs';

export const sortByDateString = (a: string, b: string) => dayjs(a).diff(dayjs(b), 'd');
