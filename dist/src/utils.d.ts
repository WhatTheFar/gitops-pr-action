import * as exec from '@actions/exec';
export declare type Overlay<T> = Partial<Record<keyof T, any>>;
export declare const isString: (a: unknown) => a is string;
export declare const isObject: (a: unknown) => a is Record<string | number | symbol, unknown>;
export declare type ExecOptions = Omit<exec.ExecOptions, 'listeners'>;
export interface ExecResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}
export declare function execCmd(commandLine: string, args?: string[], options?: ExecOptions): Promise<ExecResult>;
