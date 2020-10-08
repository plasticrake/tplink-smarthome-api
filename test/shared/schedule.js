/* eslint no-unused-expressions: [off] */

const { expect } = require('../setup');
const { createRule } = require('../../src/shared/schedule');

const today = new Date();
const todayYear = today.getFullYear();
const todayMonth = today.getMonth() + 1;
const todayDay = today.getDate();
const todayWday = [false, false, false, false, false, false, false];
todayWday[today.getDay()] = true;

const scheduleTests = [
  {
    name: 'start as Date',
    args: { start: new Date(2017, 9, 14, 20, 4, 40) },
    expected: {
      smin: 1204,
      stime_opt: 0,
      day: 14,
      month: 10,
      year: 2017,
      wday: [false, false, false, false, false, false, true],
      repeat: false,
    },
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
      repeat: false,
    },
  },
  {
    name: 'start as Date and daysOfWeek',
    args: {
      start: new Date(2017, 9, 14, 20, 4, 40),
      daysOfWeek: [1, 2, 3, 4, 5],
    },
    expected: {
      smin: 1204,
      stime_opt: 0,
      wday: [false, true, true, true, true, true, false],
      repeat: true,
    },
  },
  {
    name: 'start as number and daysOfWeek',
    args: { start: 1204, daysOfWeek: [1, 2, 3, 4, 5] },
    expected: {
      smin: 1204,
      stime_opt: 0,
      wday: [false, true, true, true, true, true, false],
      repeat: true,
    },
  },
  {
    name: 'start as Date and end as Date',
    args: {
      start: new Date(2017, 9, 14, 20, 0, 0),
      end: new Date(2017, 9, 14, 22, 30, 0),
    },
    expected: {
      smin: 1200,
      stime_opt: 0,
      emin: 1350,
      etime_opt: 0,
      day: 14,
      month: 10,
      year: 2017,
      wday: [false, false, false, false, false, false, true],
      repeat: false,
    },
  },
  {
    name: 'start as Date and end as number of minutes',
    args: {
      start: new Date(2017, 9, 14, 20, 0, 0),
      end: 1350,
    },
    expected: {
      smin: 1200,
      stime_opt: 0,
      emin: 1350,
      etime_opt: 0,
      day: 14,
      month: 10,
      year: 2017,
      wday: [false, false, false, false, false, false, true],
      repeat: false,
    },
  },
  {
    name: 'start as sunrise and end as sunset',
    args: {
      start: 'sunrise',
      end: 'sunset',
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
      repeat: false,
    },
  },
  {
    name: 'start as sunrise and end as sunset on weekends',
    args: {
      start: 'sunrise',
      end: 'sunset',
      daysOfWeek: [0, 6],
    },
    expected: {
      smin: 0,
      stime_opt: 1,
      emin: 0,
      etime_opt: 2,
      wday: [true, false, false, false, false, false, true],
      repeat: true,
    },
  },
];

describe('Schedule', function () {
  describe('.createRule()', function () {
    scheduleTests.forEach(function (test) {
      it(`should accept ${test.name}`, function () {
        const sched = createRule(test.args);
        expect(sched).to.eql(test.expected);
      });
    });
  });
});

module.exports = function (ctx, testDevice) {
  describe('Schedule', function () {
    let device;
    let month;
    let year;

    beforeEach('Schedule', async function () {
      device = ctx.device;
      await device.schedule.deleteAllRules();
    });

    before('Schedule', async function () {
      if (!testDevice.getDevice) this.skip();

      month = today.getMonth() + 1;
      year = today.getFullYear();
    });

    describe('#getNextAction()', function () {
      it('should return schedule next action', function () {
        return expect(
          device.schedule.getNextAction()
        ).to.eventually.have.property('err_code', 0);
      });
    });

    describe('#getRules()', function () {
      it('should return schedule rules', function () {
        return expect(device.schedule.getRules()).to.eventually.have.property(
          'err_code',
          0
        );
      });
    });

    describe('#deleteAllRules()', function () {
      it('should delete all rules', async function () {
        const deleteResponse = await device.schedule.deleteAllRules();
        expect(deleteResponse).to.have.property('err_code', 0);

        const getResponse = await device.schedule.getRules();
        expect(getResponse).to.have.property('err_code', 0);
        expect(getResponse.rule_list).to.have.property('length', 0);
      });
    });

    describe('#deleteRule()', function () {
      it('should delete a rule', async function () {
        // need to support both Bulb and Plug
        const lightState = {
          saturation: 21,
          hue: 129,
          brightness: 17,
          color_temp: 0,
          mode: 'customize_preset',
          on_off: 1,
        };
        const addResponse = await device.schedule.addRule({
          powerState: true,
          lightState,
          start: 60,
        });
        expect(addResponse, 'addRule').to.have.property('err_code', 0);
        expect(addResponse, 'addRule').to.have.property('id');

        const deleteResponse = await device.schedule.deleteRule(addResponse.id);
        expect(deleteResponse).to.have.property('err_code', 0);

        const getResponse = await device.schedule.getRules();
        expect(getResponse).to.have.property('err_code', 0);
        const rule = getResponse.rule_list.find((r) => r.id === addResponse.id);
        expect(rule).to.be.undefined;
      });
    });

    describe('#setOverallEnable()', function () {
      it('should enable', async function () {
        expect(await device.schedule.setOverallEnable(true)).to.have.property(
          'err_code',
          0
        );
      });
      it('should disable', async function () {
        expect(await device.schedule.setOverallEnable(false)).to.have.property(
          'err_code',
          0
        );
      });
    });

    describe('#getDayStats()', function () {
      it('should return day stats', function () {
        return expect(
          device.schedule.getDayStats(year, month)
        ).to.eventually.have.property('err_code', 0);
      });
    });

    describe('#getMonthStats()', function () {
      it('should return day stats', function () {
        return expect(
          device.schedule.getMonthStats(year)
        ).to.eventually.have.property('err_code', 0);
      });
    });

    describe('#eraseStats()', function () {
      it('should return day stats', function () {
        if (testDevice.type !== 'simulated') this.skip();
        return expect(device.schedule.eraseStats()).to.eventually.have.property(
          'err_code',
          0
        );
      });
    });
  });
};
