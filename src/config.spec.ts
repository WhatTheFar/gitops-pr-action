import {
  GitOpsConfig,
  gitOpsConfigFor,
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
