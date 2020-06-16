/* eslint-disable no-console */
import groupBy from 'lodash.groupby';

import { Client } from '../../src';
import type { AnyDevice } from '../../src/client';

import type { TestDevice } from './test-device';
import { testDeviceDecorator } from './test-device';
import {
  getSimulatedDevices,
  cleanUpSimulatedDevices,
  startUdpServer,
  stopUdpServer,
  getSimulatedUnreliableDevice,
} from './simulated-devices';
import getDiscoveryDevices from './discovery-devices';
import * as config from './config';

const clientOptions: ConstructorParameters<typeof Client>[0] = {
  logLevel: config.testClientLogLevel,
};

const clientDefaultOptions = ((): ConstructorParameters<typeof Client>[0] => {
  if (config.useSimulator) {
    // set low timeout for simulator
    return {
      defaultSendOptions: { timeout: 100 },
      ...clientOptions,
    };
  }
  return clientOptions;
})();

export function getTestClient(
  options: ConstructorParameters<typeof Client>[0] = {}
): Client {
  return new Client({ ...clientDefaultOptions, ...options });
}

type TestDevices = {
  devices: TestDevice[];
  anyDevice: TestDevice;
  anyBulb: TestDevice;
  anyPlug: TestDevice;
  plugWithChildren: TestDevice;
  unreachable: TestDevice;
  unreliable: TestDevice;
  bulb: TestDevice[] | undefined;
  plug: TestDevice[] | undefined;
};

/**
 * This must be initialized before the async code in order for Mocha to use
 * this when dynamically creating tests. Later, the simulated or discovered
 * devices are added to this original object.
 */

const testDevicesPartial: Partial<TestDevices> = {
  devices: [
    {
      model: 'hs100',
      deviceType: 'plug',
      name: 'HS100(plug)',
      isSimulated: config.useSimulator,
    },
    {
      model: 'hs105',
      deviceType: 'plug',
      name: 'HS105(plug)',
      isSimulated: config.useSimulator,
    },
    {
      model: 'hs110',
      deviceType: 'plug',
      name: 'HS110v1(plug)',
      hardwareVersion: '1.0',
      isSimulated: config.useSimulator,
    },
    {
      model: 'hs110',
      deviceType: 'plug',
      name: 'HS110v2(plug)',
      hardwareVersion: '2.0',
      isSimulated: config.useSimulator,
    },
    {
      model: 'hs200',
      deviceType: 'plug',
      name: 'HS200(plug)',
      isSimulated: config.useSimulator,
    },
    {
      model: 'hs220',
      deviceType: 'plug',
      name: 'HS220(plug)',
      isSimulated: config.useSimulator,
    },
    {
      model: 'hs300',
      deviceType: 'plug',
      name: 'HS300(plug)',
      isSimulated: config.useSimulator,
    },
    {
      model: 'lb100',
      deviceType: 'bulb',
      name: 'LB100(bulb)',
      isSimulated: config.useSimulator,
    },
    {
      model: 'lb120',
      deviceType: 'bulb',
      name: 'LB120(bulb)',
      isSimulated: config.useSimulator,
    },
    {
      model: 'lb130',
      deviceType: 'bulb',
      name: 'LB130(bulb)',
      isSimulated: config.useSimulator,
    },
  ],
  anyDevice: {
    name: 'Device',
    model: 'unknown',
    isSimulated: config.useSimulator,
  },
  anyBulb: {
    name: 'Bulb',
    model: 'unknown',
    isSimulated: config.useSimulator,
  },
  anyPlug: {
    name: 'Plug',
    model: 'unknown',
    isSimulated: config.useSimulator,
  },
  plugWithChildren: {
    name: 'Plug with Children',
    model: 'unknown',
    isSimulated: config.useSimulator,
  },
  unreliable: {
    name: 'Unreliable Device',
    model: 'hs100',
    deviceType: 'plug',
    isSimulated: true,
  },
  unreachable: {
    name: 'Unreachable Device',
    model: 'hs100',
    deviceType: 'plug',
    isSimulated: true,
    deviceOptions: {
      host: '192.0.2.0',
      port: 9999,
      defaultSendOptions: { timeout: 100 },
    },
  },
};

