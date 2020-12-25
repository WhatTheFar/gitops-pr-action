import * as fs from 'fs';
import { isObject, isString } from './utils';
import * as yaml from 'js-yaml';

export interface GitOpsConfig {
  using: 'kustomize';
  commitMessage: string;
  pullRequest: {
    title: string;
    branch: string;
    baseBranch: string;
  };
  gitUser: {
    name: string;
    email: string;
  };

  [key: string]: unknown;
}

export interface KustomizeGitOpsConfig extends GitOpsConfig {
  kustomize: KustomizeConfig;
}

export interface KustomizeConfig {
  baseImage: string;
  directory: string;
}

export function gitOpsConfigFor(filePath: string): GitOpsConfig {
  const config = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
  if (config == undefined || isString(config)) {
    throw new Error('Invalid config');
  }
  return config as GitOpsConfig;
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
