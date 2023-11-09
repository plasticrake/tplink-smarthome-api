#!/usr/bin/env node
/* eslint-disable no-console */

import { Command } from '@commander-js/extra-typings';
import castArray from 'lodash.castarray';
import type { LogLevelDesc } from 'loglevel';
import * as tplinkCrypto from 'tplink-smarthome-crypto';
import type { PickProperties } from 'ts-essentials';
import util from 'util';

import { type AnyDevice, type SendOptions } from './client';
import { Client, ResponseError } from './index';

let logLevel: LogLevelDesc;

function toInt(s: string): number {
  return parseInt(s, 10);
}

const program = new Command()
  .option('-D, --debug', 'turn on debug level logging', () => {
    logLevel = 'debug';
  })
  .option('-t, --timeout <ms>', 'timeout (ms)', toInt, 10000)
  .option('-u, --udp', 'send via UDP')
  .option(
    '-c, --color [on]',
    'output will be styled with ANSI color codes',
    'on',
  );

function outputError(err: unknown): void {
  if (err instanceof ResponseError) {
    console.log('Response Error:');
    console.log(err.response);
  } else {
    console.error('Error:');
    console.error(err);
  }
}

function getClient(): Client {
  const defaultSendOptions: SendOptions = {};
  const options = program.opts();
  if (options.udp) defaultSendOptions.transport = 'udp';
  if (options.timeout) defaultSendOptions.timeout = options.timeout;
  return new Client({ logLevel, defaultSendOptions });
}

function search(
  sysInfo: boolean,
  breakoutChildren: boolean,
  discoveryTimeout: number,
  broadcast: string,
  params: Parameters<Client['startDiscovery']>[0],
): void {
  try {
    console.log('Searching...');

    const commandParams = {
      discoveryInterval: 2000,
      discoveryTimeout,
      breakoutChildren,
      broadcast,
      ...params,
    };
    console.log(`startDiscovery(${util.inspect(commandParams)})`);
    getClient()
      .startDiscovery(commandParams)
      .on('device-new', (device: AnyDevice) => {
        console.log(
          `${device.model} ${device.deviceType} ${device.type} ${device.host} ${device.port} ${device.macNormalized} ${device.deviceId} ${device.alias}`,
        );
        if (sysInfo) {
          console.dir(device.sysInfo, {
            colors: program.opts().color === 'on',
            depth: 10,
          });
        }
      });
  } catch (err) {
    outputError(err);
  }
}

async function send(
  host: string,
  port: number | undefined,
  payload: string,
): Promise<void> {
  try {
    const client = getClient();
    console.log(
      `Sending to ${host}:${port || ''} via ${
        client.defaultSendOptions.transport
      }...`,
    );
    const data = await client.send(payload, host, port);
    console.log('response:');
    console.dir(data, { colors: program.opts().color === 'on', depth: 10 });
  } catch (err) {
    outputError(err);
  }
}

async function sendCommand(
  host: string,
  port: number | undefined,
  childId: string | undefined,
  payload: string,
): Promise<void> {
  try {
    const client = getClient();
    console.log(
      `Sending to ${host}:${port || ''} ${
        childId ? `childId: ${childId}` : ''
      } via ${client.defaultSendOptions.transport}...`,
    );
    const device = await client.getDevice({
      host,
      port,
      childId,
    });
    const results = await device.sendCommand(payload);
    console.log('response:');
    console.dir(results, { colors: program.opts().color === 'on', depth: 10 });
  } catch (err) {
    outputError(err);
  }
}

async function sendCommandDynamic(
  host: string,
  port: number | undefined,
  // eslint-disable-next-line @typescript-eslint/ban-types
  command: Exclude<keyof PickProperties<AnyDevice, Function>, undefined>,
  commandParams: Array<boolean | number | string> = [],
  sendOptions?: SendOptions,
  childId?: string,
): Promise<void> {
  try {
    const client = getClient();
    console.log(
      `Sending ${command} command to ${host}:${port || ''} ${
        childId ? `childId: ${childId}` : ''
      } via ${
        sendOptions && sendOptions.transport
          ? sendOptions.transport
          : client.defaultSendOptions.transport
      }...`,
    );
    const device = await client.getDevice({ host, port, childId });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const func = device[command] as (...args: any) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const results = await func.apply(device, [
      ...commandParams,
      { ...sendOptions },
    ]);

    console.log('response:');
    console.dir(results, { colors: program.opts().color === 'on', depth: 10 });
  } catch (err) {
    outputError(err);
  }
}

