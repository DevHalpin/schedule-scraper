const moment = require("moment");

function convertAndMergeIntervals(schedules, day) {
  if (schedules.length === 0) return [];

  const intervals = schedules
    .map(({ start, end }) => ({ start: new Date(`${day} ${start}`), end: new Date(`${day} ${end}`) }))
    .sort((a, b) => a.start - b.start);

  return intervals.reduce((merged, interval) => {
    const last = merged[merged.length - 1];
    if (last && last.end.getTime() + 60000 >= interval.start.getTime()) {
      last.end = new Date(Math.max(last.end.getTime(), interval.end.getTime()));
    } else {
      merged.push(interval);
    }
    return merged;
  }, []);
}

function formatDate(date) {
  return moment(date).format("h:mm a");
}

module.exports = { convertAndMergeIntervals, formatDate };
