import {
  GitOpsConfig,
  gitOpsConfigFor,
  isKustomtizeGitOpsConfig,
  KustomizeConfig,
} from './config';
import * as path from 'path';

describe('GitOpsConfig', () => {
  describe('Given a simple config file', () => {
    const relConfigPath = '../fixtures/gitops.simple.yml';
    const configPath = path.resolve(__dirname, relConfigPath);

    describe(`When call gitOpsConfigFor('${relConfigPath}')`, () => {
      test('Then it should return valid', () => {
        const actual = gitOpsConfigFor(configPath);

        const expected: GitOpsConfig = {
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
          },
          gitUser: {
            name: 'GitHub Action',
            email: 'action@github.com',
          },
        };
        expect(actual).toEqual(expected);
      });
    });
  });

  describe.each`
    relConfigPath
    ${'../fixtures/invalid.txt'}
    ${'../fixtures/invalid.yaml'}
  `(
    'Given an invalid config file',
    ({ relConfigPath }: { relConfigPath: string }) => {
      const configPath = path.resolve(__dirname, relConfigPath);

      describe(`When call gitOpsConfigFor('${relConfigPath}')`, () => {
        test('Then it should throw an error', () => {
          const fn = () => {
            const {} = gitOpsConfigFor(configPath);
          };

          expect(fn).toThrow('Invalid config');
        });
      });
    },
  );
});

describe('KustomizeGitOpsConfig', () => {
  const baseConfig: GitOpsConfig = {
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
  const validKustomize: KustomizeConfig = {
    baseImage: 'gitops-pr-action/hello-world',
    directory: '.',
  };

  const shouldError = 'Error';
  const p = (a: GitOpsConfig) => a;
  describe.each`
    config                                                                  | expected
    ${p({ ...baseConfig, kustomize: validKustomize })}                      | ${true}
    ${p({ ...baseConfig, kustomize: 'this should be a KustomizeConfig' })}  | ${shouldError}
    ${p({ ...baseConfig, kustomize: { ...validKustomize, baseImage: 5 } })} | ${shouldError}
    ${p({ ...baseConfig, kustomize: { ...validKustomize, directory: 5 } })} | ${shouldError}
  `(
    'Given a kustomize config instance',
    ({
      config,
      expected,
    }: {
      config: GitOpsConfig;
      expected: boolean | typeof shouldError;
    }) => {
      describe(`When call isKustomtizeGitOpsConfig(${config})`, () => {
        if (expected == shouldError) {
          test(`Then it should throw an error`, () => {
            const fn = () => {
              const {} = isKustomtizeGitOpsConfig(config);
            };
            expect(fn).toThrow('Invalid kustomize config');
          });
        } else {
          test(`Then it should return ${expected}`, () => {
            const actual: boolean = isKustomtizeGitOpsConfig(config);
            expect(actual).toEqual(expected);
          });
        }
      });
    },
  );
});
