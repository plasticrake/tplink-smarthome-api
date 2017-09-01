#! /usr/bin/env node

const program = require('commander');

const Hs100Api = require('.');
const Device = require('./lib/device');
const client = new Hs100Api.Client();

let debug = false;

var search = function (sysInfo, timeout) {
  console.log('Searching...');
  client.debug = debug;
  client.startDiscovery(3000, timeout)
    .on('device-new', (plug) => {
      console.log(`${plug.model} ${plug.type} ${plug.host} ${plug.deviceId}`);
      if (sysInfo) {
        console.dir(plug.sysInfo);
      }
    });
};

var send = function (host, port, payload, timeout) {
  console.log('Sending...');
  Device.send({host, port, payload, timeout, debug}).then((data) => {
    console.log('response:');
    console.dir(data);
  }).catch((reason) => {
    console.log('no response: %s', reason);
  });
};

// var sendSpecific = function (host, port, payload, timeout) {
//   console.log('Sending...');
//   client.getSpecificDevice({host: host, port: port}).then((device) => {
//     device.send(payload, timeout).then((data) => {
//       console.log('response:');
//       console.dir(data);
//     }).catch((reason) => {
//       console.log('no response: %s', reason);
//     });
//   }).catch((reason) => {
//     console.log('error: %s', reason);
//   });
// };

var details = function (host, port, timeout) {
  console.log('Getting details...');
  client.getSpecificDevice({host, port, debug}).then((device) => {
    device.getInfo().then((info) => {
      console.dir(info, {colors: program.color === 'on'});
    });
  });
};

program
  .option('-D, --debug', 'turn on debug level logging', () => { debug = true; })
  .option('-c, --color [on]', 'output will be styled with ANSI color codes', 'on');

program
  .command('search')
  .option('-s, --sysinfo', 'output sysInfo')
  .option('-t, --timeout [timeout]', 'timeout (ms)', 5000)
  .action(function (options) {
    search(options.sysinfo, options.timeout);
  });

program
  .command('send <host> <payload>')
  .option('-t, --timeout [timeout]', 'timeout (ms)', 5000)
  .action(function (host, payload, options) {
    var [hostOnly, port] = host.split(':');
    send(hostOnly, port, payload, options.timeout);
  });

program
  .command('details <host>')
  .option('-t, --timeout [timeout]', 'timeout (ms)', 5000)
  .action(function (host, options) {
    var [hostOnly, port] = host.split(':');
    details(hostOnly, port, options.timeout);
  });

program.parse(process.argv);
