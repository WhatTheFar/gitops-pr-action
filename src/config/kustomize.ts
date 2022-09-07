import { Type } from 'class-transformer';
import { Equals, IsString, MinLength, ValidateNested } from 'class-validator';

import { isObject, isString } from '../utils';
import { BaseGitOpsConfig } from './base';
import { GitOpsConfig } from './config';

export class KustomizeOption {
  @IsString()
  @MinLength(1)
  baseImage!: string;

  @IsString()
  @MinLength(1)
  directory!: string;
}

export class KustomizeGitOpsConfig extends BaseGitOpsConfig {
  @Equals('kustomize')
  using!: 'kustomize';

  @Type(() => KustomizeOption)
  @ValidateNested()
  kustomize!: KustomizeOption;
}

export function isKustomtizeGitOpsConfig(
  config: GitOpsConfig,
): config is KustomizeGitOpsConfig {
  if (config.using !== 'kustomize') {
    return false;
  }
  if (
    isObject(config.kustomize) &&
    isString(config.kustomize.baseImage) &&
    isString(config.kustomize.directory)
  ) {
    return true;
  }
  throw new Error('Invalid kustomize config');
}
