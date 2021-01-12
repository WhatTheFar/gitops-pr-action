import * as exec from '@actions/exec';

export type Overlay<T> = Partial<Record<keyof T, any>>;

export const isString = (a: unknown): a is string => typeof a === 'string';

export const isObject = (
  a: unknown,
): a is Record<string | number | symbol, unknown> => a instanceof Object;

export type ExecOptions = Omit<exec.ExecOptions, 'listeners'>;

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function execCmd(
  commandLine: string,
  args?: string[],
  options?: ExecOptions,
): Promise<ExecResult> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const newOptions: exec.ExecOptions = {
    ...options,
    listeners: {
      stdout: (data: Buffer) => {
        stdout.push(data.toString());
      },
      stderr: (data: Buffer) => {
        stderr.push(data.toString());
      },
    },
  };

  const exitCode = await exec.exec(commandLine, args, newOptions);

  return {
    exitCode,
    stdout: stdout.join(''),
    stderr: stderr.join(''),
  };
}
