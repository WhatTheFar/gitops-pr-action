import { InvalidConfigErr } from './config';
export declare type VarsReturn = {
    vars: Record<string, unknown>;
} | InvalidConfigErr;
export declare function varsFromText(text: string): VarsReturn;
