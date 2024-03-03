import type { WorklogDTO } from '@dtos/worklog';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

import type { ViewMode } from '../utils/types';
import { options } from './options';
import { processWorklogsByDate, processWorklogsByIssue } from './processors';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type WorklogsChartProps = {
  worklogs: WorklogDTO[];
  viewMode: ViewMode;
  detailed?: boolean;
};

export const WorklogsChart: FC<WorklogsChartProps> = ({ worklogs, viewMode, detailed }) => {
  const chartData = useMemo(() => {
    const processWorklogs = (viewMode === 'date' ? processWorklogsByDate : processWorklogsByIssue)(worklogs);

    return processWorklogs[detailed ? 'detailed' : 'overall']();
  }, [worklogs, viewMode, detailed]);

  return <Bar options={options} data={chartData} />;
};
