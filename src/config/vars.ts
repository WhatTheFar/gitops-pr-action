import * as yaml from 'js-yaml';

import { isString } from '../utils';
import { InvalidConfigErr } from './config';

export type VarsReturn = { vars: Record<string, unknown> } | InvalidConfigErr;

export function varsFromText(text: string): VarsReturn {
  if (text == '') {
    return { vars: {} };
  }

  const loadedConfig = yaml.safeLoad(text);
  if (loadedConfig == undefined || isString(loadedConfig)) {
    return { error: 'InvalidConfigError' };
  }
  const plainConfig: Record<string, unknown> = loadedConfig as any;

  return { vars: plainConfig };
}
