import { plainToClass } from 'class-transformer';
import { KustomizeOption, KustomizeGitOpsConfig } from './kustomize';
import { validateSync } from 'class-validator';
import { Overlay } from '../utils';
import { kustomizeConfig } from './fixture';

describe('KustomizeGitOpsConfig', () => {
  describe('Given a plain KustomizeGitOpsConfig', () => {
    describe(`And invalid 'using' field`, () => {
      const overlayConfig = {
        ...kustomizeConfig,
        using: 'invalid',
      };

      test('When validate, it should return errors', () => {
        const config = plainToClass(KustomizeGitOpsConfig, overlayConfig);
        const errors = validateSync(config);
        expect(errors.length).toEqual(1);
        expect(errors[0]).toEqual(
          expect.objectContaining({ property: 'using' }),
        );
      });
    });

    describe('And custom KustomizeOption', () => {
      const o = (overlay?: Overlay<KustomizeOption>) => ({
        ...kustomizeConfig,
        kustomize: { ...kustomizeConfig.kustomize, ...overlay },
      });
      const p = (partial?: Partial<KustomizeOption>) => o(partial);
      const err = (...keys: Array<keyof KustomizeOption>) => keys;

      describe.each`
        plain
        ${p()}
      `(
        `With valid attributes`,
        ({ plain }: { plain: Record<string, any> }) => {
          const config = plainToClass(KustomizeGitOpsConfig, plain);

          describe('When validates via class-validator', () => {
            const errors = validateSync(config);

            test('It should no error', () => {
              expect(errors).toEqual([]);
            });
          });
        },
      );

      describe.each`
        plain                                                | expected
        ${o({ baseImage: '', directory: '' })}               | ${err('baseImage', 'directory')}
        ${o({ baseImage: 5, directory: 5 })}                 | ${err('baseImage', 'directory')}
        ${o({ baseImage: undefined, directory: undefined })} | ${err('baseImage', 'directory')}
      `(
        `With invalid $expected`,
        ({
          plain,
          expected,
        }: {
          plain: Record<string, any>;
          expected: ReturnType<typeof err>;
        }) => {
          const config = plainToClass(KustomizeGitOpsConfig, plain);

          // eslint-disable-next-line jest/no-identical-title
          describe('When validates via class-validator', () => {
            const errors = validateSync(config);

            test('It should return errors', () => {
              expect(errors.length).toEqual(1);
              const kustomizeErrs = errors[0].children;
              expect(kustomizeErrs.length).toEqual(expected.length);
              expect(kustomizeErrs).toEqual(
                expect.arrayContaining(
                  expected.map((e) => expect.objectContaining({ property: e })),
                ),
              );
            });
          });
        },
      );
    });
  });
});

