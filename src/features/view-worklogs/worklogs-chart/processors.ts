import type { WorklogDTO } from '@dtos/worklog';
import { stringToHexColor } from '@utils/color';
import { sortByDateString } from '@utils/sort';
import dayjs from 'dayjs';

const OVERALL_CHART_COLOR = '#94D82D';

const processWorklogsByDate = (worklogs: WorklogDTO[]) => {
  const [labels, minDate, maxDate] = worklogs.reduce<[string[], string | null, string | null]>(
    ([labels, minDate, maxDate], cur) => {
      const date = dayjs(cur.started);
      const dateString = date.format('YYYY-MM-DD');

      if (!labels.includes(dateString)) {
        labels.push(dateString);
      }

      if (!minDate || date.isBefore(minDate, 'd')) {
        minDate = dateString;
      }

      if (!maxDate || date.isAfter(maxDate, 'd')) {
        maxDate = dateString;
      }

      return [labels, minDate, maxDate];
    },
    [[], null, null],
  );

  let date = dayjs(minDate).add(1, 'd');

  while (date.isBefore(maxDate, 'd')) {
    const dateString = date.format('YYYY-MM-DD');

    if (!labels.includes(dateString)) {
      labels.push(dateString);
    }

    date = date.add(1, 'd');
  }

  labels.sort(sortByDateString);

  return {
    detailed: () => {
      const issues = Array.from(new Set(worklogs.map((item) => item.issueKey)));

      const datasets = issues.map((issue, i) => {
        const data = labels.map((label) =>
          worklogs
            .filter((item) => item.issueKey === issue && dayjs(item.started).format('YYYY-MM-DD') === label)
            .reduce((acc, cur) => acc + cur.timeSpentSeconds, 0),
        );

        return {
          label: issue,
          data,
          backgroundColor: stringToHexColor([issue, data.reduce((acc, cur) => acc + cur, 0) * i].join('.')),
        };
      });

      return { labels, datasets };
    },
    overall: () => {
      const data = labels.map((label) =>
        worklogs
          .filter((item) => dayjs(item.started).format('YYYY-MM-DD') === label)
          .reduce((acc, cur) => acc + cur.timeSpentSeconds, 0),
      );

      return { labels, datasets: [{ data, backgroundColor: OVERALL_CHART_COLOR }] };
    },
  };
};

const processWorklogsByIssue = (worklogs: WorklogDTO[]) => {
  const labels = Array.from(new Set(worklogs.map((item) => item.issueKey)));

  return {
    detailed: () => {
      const dates = Array.from(new Set(worklogs.map((item) => dayjs(item.started).format('YYYY-MM-DD')))).sort(
        sortByDateString,
      );

      const datasets = dates.map((date, i) => {
        const data = labels.map((label) =>
          worklogs
            .filter((item) => item.issueKey === label && dayjs(item.started).format('YYYY-MM-DD') === date)
            .reduce((acc, cur) => acc + cur.timeSpentSeconds, 0),
        );

        return {
          label: date,
          data,
          backgroundColor: stringToHexColor([date, data.reduce((acc, cur) => acc + cur, 0) * i].join('.')),
        };
      });

      return { labels, datasets };
    },
    overall: () => {
      const data = labels.map((label) =>
        worklogs.filter((item) => item.issueKey === label).reduce((acc, cur) => acc + cur.timeSpentSeconds, 0),
      );

      return { labels, datasets: [{ data, backgroundColor: OVERALL_CHART_COLOR }] };
    },
  };
};

export { processWorklogsByDate, processWorklogsByIssue };
