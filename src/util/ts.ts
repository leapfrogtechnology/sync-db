import { NS_PER_SEC } from '../constants';

/**
 * Calculate elapsed time from the given start time (process.hrtime()).
 *
 * @param {[number, number]} timeStart
 * @param {(false | number)} fixed
 * @returns {(number | string)}
 */
export function getElapsedTime(timeStart: [number, number], fixed: false | number = 2): number {
  const timeDiff = process.hrtime(timeStart);
  const timeElapsed = Number(timeDiff[0]) + Number(timeDiff[1] / NS_PER_SEC);

  if (fixed === false) {
    return timeElapsed;
  }

  return Number(timeElapsed.toFixed(fixed));
}

/**
 * Gets a timestamp string for the given date.
 *
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
export function getTimestampString(date: Date = new Date()): string {
  const dtf = new Intl.DateTimeFormat('en', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    second: '2-digit',
    year: 'numeric'
  });

  const [
    { value: month },
    ,
    { value: day },
    ,
    { value: year },
    ,
    { value: hour },
    ,
    { value: minute },
    ,
    { value: second }
  ] = dtf.formatToParts(date);

  return `${year}${month}${day}${hour}${minute}${second}`;
}
