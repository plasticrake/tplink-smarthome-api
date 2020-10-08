/* eslint-disable no-unused-expressions */
// spell-checker:ignore MYTESTMAC MYTESTMICMAC MYTESTETHERNETMAC

const sinon = require('sinon');
const {
  config,
  createUnresponsiveDevice,
  expect,
  retry,
  testDevices,
} = require('../setup');

const { Client, ResponseError } = require('../../src');

const cloudTests = require('../shared/cloud');
const emeterTests = require('../shared/emeter');
const netifTests = require('./netif');
const scheduleTests = require('../shared/schedule');
const timeTests = require('../shared/time');

describe('Device', function () {
  this.timeout(config.defaultTestTimeout);
  this.slow(config.defaultTestTimeout / 2);
  this.retries(1);

  testDevices.devices.forEach((testDevice) => {
    config.testSendOptionsSets.forEach((testSendOptions) => {
      context(testSendOptions.name, function () {
        context(testDevice.name, function () {
          const ctx = {};
          let device;
          let time;

          before('device', async function () {
            this.timeout(20000);
            if (!testDevice.getDevice) this.skip();

            await retry(async () => {
              device = await testDevice.getDevice(undefined, testSendOptions);
              await device.getSysInfo();
              ctx.device = device;
              ctx.supportsEmeter = device.supportsEmeter;
              time = device.apiModules.timesetting;
            }, 2);
          });

          beforeEach('device', async function () {
            // before() doesn't skip nested describes
            if (!testDevice.getDevice) this.skip();
          });

          afterEach('device', async function () {
            if (!testDevice.getDevice) this.skip();

            if (device !== undefined) device.closeConnection();
          });

          describe('constructor', function () {
            it('should inherit defaultSendOptions from Client', function () {
              const timeout = 9999;
              const transport = 'udp';
              const clientTest = new Client({
                defaultSendOptions: { timeout, transport },
              });

              const anotherDevice = clientTest.getDeviceFromSysInfo(
                device.sysInfo
              );

              expect(clientTest.defaultSendOptions.timeout, 'client').to.equal(
                timeout
              );
              expect(
                clientTest.defaultSendOptions.transport,
                'client'
              ).to.equal(transport);
              expect(
                anotherDevice.defaultSendOptions.timeout,
                'device'
              ).to.equal(timeout);
              expect(
                anotherDevice.defaultSendOptions.transport,
                'device'
              ).to.equal(transport);
            });

            it('should inherit logger from Client', function () {
              const logger = {
                debug: () => {},
              };

              const clientTest = new Client({ logger });

              const anotherDevice = clientTest.getDeviceFromSysInfo(
                device.sysInfo
              );

              expect(clientTest.log.debug, 'client').to.equal(
                anotherDevice.log.debug
              );
            });
          });

          describe('#send', function () {
            it('should send a single valid command and receive response', async function () {
              const response = JSON.parse(
                await device.send('{"system":{"get_sysinfo":{}}}')
              );
              expect(response).to.have.nested.property(
                'system.get_sysinfo.err_code',
                0
              );
            });
            it('should send multiple valid commands (same module) and receive response', async function () {
              const response = JSON.parse(
                await device.send(
                  `{"${time}":{"get_time":{},"get_timezone":{}}}`
                )
              );
              expect(response[time].get_time.err_code).to.eql(0);
              expect(response[time].get_timezone.err_code).to.eql(0);
            });
            it('should send multiple valid commands (diff modules) and receive response', async function () {
              const response = JSON.parse(
                await device.send(
                  `{"system":{"get_sysinfo":{}},"${time}":{"get_time":{}}}`
                )
              );
              expect(response).to.have.nested.property(
                'system.get_sysinfo.err_code',
                0
              );
              expect(response[time].get_time.err_code).to.eql(0);
            });
            it('should send a single invalid command (member) and receive response', async function () {
              const response = JSON.parse(
                await device.send('{"system":{"INVALID_MEMBER":{}}}')
              );
              expect(response.system.INVALID_MEMBER.err_code).to.be.oneOf([
                -2,
                -2000,
              ]);
            });
            it('should send a single invalid command (module) and receive response', async function () {
              const response = JSON.parse(
                await device.send('{"INVALID_MODULE":{"INVALID_MEMBER":{}}}')
              );
              expect(response).to.have.nested.property(
                'INVALID_MODULE.err_code'
              );
              expect(response.INVALID_MODULE.err_code).to.be.oneOf([-1, -2001]);
            });
            it('should send multiple invalid commands and receive response', async function () {
              const response = JSON.parse(
                await device.send(
                  '{"system":{"INVALID_MEMBER":{}},"INVALID_MODULE":{"INVALID_MEMBER":{}}}'
                )
              );
              expect(response.INVALID_MODULE.err_code).to.be.oneOf([-1, -2001]);
              expect(response.system.INVALID_MEMBER.err_code).to.be.oneOf([
                -2,
                -2000,
              ]);
            });

            it('should reject with an unreachable host', async function () {
              const unreachableDevice = await testDevice.getDevice();
              unreachableDevice.host =
                testDevices.unreachable.deviceOptions.host;

              expect(
                unreachableDevice.send('{"system":{"get_sysinfo":{}}}')
              ).to.be.eventually.rejected;
            });

            describe('unresponsive', function () {
              let unresponsive;
              let unresponsiveDevice;
              beforeEach(async function () {
                unresponsive = await createUnresponsiveDevice(
                  testSendOptions.transport
                );
                unresponsiveDevice = await testDevice.getDevice();
                unresponsiveDevice.host = unresponsive.host;
                unresponsiveDevice.port = unresponsive.port;
              });
              afterEach(function () {
                unresponsive.close();
              });

              it("should reject with a host that doesn't respond", async function () {
                this.timeout(5000);
                expect(
                  unresponsiveDevice.send('{"system":{"get_sysinfo":{}}}', {
                    timeout: 4000,
                  })
                ).to.be.eventually.rejected;
              });
            });
          });

          describe('#sendCommand', function () {
            it('should send a single valid command and receive response', async function () {
              const response = await device.sendCommand(
                '{"system":{"get_sysinfo":{}}}'
              );
              return expect(response).to.have.property('err_code', 0);
            });
            it('should send multiple valid commands (same module) and receive response', async function () {
              const response = await device.sendCommand(
                `{"${time}":{"get_time":{},"get_timezone":{}}}`
              );

              expect(response[time].get_time.err_code).to.eql(0);
              expect(response[time].get_timezone.err_code).to.eql(0);
            });
            it('should send multiple valid commands (diff modules) and receive response', async function () {
              const response = await device.sendCommand(
                `{"system":{"get_sysinfo":{}},"${time}":{"get_time":{}}}`
              );
              expect(response).to.have.nested.property(
                'system.get_sysinfo.err_code',
                0
              );
              expect(response[time].get_time.err_code).to.eql(0);
            });
            it('should send a single invalid command (member) and reject with ResponseError', function () {
              return device
                .sendCommand('{"system":{"INVALID_MEMBER":{}}}')
                .catch((err) => {
                  expect(err).to.be.instanceof(ResponseError);
                  expect(JSON.parse(err.response)).to.have.nested.property(
                    'err_code'
                  );
                  expect(JSON.parse(err.response).err_code).to.be.oneOf([
                    -2,
                    -2000,
                  ]);
                });
            });
            it('should send a single invalid command (module) and reject with ResponseError', function () {
              return device
                .sendCommand('{"INVALID_MODULE":{"INVALID_MEMBER":{}}}')
                .catch((err) => {
                  expect(err).to.be.instanceof(ResponseError);
                  expect(JSON.parse(err.response)).to.have.nested.property(
                    'err_code'
                  );
                  expect(JSON.parse(err.response).err_code).to.be.oneOf([
                    -1,
                    -2001,
                  ]);
                });
            });
            it('should send multiple invalid commands and reject with ResponseError', function () {
              return device
                .sendCommand(
                  '{"system":{"INVALID_MEMBER":{}},"INVALID_MODULE":{"INVALID_MEMBER":{}}}'
                )
                .catch((err) => {
                  expect(err).to.be.an.instanceof(ResponseError);
                  expect(
                    JSON.parse(err.response).INVALID_MODULE.err_code
                  ).to.be.oneOf([-1, -2001]);
                  expect(
                    JSON.parse(err.response).system.INVALID_MEMBER.err_code
                  ).to.be.oneOf([-2, -2000]);
                });
            });
            it('should send multiple commands to a single device at once', async function () {
              const promises = [];
              for (let i = 0; i < 20; i += 1) {
                promises.push(
                  device.sendCommand('{"system":{"get_sysinfo":{}}}')
                );
              }

              const responses = await Promise.all(promises);

              for (let i = 0; i < 20; i += 1) {
                expect(responses[i]).to.have.property('err_code', 0);
              }
            });
            it('should reject with an unreachable host', async function () {
              const unreachableDevice = await testDevice.getDevice();
              unreachableDevice.host =
                testDevices.unreachable.deviceOptions.host;

              expect(
                unreachableDevice.sendCommand('{"system":{"get_sysinfo":{}}}')
              ).to.be.eventually.rejected;
            });
          });

          describe('#sysInfo get', function () {
            it('should return sysInfo after getSysInfo called', async function () {
              const si = await device.getSysInfo();
              expect(device.sysInfo).to.eql(si);
            });
          });

          describe('#alias get', function () {
            it('should return alias from cached sysInfo', function () {
              if (device.childId) {
                const child = device.sysInfo.children.find(
                  (c) => c.id === device.childId
                );
                expect(device.alias).to.eql(child.alias);
                child.alias = 'My Test Alias';
                expect(device.alias).to.eql(child.alias);
              } else {
                expect(device.alias).to.eql(device.sysInfo.alias);
                device.sysInfo.alias = 'My Test Alias';
                expect(device.alias).to.eql(device.sysInfo.alias);
              }
            });
          });

          describe('#deviceId get', function () {
            it('should return deviceId from cached sysInfo', function () {
              expect(device.deviceId).to.eql(device.sysInfo.deviceId);
              device.sysInfo.deviceId = 'My Test deviceId';
              expect(device.deviceId).to.eql(device.sysInfo.deviceId);
            });
          });

          describe('#description get', function () {
            it('should return description from cached sysInfo', function () {
              expect(device.description).to.eql(
                device.sysInfo.description || device.sysInfo.dev_name
              );
            });
          });

          describe('#model get', function () {
            it('should return model from cached sysInfo', function () {
              expect(device.model).to.eql(device.sysInfo.model);
              device.sysInfo.model = 'My Test model';
              expect(device.model).to.eql(device.sysInfo.model);
            });
          });

          describe('#type get', function () {
            it('should return type from cached sysInfo', function () {
              expect(device.type).to.eql(
                device.sysInfo.type || device.sysInfo.mic_type
              );
              device.sysInfo.type = 'My Test type';
              delete device.sysInfo.mic_type;
              expect(device.type).to.eql(device.sysInfo.type);
              delete device.sysInfo.type;
              device.sysInfo.mic_type = 'My Test mic_type';
              expect(device.type).to.eql(device.sysInfo.mic_type);
            });
          });

          describe('#deviceType get', function () {
            it('should return deviceType', async function () {
              expect(device.deviceType).to.eql(testDevice.deviceType);
            });
          });

          describe('#softwareVersion get', function () {
            it('should return softwareVersion from cached sysInfo', function () {
              expect(device.softwareVersion).to.eql(device.sysInfo.sw_ver);
              device.sysInfo.sw_ver = 'My Test sw_ver';
              expect(device.softwareVersion).to.eql(device.sysInfo.sw_ver);
            });
          });

          describe('#hardwareVersion get', function () {
            it('should return hardwareVersion from cached sysInfo', function () {
              expect(device.hardwareVersion).to.eql(device.sysInfo.hw_ver);
              device.sysInfo.hw_ver = 'My Test hw_ver';
              expect(device.hardwareVersion).to.eql(device.sysInfo.hw_ver);
            });
          });

          describe('#mac get', function () {
            it('should return mac from cached sysInfo', function () {
              expect(device.mac).to.eql(
                device.sysInfo.mac ||
                  device.sysInfo.mic_mac ||
                  device.sysInfo.ethernet_mac
              );
              device.sysInfo.mac = 'My Test mac';
              device.sysInfo.mic_mac = undefined;
              device.sysInfo.ethernet_mac = undefined;
              expect(device.mac).to.eql(device.sysInfo.mac);
              device.sysInfo.mac = undefined;
              device.sysInfo.mic_mac = 'My Test mic_mac';
              device.sysInfo.ethernet_mac = undefined;
              expect(device.mac).to.eql(device.sysInfo.mic_mac);
              device.sysInfo.mac = undefined;
              device.sysInfo.mic_mac = undefined;
              device.sysInfo.ethernet_mac = 'My Test ethernet_mac';
              expect(device.mac).to.eql(device.sysInfo.ethernet_mac);
            });
          });

          describe('#macNormalized get', function () {
            it('should return normalized mac from cached sysInfo', function () {
              device.sysInfo.mac = 'My Test mac';
              device.sysInfo.mic_mac = undefined;
              device.sysInfo.ethernet_mac = undefined;
              expect(device.macNormalized).to.eql('MYTESTMAC');
              device.sysInfo.mac = undefined;
              device.sysInfo.mic_mac = 'My Test mic_mac';
              device.sysInfo.ethernet_mac = undefined;
              expect(device.macNormalized).to.eql('MYTESTMICMAC');
              device.sysInfo.mac = undefined;
              device.sysInfo.mic_mac = undefined;
              device.sysInfo.ethernet_mac = 'My Test ethernet_mac';
              expect(device.macNormalized).to.eql('MYTESTETHERNETMAC');
            });
          });

          describe('#getSysInfo()', function () {
            it('should return info', function () {
              return expect(device.getSysInfo()).to.eventually.have.property(
                'err_code',
                0
              );
            });
          });

          describe('#setAlias()', function () {
            let origAlias;
            before('setAlias', async function () {
              if (!testDevice.getDevice) return;
              await device.getSysInfo();
              origAlias = device.alias;
            });
            after(async function () {
              if (!testDevice.getDevice) return;
              expect(await device.setAlias(origAlias)).to.be.true;
              await device.getSysInfo();
              expect(device.alias).to.equal(origAlias);
            });

            it('should change the alias', async function () {
              const testAlias = `Testing ${Math.floor(
                Math.random() * (100 + 1)
              )}`;
              expect(await device.setAlias(testAlias)).to.be.true;
              await device.getSysInfo();
              expect(device.alias).to.equal(testAlias);
            });
          });

          describe('#setLocation()', function () {
            it('should return model', function () {
              return expect(
                device.setLocation(10, 10)
              ).to.eventually.have.property('err_code', 0);
            });
          });

          describe('#getModel()', function () {
            it('should return model', function () {
              return expect(device.getModel()).to.eventually.match(
                /^HS\d\d\d|^LB\d\d\d/
              );
            });
          });

          describe('#reboot()', function () {
            it('(simulator only) should reboot', function () {
              if (!testDevice.isSimulated) this.skip();
              return expect(device.reboot(1)).to.eventually.have.property(
                'err_code',
                0
              );
            });
          });

          describe('#reset()', function () {
            it('(simulator only) should reset', function () {
              if (!testDevice.isSimulated) this.skip();
              return expect(device.reset(1)).to.eventually.have.property(
                'err_code',
                0
              );
            });
          });

          describe('#startPolling()', function () {
            let badDevice;
            afterEach(function () {
              device.stopPolling();
              if (badDevice) badDevice.stopPolling();
            });

            it('should poll device', async function () {
              const spy = sinon.spy();
              await new Promise((resolve) => {
                device.once('power-update', () => {
                  spy();
                  resolve();
                });
                device.once('in-use-update', () => {
                  spy();
                  resolve();
                });
                device.once('lightstate-update', () => {
                  spy();
                  resolve();
                });
                device.once('emeter-realtime-update', () => {
                  spy();
                  resolve();
                });
                device.startPolling(50);
              });
              expect(spy).to.be.called;
            });

            it('should fail to poll unreachable device', async function () {
              this.timeout(500);
              badDevice = await testDevice.getDevice(
                {
                  host: testDevices.unreachable.deviceOptions.host,
                  sysInfo: device.sysInfo,
                },
                testSendOptions
              );

              const spy = sinon.spy();

              await new Promise((resolve) => {
                badDevice.once('power-update', () => {
                  spy();
                  resolve();
                });
                badDevice.once('in-use-update', () => {
                  spy();
                  resolve();
                });
                badDevice.once('lightstate-update', () => {
                  spy();
                  resolve();
                });
                badDevice.once('emeter-realtime-update', () => {
                  spy();
                  resolve();
                });
                badDevice.startPolling(600);
                setTimeout(resolve, 400);
              });

              expect(spy).to.not.be.called;
            });

            it('should throw error for unreachable device', async function () {
              badDevice = await testDevice.getDevice(
                undefined,
                testSendOptions
              );
              badDevice.host = testDevices.unreachable.deviceOptions.host;

              const spy = sinon.spy();
              await new Promise((resolve) => {
                badDevice.once('polling-error', () => {
                  spy();
                  resolve();
                });
                badDevice.startPolling(200);
              });

              expect(spy).to.be.called;
            });

            it('should throw error for unreachable device', async function () {
              badDevice = await testDevice.getDevice(
                undefined,
                testSendOptions
              );
              badDevice.host = testDevices.unreachable.deviceOptions.host;

              const spy = sinon.spy();
              await new Promise((resolve) => {
                badDevice.once('polling-error', () => {
                  spy();
                  resolve();
                });
                badDevice.startPolling(200);
              });

              expect(spy).to.be.called;
            });
          });

          cloudTests(ctx, testDevice);
          emeterTests(ctx, testDevice);
          netifTests(ctx, testDevice);
          scheduleTests(ctx, testDevice);
          timeTests(ctx, testDevice);
        });
      });
    });
  });
});
