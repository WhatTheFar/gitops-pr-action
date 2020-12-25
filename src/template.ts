import * as core from '@actions/core';
import * as path from 'path';
import { execCmd, ExecOptions } from './utils';

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
    ['--context', `Version=env:VERSION`, '--file', fileName],
    options,
  );

  if (result.exitCode == 0) {
    return result.stdout;
  } else {
    throw new Error(`gomplate error: ${result.stderr}`);
  }
}

export async function setKustomizeImage(
  kustomizeDir: string,
  baseImage: string,
  newImage: string,
): Promise<void> {
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
}

