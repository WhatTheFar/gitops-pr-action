import { BaseGitOpsConfig } from './base';
import { KustomizeOption, KustomizeGitOpsConfig } from './kustomize';
import * as path from 'path';

export function getFixtureFile(relPathUnderFixture: string): string {
  return path.resolve(__dirname, '..', '..', 'fixtures', relPathUnderFixture);
}

export const baseConfig: BaseGitOpsConfig = {
  using: 'kustomize',
  commitMessage: 'feat(hello-world): hello-world image',
  pullRequest: {
    title: 'Deploy hello-world',
    branch: 'deploy/hello-world',
    baseBranch: 'main',
  },
  gitUser: {
    name: 'GitHub Action',
    email: 'action@github.com',
  },
};

export const kustomizeOption: KustomizeOption = {
  baseImage: 'gitops-pr-action/hello-world',
  directory: '.',
};

export const kustomizeConfig: KustomizeGitOpsConfig = {
  ...baseConfig,
  using: 'kustomize',
  kustomize: kustomizeOption,
};
