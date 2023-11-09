/* eslint-disable no-param-reassign */
import type { MarkOptional, MarkRequired } from 'ts-essentials';
import type { Client, Plug } from '../../src';
import type { AnyDevice } from '../../src/client';
import { isObjectLike } from '../../src/utils';

export type TestDevice = {
  name: string;
  model: string;
  hardwareVersion?: string;
  isSimulated: boolean;
  deviceOptions?: Parameters<Client['getDevice']>[0];
  deviceType?: 'bulb' | 'plug';
  mac?: string;
  getDevice: (
    deviceOptions?: Parameters<Client['getDevice']>[0],
    sendOptions?: Parameters<Client['getDevice']>[1],
  ) => ReturnType<Client['getDevice']>;
  parent?: TestDevice;
  children?: MarkRequired<TestDevice, 'getDevice' | 'childId' | 'parent'>[];
  childId?: string;
  getOtherChildren?: () => MarkRequired<
    TestDevice,
    'getDevice' | 'childId' | 'parent'
  >[];
  getOtherChildrenState?: () => Promise<
    Array<{
      childId: string;
      relayState: boolean;
      alias: string;
    }>
  >;
  supports?: { netif: boolean; schedule: boolean };
};

export function likeTestDevice(candidate: unknown): candidate is TestDevice {
  return (
    isObjectLike(candidate) &&
    'name' in candidate &&
    'model' in candidate &&
    'isSimulated' in candidate
  );
}

const testDevices: TestDevice[] = [];

export function createTestDevice(
  device: AnyDevice,
  client: Client,
  {
    name,
    model,
    isSimulated,
    hardwareVersion,
    parent,
    childId,
  }: {
    name: string;
    model: string;
    isSimulated: boolean;
    hardwareVersion?: string;
    parent: TestDevice;
    childId: string;
  },
): TestDevice {
  const testDevice: MarkOptional<TestDevice, 'getDevice'> = {
    name,
    model,
    hardwareVersion,
    isSimulated,
    parent,
    childId,
  };

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return testDeviceDecorator(testDevice, device, client, { parent, childId });
}

export function testDeviceDecorator(
  testDevice: MarkOptional<TestDevice, 'getDevice'>,
  device: AnyDevice,
  client: Client,
  {
    parent,
    childId,
  }: {
    parent?: TestDevice;
    childId?: string;
  } = {},
): TestDevice {
  testDevice.parent = parent;
  testDevice.childId = childId;

  testDevice.deviceType = device.deviceType;
  testDevice.mac = device.mac;
  testDevice.deviceOptions = {
    host: device.host,
    port: device.port,
  };
  if (childId !== undefined) {
    // @ts-expect-error: childId is only on plugs, but harmless
    testDevice.deviceOptions.childId = childId;
  }

  testDevice.getDevice = function getDevice(
    deviceOptions?: Parameters<Client['getDevice']>[0],
    sendOptions?: Parameters<Client['getDevice']>[1],
  ): ReturnType<Client['getDevice']> {
    return client.getDevice(
      {
        ...testDevice.deviceOptions,
        defaultSendOptions: sendOptions,
        ...deviceOptions,
      } as Parameters<Client['getDevice']>[0], // TODO: I don't like this cast but only way I could get it to work
      sendOptions,
    );
  };

  if ('children' in device && device.children.size > 0) {
    if (testDevice.childId === undefined) {
      testDevice.children = ((): MarkRequired<
        TestDevice,
        'getDevice' | 'childId' | 'parent'
      >[] => {
        return Array.from(device.children.keys()).map((key) => {
          return createTestDevice(device, client, {
            name: testDevice.name,
            model: testDevice.model,
            hardwareVersion: testDevice.hardwareVersion,
            isSimulated: testDevice.isSimulated,
            parent: testDevice as TestDevice,
            childId: key,
          }) as MarkRequired<TestDevice, 'getDevice' | 'childId' | 'parent'>;
        });
      })();
    } else {
      testDevice.getOtherChildren = function getOtherChildren(): MarkRequired<
        TestDevice,
        'getDevice' | 'childId' | 'parent'
      >[] {
        if (!(parent !== undefined && parent.children !== undefined))
          throw new TypeError();
        return parent.children.filter((oc) => oc.childId !== this.childId);
      };

      testDevice.getOtherChildrenState =
        async function getOtherChildrenState(): Promise<
          Array<{
            childId: string;
            relayState: boolean;
            alias: string;
          }>
        > {
          if (
            !(
              'getOtherChildren' in testDevice &&
              testDevice.getOtherChildren !== undefined
            )
          ) {
            throw new Error();
          }
          return Promise.all(
            testDevice.getOtherChildren().map(async (childDevice) => {
              const d = (await childDevice.getDevice()) as Plug;
              if (d.childId === undefined) throw new TypeError();
              return {
                childId: d.childId,
                relayState: d.relayState,
                alias: d.alias,
              };
            }),
          );
        };
    }
  }

  testDevices.push(testDevice as TestDevice);
  return testDevice as TestDevice;
}
