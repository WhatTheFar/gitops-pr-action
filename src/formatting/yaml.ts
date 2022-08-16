import * as fs from 'fs';
import * as prettier from 'prettier';

// export function formatYaml(yamlString: string): string {
//   return prettier.format(yamlString, { parser: 'yaml' });
// }

export async function formatYamlFile(filePath: string): Promise<string> {
  const text = fs.readFileSync(filePath, 'utf8');

  try {
    const options = await prettier.resolveConfig(filePath);
    const formatted = prettier.format(text, { ...options, parser: 'yaml' });

    return formatted;
  } catch (error) {
    console.log(`failed to resolve prettier config for path ${filePath}`);
    throw error;
  }
}
