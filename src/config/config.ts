import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { plainToClass } from 'class-transformer';
import { ValidationError, validateSync } from 'class-validator';
import { isString } from '../utils';
import { KustomizeGitOpsConfig } from './kustomize';

type Using = 'kustomize';

export type GitOpsConfig = KustomizeGitOpsConfig;

export type ValidationErr = {
  error: 'ValidationError';
  validationErrors: ValidationError[];
};
export type InvalidConfigErr = { error: 'InvalidConfigError' };
export type GitOpsConfigReturn =
  | { config: GitOpsConfig }
  | ValidationErr
  | InvalidConfigErr;

export function gitOpsConfigFor(filePath: string): GitOpsConfigReturn {
  return gitOpsConfigFormText(fs.readFileSync(filePath, 'utf8'));
}

export function gitOpsConfigFormText(text: string): GitOpsConfigReturn {
  const loadedConfig = yaml.safeLoad(text);
  if (loadedConfig == undefined || isString(loadedConfig)) {
    return { error: 'InvalidConfigError' };
  }
  const plainConfig: Record<string, unknown> = loadedConfig as any;
  if (plainConfig.using == undefined || !isString(plainConfig.using)) {
    return { error: 'InvalidConfigError' };
  }
  const using: Using = plainConfig.using as Using;

  if (using === 'kustomize') {
    const kGitOps = plainToClass(KustomizeGitOpsConfig, plainConfig);
    const errors = validateSync(kGitOps);
    if (errors.length > 0) {
      return { error: 'ValidationError', validationErrors: errors };
    }
    return { config: kGitOps };
  } else {
    const _exhaustiveCheck: never = using;
    return _exhaustiveCheck;
  }
}
