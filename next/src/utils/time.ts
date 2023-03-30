const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;
const month = 30 * day;

export enum Time {
  SECOND = second,
  MINUTE = minute,
  HOUR = hour,
  DAY = day,
  WEEK = week,
  MONTH = month,
}

export const timeout = (ms = 3_000) =>
  new Promise((resolve) => setTimeout(resolve, ms));
