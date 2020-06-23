import castArray from 'lodash.castarray';
import get from 'lodash.get';

export function isObjectLike(
  candidate: unknown
): candidate is Record<string, unknown> {
  return typeof candidate === 'object' && candidate !== null;
}

/**
 * Represents an error result received from a TP-Link device.
 *
 * Where response err_code != 0.
 * @param command - command sent to device
 * @param errorModules - array of modules that returned with errors.
 */
export class ResponseError extends Error {
  /**
   * Set by `Error.captureStackTrace`
   */
  readonly stack = '';

  constructor(
    message: string,
    readonly response: string,
    readonly command: string,
    readonly modules: string[] = [],
    readonly methods: string[] = []
  ) {
    super(message);
    this.name = 'ResponseError';
    this.message = `${message} response: ${response} command: ${command}`;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function isDefinedAndNotNull<T>(
  candidate: T
): candidate is Exclude<T, null | undefined> {
  return candidate !== undefined && candidate !== null;
}

export type HasErrCode = {
  err_code: number;
  err_msg?: string;
};

export function hasErrCode(candidate: unknown): candidate is HasErrCode {
  return isObjectLike(candidate) && typeof candidate.err_code === 'number';
}

export function normalizeMac(mac = ''): string {
  return mac.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

export function compareMac(mac = '', macPattern: string | string[]): boolean {
  const macPatterns = castArray(macPattern).map((p) => {
    return new RegExp(
      `^${p
        .replace(/[^A-Za-z0-9?*]/g, '')
        .replace(/[?]/g, '.')
        .replace(/[*]/g, '.*')
        .toUpperCase()}$`
    );
  });
  const normalizedMac = normalizeMac(mac);
  return macPatterns.findIndex((p) => p.test(normalizedMac)) !== -1;
}

export function replaceControlCharacters(
  input: string,
  replace = '﹖'
): string {
  return input.replace(/[\x00-\x1F]/g, replace); // eslint-disable-line no-control-regex
}

function flattenResponses(
  command: object,
  response: object,
  depth = 0,
  module = '',
  results: Array<{ module: string; method?: string; response: object }> = []
): Array<{ module: string; method?: string; response: object }> {
  const keys = Object.keys(command);
  if (keys.length === 0) {
    // results.push(response);
  } else if (isObjectLike(command) && isObjectLike(response)) {
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (depth === 1) {
        if (key in response && isObjectLike(response[key])) {
          results.push({
            module,
            method: key,
            response: response[key] as object,
          });
        } else {
          results.push({ module, response });
          return results;
        }
      } else if (depth < 1) {
        if (response[key] !== undefined) {
          flattenResponses(
            command[key] as object,
            response[key] as object,
            depth + 1,
            key,
            results
          );
        }
      }
    }
  }
  return results;
}

/**
 *
 * @param command
 * @param response
 * @returns
 * @throws {ResponseError}
 */
export function processResponse(command: object, response: object): object {
  const multipleResponses = Object.keys(response).length > 1;
  const commandResponses = flattenResponses(command, response);

  const errors: Array<{
    msg: string;
    response: object;
    module: string;
    method?: string;
  }> = [];

  commandResponses.forEach((r) => {
    const res = r.response;
    if (hasErrCode(res)) {
      if (res.err_code !== 0) {
        errors.push({
          msg: 'err_code not zero',
          response: res,
          module: r.module,
          method:
            r.method !== undefined ? `${r.module}.${r.method}` : undefined,
        });
      }
    } else {
      errors.push({
        msg: 'err_code missing',
        response: res,
        module: r.module,
        method: r.method !== undefined ? `${r.module}.${r.method}` : undefined,
      });
    }
  });

  if (errors.length === 1 && !multipleResponses) {
    throw new ResponseError(
      errors[0].msg,
      JSON.stringify(errors[0].response),
      JSON.stringify(command),
      [errors[0].module],
      errors[0].method === undefined ? undefined : [errors[0].method]
    );
  } else if (errors.length > 0) {
    throw new ResponseError(
      'err_code',
      JSON.stringify(response),
      JSON.stringify(command),
      errors.map((e) => e.module),
      errors
        .filter((e) => e.method !== undefined)
        .map((e) => e.method as string)
    );
  }

  if (commandResponses.length === 1) {
    return commandResponses[0].response;
  }
  return response;
}

/**
 * Extract `path` from `response` (from `Client#sendCommand`) and run `typeGuardFn`
 *
 * @param response
 * @param path passed to `lodash.get`
 * @param typeGuardFn
 * @returns value of `path` in `response`
 * @throws Error
 * @throws TypeError
 */
export function extractResponse<T>(
  response: unknown,
  path: string,
  typeGuardFn: (arg0: unknown) => boolean
): T {
  const ret = path.length > 0 ? get(response, path) : response;

  if (ret === undefined || !isObjectLike(ret)) {
    throw new Error(
      `Could not find path:"${path}" in ${JSON.stringify(response)}`
    );
  }
  if (!typeGuardFn(ret))
    throw new TypeError(
      `Unexpected object path:"${path}" in ${JSON.stringify(response)}`
    );
  return ret as T;
}
