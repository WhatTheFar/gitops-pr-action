import * as fs from 'fs';
import { isString } from './utils';
import * as yaml from 'js-yaml';

export interface GitOpsConfig {
  using: string;
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
}

export function gitOpsConfigFor(filePath: string): GitOpsConfig {
  const config = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
  if (config == undefined || isString(config)) {
    throw new Error('Invalid config');
  }
  return config as GitOpsConfig;
}