async function details(host: string, port: number | undefined): Promise<void> {
  try {
    console.log(`Getting details from ${host}:${port || ''}...`);
    const device = await getClient().getDevice({ host, port });
    console.dir(
      {
        alias: device.alias,
        deviceId: device.deviceId,
        description: device.description,
        model: device.model,
        deviceType: device.deviceType,
        type: device.type,
        softwareVersion: device.softwareVersion,
        hardwareVersion: device.hardwareVersion,
        mac: device.mac,
      },
      { colors: program.opts().color === 'on', depth: 10 },
    );
  } catch (err) {
    outputError(err);
  }
}

function blink(
  host: string,
  port: number | undefined,
  times: number,
  rate: number,
): Promise<unknown> {
  console.log(`Sending blink commands to ${host}:${port ?? ''}...`);
  return getClient()
    .getDevice({ host, port })
    .then((device) => {
      return device.blink(times, rate).then(() => {
        console.log('Blinking complete');
      });
    })
    .catch((reason) => {
      outputError(reason);
    });
}

function getScanInfo(
  host: string,
  port: number | undefined,
  refresh?: boolean,
  timeoutInSeconds?: number,
) {
  console.log(`Sending getScanInfo command to ${host}:${port || ''}...`);
  getClient()
    .getDevice({ host, port })
    .then((device) => {
      return device.netif
        .getScanInfo(refresh, timeoutInSeconds)
        .then((value) => {
          console.dir(value);
        });
    })
    .catch((reason) => {
      outputError(reason);
    });
}

function toBoolean(s: string): boolean {
  return s === 'true' || s === '1';
}

function setParamTypes(
  params: string[] | undefined,
  commandSetup: CommandSetup,
): Array<boolean | number | string> | undefined {
  if (
    params &&
    params.length > 0 &&
    commandSetup.params &&
    commandSetup.params.length > 0
  ) {
    const sParams = commandSetup.params;
    return castArray(params).map((el, i) => {
      switch (sParams[i]?.type) {
        case 'number':
          return +el;
        case 'boolean':
          return toBoolean(el);
        default:
          return el;
      }
    });
  }
  return params;
}

program
  .command('search [params]')
  .description('Search for devices')
  .option('--broadcast <address>', 'broadcast address', '255.255.255.255')
  .option('-s, --sysinfo', 'output sysInfo', false)
  .option(
    '-b, --breakout-children',
    'output children (multi-outlet plugs)',
    false,
  )
  .action((params, options) => {
    let paramsObj;
    if (params) {
      console.dir(params);
      paramsObj = JSON.parse(params) as Parameters<Client['startDiscovery']>[0];
    }
    search(
      options.sysinfo,
      options.breakoutChildren,
      program.opts().timeout,
      options.broadcast,
      paramsObj,
    );
  });

function parseHost(hostString: string): [string, number | undefined] {
  const [hostOnly, port] = hostString.split(':');
  if (hostOnly == null || hostOnly.length === 0)
    throw new Error('host is required');
  if (port != null && port.length > 0) {
    return [hostOnly, toInt(port)];
  }
  return [hostOnly, undefined];
}

program
  .command('send <host> <payload>')
  .description('Send payload to device (using Client.send)')
  .action((host, payload) => {
    const [hostOnly, port] = parseHost(host);
    send(hostOnly, port, payload).catch((err) => {
      outputError(err);
    });
  });

program
  .command('sendCommand <host> <payload>')
  .description('Send payload to device (using Device#sendCommand)')
  .option('--childId <childId>', 'childId')
  .action((host, payload, options) => {
    const [hostOnly, port] = parseHost(host);
    sendCommand(hostOnly, port, options.childId, payload).catch((err) => {
      outputError(err);
    });
  });

program.command('details <host>').action((host) => {
  const [hostOnly, port] = parseHost(host);
  details(hostOnly, port).catch((err) => {
    outputError(err);
  });
});

program
  .command('blink')
  .argument('<host>')
  .argument('[times]', '', toInt)
  .argument('[rate]', '', toInt)
  .action((host, times = 5, rate = 500) => {
    const [hostOnly, port] = parseHost(host);
    blink(hostOnly, port, times, rate).catch((err) => {
      outputError(err);
    });
  });

