import { NS_PER_SEC } from '../constants';

/**
 * Calculate elapsed time from the given start time (process.hrtime()).
 *
 * @param {[number, number]} timeStart
 * @returns {number}
 */
export function getElapsedTime(timeStart: [number, number]): number {
  const timeDiff = process.hrtime(timeStart);
  const timeElapsed = Number(timeDiff[0]) + Number(timeDiff[1] / NS_PER_SEC);

  return timeElapsed;
}
