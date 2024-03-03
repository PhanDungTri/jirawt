import { SECONDS_PER_HOUR } from '@constants/common';
import type { ChartOptions } from 'chart.js';

const formatSpentTime = (spentTime: number) => {
  const h = Math.floor(spentTime / SECONDS_PER_HOUR);
  const m = Math.floor((spentTime % SECONDS_PER_HOUR) / 60);
  const s = spentTime % 60;

  return `${h}h ${m}m ${s}s`;
};

export const options: ChartOptions<'bar'> = {
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (context) => context[0].dataset.label,
        label: (context) => formatSpentTime(context.raw as number),
      },
    },
  },
  responsive: true,
  scales: {
    x: { stacked: true },
    y: { stacked: true },
  },
};