program
  .command('getScanInfo')
  .argument('<host>')
  .argument('[refresh]', '', toBoolean)
  .argument('[timeoutInSeconds]', '', toInt)
  .action((host, refresh = true, timeoutInSeconds = 5) => {
    const [hostOnly, port] = parseHost(host);
    getScanInfo(hostOnly, port, refresh, timeoutInSeconds);
  });

type CommandSetup = {
  name: Parameters<typeof sendCommandDynamic>[2];
  params?: {
    name: string;
    type: 'boolean' | 'number' | 'string';
    optional?: boolean;
  }[];
  supportsChildId?: boolean;
  action?: (device: AnyDevice, ...args: unknown[]) => Promise<unknown>;
};

const commandSetup: CommandSetup[] = [
  { name: 'getSysInfo', supportsChildId: true },
  { name: 'getInfo', supportsChildId: true },
  {
    name: 'setAlias',
    params: [{ name: 'alias', type: 'string' }],
    supportsChildId: true,
  },
  { name: 'getModel', supportsChildId: true },
  {
    name: 'setPowerState',
    params: [{ name: 'state', type: 'boolean' }],
    supportsChildId: true,
  },
  {
    name: 'setLocation',
    params: [
      { name: 'latitude', type: 'number' },
      { name: 'longitude', type: 'number' },
    ],
  },
  { name: 'reboot', params: [{ name: 'delay', type: 'number' }] },
  { name: 'reset', params: [{ name: 'delay', type: 'number' }] },
];

for (const command of commandSetup) {
  const paramsString = command.params
    ? command.params
        .map((p) => (p.optional ? `[${p.name}]` : `<${p.name}>`))
        .join(' ')
    : '';

  const cmd = program
    .command(`${command.name} <host>${paramsString ? ` ${paramsString}` : ''}`)
    .description(
      `Send ${command.name} to device (using Device#${command.name})`,
    )
    .option('-t, --timeout <timeout>', 'timeout (ms)', toInt, 10000);
  if (command.supportsChildId) {
    cmd.option('-c, --childId <childId>', 'childId');
  }

  cmd.action(function action(this: Command) {
    const [host, ...params] = this.args;
    const [hostOnly, port] = parseHost(host as string);
    const options = this.opts() as { timeout?: number; childId?: string };

    const commandParams = setParamTypes(params, command);

    // // @ts-expect-error: childId is added conditionally and is optional
    const childId = options.childId || undefined;

    let sendOptions;
    if (options.timeout != null) {
      sendOptions = { timeout: options.timeout };
    }

    sendCommandDynamic(
      hostOnly,
      port,
      command.name,
      commandParams,
      sendOptions,
      childId,
    ).catch((err) => {
      outputError(err);
    });
  });
}

program
  .command('encrypt')
  .argument('<outputEncoding>')
  .argument('<input>')
  .argument('[firstKey=0xAB]', '', toInt)
  .action((outputEncoding, input, firstKey = 0xab) => {
    const outputBuf = tplinkCrypto.encrypt(input, firstKey);
    console.log(outputBuf.toString(outputEncoding as BufferEncoding));
  });

program
  .command('encryptWithHeader')
  .argument('<outputEncoding>')
  .argument('<input>')
  .argument('[firstKey=0xAB]', '', toInt)
  .action((outputEncoding, input, firstKey = 0xab) => {
    const outputBuf = tplinkCrypto.encryptWithHeader(input, firstKey);
    console.log(outputBuf.toString(outputEncoding as BufferEncoding));
  });

program
  .command('decrypt')
  .argument('<inputEncoding>')
  .argument('<input>')
  .argument('[firstKey=0xAB]', '', toInt)
  .action((inputEncoding, input, firstKey = 0xab) => {
    const inputBuf = Buffer.from(input, inputEncoding as BufferEncoding);
    const outputBuf = tplinkCrypto.decrypt(inputBuf, firstKey);
    console.log(outputBuf.toString());
  });

program
  .command('decryptWithHeader')
  .argument('<inputEncoding>')
  .argument('<input>')
  .argument('[firstKey=0xAB]', '', toInt)
  .action((inputEncoding, input, firstKey = 0xab) => {
    const inputBuf = Buffer.from(input, inputEncoding as BufferEncoding);
    const outputBuf = tplinkCrypto.decryptWithHeader(inputBuf, firstKey);
    console.log(outputBuf.toString());
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
