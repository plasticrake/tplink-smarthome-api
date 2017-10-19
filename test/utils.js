/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */
'use strict';

const { expect } = require('./setup');

const { createScheduleRule } = require('../src/utils');

let today = new Date();
let todayYear = today.getFullYear();
let todayMonth = today.getMonth() + 1;
let todayDay = today.getDate();
let todayWday = [ false, false, false, false, false, false, false ];
todayWday[today.getDay()] = true;

let tests = [
  {
    name: 'start as Date',
    args: { start: new Date(2017, 9, 14, 20, 4, 40) },
    expected: {
      smin: 1204,
      stime_opt: 0,
      day: 14,
      month: 10,
      year: 2017,
      wday: [ false, false, false, false, false, false, true ],
      repeat: false
    }
  },
  {
    name: 'start as number of minutes',
    args: { start: 1204 },
    expected: {
      smin: 1204,
      stime_opt: 0,
      day: todayDay,
      month: todayMonth,
      year: todayYear,
      wday: todayWday,
      repeat: false
    }
  },
  {
    name: 'start as Date and daysOfWeek',
    args: { start: new Date(2017, 9, 14, 20, 4, 40), daysOfWeek: [1, 2, 3, 4, 5] },
    expected: {
      smin: 1204,
      stime_opt: 0,
      wday: [ false, true, true, true, true, true, false ],
      repeat: true
    }
  },
  {
    name: 'start as number and daysOfWeek',
    args: { start: 1204, daysOfWeek: [1, 2, 3, 4, 5] },
    expected: {
      smin: 1204,
      stime_opt: 0,
      wday: [ false, true, true, true, true, true, false ],
      repeat: true
    }
  },
  {
    name: 'start as Date and end as Date',
    args: {
      start: new Date(2017, 9, 14, 20, 0, 0),
      end: new Date(2017, 9, 14, 22, 30, 0)
    },
    expected: {
      smin: 1200,
      stime_opt: 0,
      emin: 1350,
      etime_opt: 0,
      day: 14,
      month: 10,
      year: 2017,
      wday: [ false, false, false, false, false, false, true ],
      repeat: false
    }
  },
  {
    name: 'start as Date and end as number of minutes',
    args: {
      start: new Date(2017, 9, 14, 20, 0, 0),
      end: 1350
    },
    expected: {
      smin: 1200,
      stime_opt: 0,
      emin: 1350,
      etime_opt: 0,
      day: 14,
      month: 10,
      year: 2017,
      wday: [ false, false, false, false, false, false, true ],
      repeat: false
    }
  },
  {
    name: 'start as sunrise and end as sunset',
    args: {
      start: 'sunrise',
      end: 'sunset'
    },
    expected: {
      smin: 0,
      stime_opt: 1,
      emin: 0,
      etime_opt: 2,
      day: todayDay,
      month: todayMonth,
      year: todayYear,
      wday: todayWday,
      repeat: false
    }
  },
  {
    name: 'start as sunrise and end as sunset on weekends',
    args: {
      start: 'sunrise',
      end: 'sunset',
      daysOfWeek: [0, 6]
    },
    expected: {
      smin: 0,
      stime_opt: 1,
      emin: 0,
      etime_opt: 2,
      wday: [ true, false, false, false, false, false, true ],
      repeat: true
    }
  }
];

describe('Utils', function () {
  this.timeout(1000);
  this.slow(500);
  describe('.createScheduleRule()', function () {
    tests.forEach(function (test) {
      it(`should accept ${test.name}`, function () {
        let sched = createScheduleRule(test.args);
        expect(sched).to.eql(test.expected);
      });
    });
  });
});
