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