Object.entries(groupBy(testDevicesPartial.devices, 'deviceType')).forEach(
  ([key, value]) => {
    testDevicesPartial[key] = value;
  }
);

export const testDevices = testDevicesPartial as TestDevices;

async function getDevices(): Promise<AnyDevice[]> {
  if (config.useSimulator) {
    return getSimulatedDevices(getTestClient());
  }
  return getDiscoveryDevices(
    getTestClient(),
    config.discoveryTimeout,
    config.discoveryMacAllow
  );
}

export async function testDeviceCleanup(): Promise<void> {
  await cleanUpSimulatedDevices();
  stopUdpServer();
}

(async (): Promise<void> => {
  console.log('Test Client');
  console.log('===========');
  console.log('clientDefaultOptions: %O', clientDefaultOptions);
  console.log('');

  try {
    await startUdpServer();
  } catch (err) {
    console.error('Could not start UdpServer');
    throw err;
  }

  let devices: AnyDevice[];

  try {
    devices = await getDevices();
  } catch (err) {
    console.error('Could not get Test Devices');
    throw err;
  }

  testDevices.devices.forEach((testDevice) => {
    const device = devices.find((dev) => {
      if (dev.model.substr(0, 5).toLowerCase() !== testDevice.model)
        return false;
      if (
        testDevice.hardwareVersion != null &&
        testDevice.hardwareVersion !== dev.hardwareVersion
      )
        return false;
      return true;
    });

    if (device) {
      testDeviceDecorator(testDevice, device, device.client);

      testDevices.devices.push(testDevice);

      if (!('getDevice' in testDevices.anyDevice)) {
        testDeviceDecorator(testDevices.anyDevice, device, device.client);
      }
      if (
        !('getDevice' in testDevices.anyPlug) &&
        device.deviceType === 'plug'
      ) {
        testDeviceDecorator(testDevices.anyPlug, device, device.client);
      }
      if (
        !('getDevice' in testDevices.plugWithChildren) &&
        device.deviceType === 'plug' &&
        device.children &&
        device.children.size > 0
      ) {
        testDeviceDecorator(
          testDevices.plugWithChildren,
          device,
          device.client
        );
      }
      if (
        !('getDevice' in testDevices.anyBulb) &&
        device.deviceType === 'bulb'
      ) {
        testDeviceDecorator(testDevices.anyBulb, device, device.client);
      }
    }
  });

  if ('unreliable' in testDevices) {
    const device = await getSimulatedUnreliableDevice(getTestClient());
    testDeviceDecorator(testDevices.unreliable, device, device.client);
  }

  function testDeviceOut(
    td: TestDevice,
    description: string
  ): {
    description: string;
    model?: string;
    deviceType?: string;
    name?: string;
    host?: string;
    port?: number;
    simulated?: string;
  } {
    if (td === undefined) {
      return { description };
    }

    const deviceOptions = td.deviceOptions || {
      host: undefined,
      port: undefined,
    };

    return {
      description,
      model: td.model,

      name: td.name,
      host: deviceOptions.host,
      port: deviceOptions.port,
      simulated: td.isSimulated ? 'simulated' : 'real',
    };
  }

  console.log('Test Devices');
  console.log('============');

  console.table(
    Object.entries(testDevices)
      .reduce((acc, [key, val]) => {
        if (Array.isArray(val)) {
          val.map((v) => [`${key}[]`, v]).forEach((a) => acc.push(a));
        } else {
          acc.push([key, val]);
        }
        return acc;
      }, [])
      .map(([key, td]) => testDeviceOut(td, key))
  );

  run();
})();
