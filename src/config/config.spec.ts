import { GitOpsConfig, GitOpsConfigReturn, gitOpsConfigFor } from './config';
import { getFixtureFile } from './fixture';
import { KustomizeGitOpsConfig } from './kustomize';

describe('GitOpsConfig', () => {
  const getConfig = (e: GitOpsConfigReturn) => {
    if ('config' in e) {
      return e.config;
    }
    return undefined;
  };
  const getError = (e: GitOpsConfigReturn) => {
    if ('error' in e) {
      return e.error;
    }
    return undefined;
  };

  describe('Given a simple config file', () => {
    const configRelPath = 'gitops.simple.yml';
    const configPath = getFixtureFile(configRelPath);

    describe(`When calls gitOpsConfigFor('${configRelPath}')`, () => {
      test('Then it should return valid GitOpsConfig', () => {
        const actual = gitOpsConfigFor(configPath);
        const expectedConfig: GitOpsConfig = {
          using: 'kustomize',
          kustomize: {
            baseImage: 'gitops-pr-action/hello-world',
            directory: '.',
          },
          commitMessage: 'feat(hello-world): hello-world image\n',
          pullRequest: {
            title: 'Deploy hello-world',
            branch: 'deploy/hello-world',
            baseBranch: 'main',
            reviewers: {
              users: ['WhatTheFar'],
            },
            assignees: ['WhatTheFar'],
          },
          gitUser: {
            name: 'GitHub Action',
            email: 'action@github.com',
          },
        };

        const actualConfig = getConfig(actual);

        expect(actualConfig).toEqual(expectedConfig);
        expect(actualConfig).toBeInstanceOf(KustomizeGitOpsConfig);
      });
    });
  });

  const validationErr = 'ValidationError';
  const invalidConfig = 'InvalidConfigError';

  describe.each`
    relConfigPath            | error
    ${'invalid.txt'}         | ${invalidConfig}
    ${'invalid.yaml'}        | ${invalidConfig}
    ${'validation-err.yaml'} | ${validationErr}
  `(
    'Given an invalid config file',
    ({ relConfigPath, error }: { relConfigPath: string; error: string }) => {
      const configPath = getFixtureFile(relConfigPath);

      describe(`When call gitOpsConfigFor('${relConfigPath}')`, () => {
        test('Then it should throw an error', () => {
          const actual = gitOpsConfigFor(configPath);
          const actualError = getError(actual);
          expect(actualError).toEqual(error);
        });
      });
    },
  );
});
