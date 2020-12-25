export const isString = (a: unknown): a is string => typeof a === 'string';

export const isObject = (
  a: unknown,
): a is Record<string | number | symbol, unknown> => a instanceof Object;
