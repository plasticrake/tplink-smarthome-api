/* eslint camelcase: ["off"] */
'use strict';
/**
 * Represents an error result received from a TP-Link device.
 *
 * Where response err_code != 0.
 * @extends Error
 */
class ResponseError extends Error {
  constructor (message, response) {
    super(message);
    this.name = 'ResponseError';
    this.message = `${message} response: ${JSON.stringify(response)}`;
    this.response = response;
    Error.captureStackTrace(this, this.constructor);
  }
}

function isDate (val) {
  return val instanceof Date;
}
function isNumber (val) {
  return typeof val === 'number';
}

function createScheduleDate (date, startOrEnd) {
  let min;
  let time_opt = 0;

  if (isDate(date)) {
    min = (date.getHours() * 60) + date.getMinutes();
  } else if (isNumber(date)) {
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
  } else {
    return { smin: min, stime_opt: time_opt };
  }
}

function createWday (daysOfWeek) {
  let wday = [ false, false, false, false, false, false, false ];
  daysOfWeek.forEach((dw) => {
    wday[dw] = true;
  });
  return wday;
}

function createScheduleRule ({start, end = null, daysOfWeek = null}) {
  let sched = {};

  Object.assign(sched, createScheduleDate(start, 'start'));
  if (end !== null) {
    Object.assign(sched, createScheduleDate(end, 'end'));
  }

  if (daysOfWeek !== null && daysOfWeek.length > 0) {
    sched.wday = createWday(daysOfWeek);
    sched.repeat = true;
  } else {
    let date = (isDate(start) ? start : new Date());
    sched.day = date.getDate();
    sched.month = date.getMonth() + 1;
    sched.year = date.getFullYear();
    sched.wday = [false, false, false, false, false, false, false];
    sched.wday[date.getDay()] = true;
    sched.repeat = false;
  }

  return sched;
}

module.exports = {
  ResponseError,
  createScheduleRule
};
