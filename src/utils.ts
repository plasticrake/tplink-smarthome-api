/* eslint-disable @typescript-eslint/camelcase */

import castArray from 'lodash.castarray';

/**
 * Represents an error result received from a TP-Link device.
 *
 * Where response err_code != 0.
 * @param command - command sent to device
 * @param errorModules - array of modules that returned with errors.
 */
export class ResponseError extends Error {
  constructor(
    message: string,
    readonly response: string,
    readonly command: string,
    readonly errorModules: string[]
  ) {
    super(message);
    this.name = 'ResponseError';
    this.message = `${message} response: ${JSON.stringify(
      response
    )} command: ${JSON.stringify(command)}`;
    Error.captureStackTrace(this, this.constructor);
  }
}

type ScheduleDateStart = {
  smin: number;
  stime_opt: number;
};

type ScheduleDateEnd = {
  emin: number;
  etime_opt: number;
};

type ScheduleDate = ScheduleDateStart | ScheduleDateEnd;

type DaysOfWeek = number[];

type WDay = [boolean, boolean, boolean, boolean, boolean, boolean, boolean];

type ScheduleRule = {
  day?: number;
  month?: number;
  year?: number;
  wday?: WDay;
  repeat?: boolean;
};

type ScheduleRuleTime = Date | number | 'sunrise' | 'sunset';

export function isObjectLike(
  candidate: unknown
): candidate is Record<string, unknown> {
  return typeof candidate === 'object' && candidate !== null;
}

function createScheduleDate(
  date: ScheduleRuleTime,
  startOrEnd: 'start' | 'end'
): ScheduleDate {
  let min = 0;
  let time_opt = 0;

  if (date instanceof Date) {
    min = date.getHours() * 60 + date.getMinutes();
  } else if (typeof date === 'number') {
    min = date;
  } else if (date === 'sunrise') {
    min = 0;
    time_opt = 1;
  } else if (date === 'sunset') {
    min = 0;
    time_opt = 2;
  }

  if (startOrEnd === 'end') {
    return { emin: min, etime_opt: time_opt };
  }
  return { smin: min, stime_opt: time_opt };
}

function createWday(daysOfWeek: DaysOfWeek): WDay {
  const wday: WDay = [false, false, false, false, false, false, false];
  daysOfWeek.forEach(dw => {
    wday[dw] = true;
  });
  return wday;
}

export function createScheduleRule({
  start,
  end,
  daysOfWeek,
}: {
  start: ScheduleRuleTime;
  end?: ScheduleRuleTime;
  daysOfWeek?: DaysOfWeek;
}): ScheduleRule {
  const sched: ScheduleRule = {};

  Object.assign(sched, createScheduleDate(start, 'start'));
  if (end !== undefined) {
    Object.assign(sched, createScheduleDate(end, 'end'));
  }

  if (daysOfWeek !== undefined && daysOfWeek.length > 0) {
    sched.wday = createWday(daysOfWeek);
    sched.repeat = true;
  } else {
    const date = start instanceof Date ? start : new Date();
    sched.day = date.getDate();
    sched.month = date.getMonth() + 1;
    sched.year = date.getFullYear();
    sched.wday = [false, false, false, false, false, false, false];
    sched.wday[date.getDay()] = true;
    sched.repeat = false;
  }

  return sched;
}

export function normalizeMac(mac = ''): string {
  return mac.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

export function compareMac(mac = '', macPattern: string | string[]): boolean {
  const macPatterns = castArray(macPattern).map(p => {
    return new RegExp(
      `^${p
        .replace(/[^A-Za-z0-9?*]/g, '')
        .replace(/[?]/g, '.')
        .replace(/[*]/g, '.*')
        .toUpperCase()}$`
    );
  });
  const normalizedMac = normalizeMac(mac);
  return macPatterns.findIndex(p => p.test(normalizedMac)) !== -1;
}

export function replaceControlCharacters(
  input: string,
  replace = '﹖'
): string {
  return input.replace(/[\x00-\x1F]/g, replace); // eslint-disable-line no-control-regex
}
