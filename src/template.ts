import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';

import { GitOpsConfig, isKustomtizeGitOpsConfig } from './config';
import { formatYamlFile } from './formatting/yaml';
import { installKustomize } from './tools';
import { ExecOptions, execCmd } from './utils';

export async function renderConfig(
  filePath: string,
  version: string,
): Promise<string> {
  const dir = path.dirname(filePath);
  const fileName = path.basename(filePath);

  const options: ExecOptions = {
    cwd: dir,
    env: {
      VERSION: version,
    },
  };

  const result = await execCmd(
    'gomplate',
    [
      ...['--context', `Version=env:VERSION`], //
      ...['--file', fileName],
    ],
    options,
  );

  if (result.exitCode == 0) {
    return result.stdout;
  } else {
    throw new Error(`gomplate error: ${result.stderr}`);
  }
}

export async function setImageFor(
  config: GitOpsConfig,
  configPath: string,
  image: string,
): Promise<string[]> {
  if (isKustomtizeGitOpsConfig(config)) {
    const { kustomize: k } = config;
    await installKustomize();

    const kDir = path.resolve(path.dirname(configPath), k.directory);
    return await setKustomizeImage(kDir, k.baseImage, image);
  } else {
    const _exhaustiveCheck: never = config;
    return _exhaustiveCheck;
  }
}

export async function setKustomizeImage(
  kustomizeDir: string,
  baseImage: string,
  newImage: string,
): Promise<string[]> {
  const options: ExecOptions = {
    cwd: kustomizeDir,
  };

  const result = await execCmd(
    'kustomize',
    ['edit', 'set', 'image', `${baseImage}=${newImage}`],
    options,
  );

  if (result.exitCode == 0) {
    core.info(result.stdout);
  } else {
    throw new Error(`kustomize error: ${result.stderr}`);
  }

  // TODO: support file-not-found fallback
  const kustomizationPath = path.join(kustomizeDir, 'kustomization.yml');
  const formatted = await formatYamlFile(kustomizationPath);

  fs.writeFileSync(kustomizationPath, formatted);

  return [kustomizeDir];
}
