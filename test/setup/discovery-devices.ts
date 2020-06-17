import type { Client } from '../../src';
import { AnyDevice } from '../../src/client';

export default async function getDiscoveryDevices(
  client: Client,
  discoveryTimeout: number,
  discoveryMacAllow: string[]
): Promise<AnyDevice[]> {
  return new Promise((resolve) => {
    const discoveredTestDevices: AnyDevice[] = [];

    client.startDiscovery({
      discoveryTimeout,
      macAddresses: discoveryMacAllow,
    });

    setTimeout(() => {
      client.stopDiscovery();

      for (const device of client.devices.values()) {
        discoveredTestDevices.push(device);
      }
      return resolve(discoveredTestDevices);
    }, discoveryTimeout);
  });
}
