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
 */
export class ResponseError extends Error {
  /**
   * Set by `Error.captureStackTrace`
   */
  readonly stack = '';

  /**
   *
   * @param message -
   * @param response -
   * @param command - command sent to device
   * @param modules - array of module names that returned with errors.
   * @param methods - array of method names (format: `${moduleName}.${methodName}`) that returned with errors.
   */
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
  command: Record<string, unknown>,
  response: Record<string, unknown>,
  depth = 0,
  module = '',
  results: Array<{
    module: string;
    method?: string;
    response: Record<string, unknown>;
  }> = []
): Array<{
  module: string;
  method?: string;
  response: Record<string, unknown>;
}> {
  const keys = Object.keys(command);
  if (keys.length === 0) {
    if (depth === 1) {
      results.push({ module, response: {} });
    } else if (depth < 1) {
      results.push({ module, response: {} });
    }
  } else if (isObjectLike(command) && isObjectLike(response)) {
    for (const key of keys) {
      if (depth === 1) {
        if (key in response && isObjectLike(response[key])) {
          results.push({
            module,
            method: key,
            response: response[key] as Record<string, unknown>, // using cast, this is TS bug or limitation. isObjectLike above assures type safety
          });
        } else {
          results.push({ module, response });
          return results;
        }
      } else if (depth < 1) {
        if (response[key] !== undefined) {
          flattenResponses(
            command[key] as Record<string, unknown>,
            response[key] as Record<string, unknown>,
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
 * @param module
 * @param method
 * @param response
 */
export function processSingleCommandResponse(
  module: string,
  method: string,
  command: string,
  response: string
): HasErrCode {
  let responseObj;
  try {
    responseObj = JSON.parse(response);
  } catch (err) {
    throw new ResponseError('Could not parse response', response, command);
  }
  if (responseObj[module] === undefined) {
    throw new ResponseError('Module not found in response', response, command);
  }
  if (responseObj[module][method] === undefined) {
    throw new ResponseError('Method not found in response', response, command, [
      module,
    ]);
  }
  const methodResponse = responseObj[module][method];
  if (!hasErrCode(methodResponse)) {
    throw new ResponseError('err_code missing', response, command, [module]);
  }
  return methodResponse;
}

/**
 *
 * @param command
 * @param response
 * @returns
 * @throws {@link ResponseError}
 */
export function processResponse(
  command: Record<string, unknown>,
  response: Record<string, unknown>
): Record<string, unknown> {
  const multipleResponses = Object.keys(response).length > 1;
  const commandResponses = flattenResponses(command, response);

  const errors: Array<{
    msg: string;
    response: Record<string, unknown>;
    module: string;
    method?: string;
  }> = [];

  if (commandResponses.length === 0) {
    throw new ResponseError(
      'err_code missing',
      JSON.stringify(response),
      JSON.stringify(command)
    );
  }

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

  if (errors.length === 1 && errors[0] !== undefined && !multipleResponses) {
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

  if (commandResponses.length === 1 && commandResponses[0] !== undefined) {
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
 * @throws {@link Error}
 * @throws {@link TypeError}
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
