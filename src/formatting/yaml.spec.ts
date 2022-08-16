import * as fs from 'fs';
import * as path from 'path';
import { formatYamlFile } from './yaml';

function getFixtureFile(relPathUnderFixture: string): string {
  return path.resolve(__dirname, 'fixtures', relPathUnderFixture);
}

test('format YAML via prettier', async () => {
  const unformatted = getFixtureFile('unformatted.yaml');
  const formatted = getFixtureFile('formatted.yaml');

  const actual = await formatYamlFile(unformatted);
  const expected = fs.readFileSync(formatted, 'utf8');

  expect(actual).toEqual(expected);
});
