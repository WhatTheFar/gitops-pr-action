import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { Overlay } from '../utils';
import {
  BaseGitOpsConfig,
  GitUserOption,
  PullRequestOption,
  PullRequestReviewer,
} from './base';
import { baseConfig } from './fixture';

describe('BaseGitOpsConfig', () => {
  describe('Given a plain BaseGitOpsConfig', () => {
    describe('And custom GitUserOption', () => {
      const o = (overlay?: Overlay<GitUserOption>) => ({
        ...baseConfig,
        gitUser: { ...baseConfig.pullRequest, ...overlay },
      });
      const p = (partial?: Partial<GitUserOption>) => o(partial);
      // const err = (...keys: Array<keyof GitUserOption>) => keys;

      describe.each`
        plain
        ${p({ name: 'GitHub Action', email: 'action@github.com' })}
        ${p({ name: 'Kitty Bot', email: '12345678+kitty-bot[bot]@users.noreply.github.com' })}
      `(
        `With valid attributes`,
        ({ plain }: { plain: Record<string, any> }) => {
          const config = plainToClass(BaseGitOpsConfig, plain);

          describe('When validates via class-validator', () => {
            const errors = validateSync(config);

            test('It should return no error', () => {
              expect(errors).toEqual([]);
            });
          });
        },
      );
    });

    describe('And custom PullRequestOption', () => {
      const o = (overlay?: Overlay<PullRequestOption>) => ({
        ...baseConfig,
        pullRequest: { ...baseConfig.pullRequest, ...overlay },
      });
      const p = (partial?: Partial<PullRequestOption>) => o(partial);
      const err = (...keys: Array<keyof PullRequestOption>) => keys;

      describe.each`
        plain
        ${p()}
        ${p({ reviewers: undefined, assignees: undefined })}
        ${p({ assignees: ['WhatTheFar'] })}
      `(
        `With valid attributes`,
        ({ plain }: { plain: Record<string, any> }) => {
          const config = plainToClass(BaseGitOpsConfig, plain);

          describe('When validates via class-validator', () => {
            const errors = validateSync(config);

            test('It should return no error', () => {
              expect(errors).toEqual([]);
            });
          });
        },
      );

      describe.each`
        plain                                                                | expected
        ${o({ title: '', branch: '', baseBranch: '' })}                      | ${err('title', 'branch', 'baseBranch')}
        ${o({ title: 5, branch: 5, baseBranch: 5 })}                         | ${err('title', 'branch', 'baseBranch')}
        ${o({ title: undefined, branch: undefined, baseBranch: undefined })} | ${err('title', 'branch', 'baseBranch')}
        ${o({ reviewers: 5, assignees: 5 })}                                 | ${err('reviewers', 'assignees')}
        ${o({ assignees: [] })}                                              | ${err('assignees')}
        ${o({ assignees: [''] })}                                            | ${err('assignees')}
      `(
        `With invalid $expected`,
        ({
          plain,
          expected,
        }: {
          plain: Record<string, any>;
          expected: ReturnType<typeof err>;
        }) => {
          const config = plainToClass(BaseGitOpsConfig, plain);

          // eslint-disable-next-line jest/no-identical-title
          describe('When validates via class-validator', () => {
            const errors = validateSync(config);

            test('It should return errors', () => {
              expect(errors.length).toEqual(1);
              const prErrs = errors[0].children;
              expect(prErrs.length).toEqual(expected.length);
              expect(prErrs).toEqual(
                expect.arrayContaining(
                  expected.map((e) => expect.objectContaining({ property: e })),
                ),
              );
            });
          });
        },
      );
    });

    describe('And custom PullRequestReviewer', () => {
      const o = (overlay?: Overlay<PullRequestReviewer>) => ({
        ...baseConfig,
        pullRequest: {
          ...baseConfig.pullRequest,
          reviewers: { ...baseConfig.pullRequest.reviewers, ...overlay },
        },
      });
      const p = (partial?: Partial<PullRequestReviewer>) => o(partial);
      const err = (...keys: Array<keyof PullRequestReviewer>) => keys;

      describe.each`
        plain
        ${p()}
        ${p({ users: undefined, teams: undefined })}
        ${p({ users: ['WhatTheFar'], teams: ['DevOps'] })}
      `(
        `With valid attributes`,
        ({ plain }: { plain: Record<string, any> }) => {
          const config = plainToClass(BaseGitOpsConfig, plain);

          describe('When validates via class-validator', () => {
            const errors = validateSync(config);

            test('It should return no error', () => {
              expect(errors).toEqual([]);
            });
          });
        },
      );

      describe.each`
        plain                                                    | expected
        ${o({ users: [], teams: [] })}                           | ${err('users', 'teams')}
        ${o({ users: [''], teams: [''] })}                       | ${err('users', 'teams')}
        ${o({ users: [5], teams: [5] })}                         | ${err('users', 'teams')}
        ${o({ users: ['WhatTheFar', 5], teams: ['DevOps', 5] })} | ${err('users', 'teams')}
      `(
        `With invalid $expected`,
        ({
          plain,
          expected,
        }: {
          plain: Record<string, any>;
          expected: ReturnType<typeof err>;
        }) => {
          const config = plainToClass(BaseGitOpsConfig, plain);

          // eslint-disable-next-line jest/no-identical-title
          describe('When validates via class-validator', () => {
            const errors = validateSync(config);

            test('It should return errors', () => {
              expect(errors.length).toEqual(1);
              expect(errors[0]).toEqual(
                expect.objectContaining({ property: 'pullRequest' }),
              );
              const prErrs = errors[0].children;
              expect(prErrs.length).toEqual(1);
              expect(prErrs[0]).toEqual(
                expect.objectContaining({ property: 'reviewers' }),
              );
              const reviewerErrs = prErrs[0].children;
              expect(reviewerErrs).toEqual(
                expect.arrayContaining(
                  expected.map((e) => expect.objectContaining({ property: e })),
                ),
              );
              expect(reviewerErrs.length).toEqual(expected.length);
            });
          });
        },
      );
    });
  });
});
