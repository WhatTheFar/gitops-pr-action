import { metaFromUrl } from './git';

describe('git', () => {
  describe.each`
    url                                                                  | owner            | repo
    ${'https://github.com/WhatTheFar/gitops-pr-action.git'}              | ${'WhatTheFar'}  | ${'gitops-pr-action'}
    ${'https://github.com/SCGWEDOtech/trinity-transmission-aws-kinesis'} | ${'SCGWEDOtech'} | ${'trinity-transmission-aws-kinesis'}
    ${'git@github.com:SCGWEDOtech/trinity-gitops.git'}                   | ${'SCGWEDOtech'} | ${'trinity-gitops'}
  `(
    'metaFromUrl()',
    ({ url, owner, repo }: { url: string; owner: string; repo: string }) => {
      const actual: { owner: string; repo: string } = metaFromUrl(url);
      const expected = { owner, repo };

      test('It should return correct meta', () => {
        expect(actual).toEqual(expected);
      });
    },
  );
});
