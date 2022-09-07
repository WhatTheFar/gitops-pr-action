import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

import { execCmd } from './utils';

const KUSTOMIZE_VERSION = 'v3.8.8';
const GOMPLATE_VERSION = 'v3.8.0';

export async function installKustomize(): Promise<void> {
  const platform = process.platform;
  const arch = 'amd64';

  const path = await tc.downloadTool(
    `https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2F${KUSTOMIZE_VERSION}/kustomize_${KUSTOMIZE_VERSION}_${platform}_${arch}.tar.gz`,
  );
  const extractedDir = await tc.extractTar(path);
  const cachedPath = await tc.cacheDir(
    extractedDir,
    'kustomize',
    KUSTOMIZE_VERSION,
  );

  core.addPath(cachedPath);
}

export async function installGomplate(): Promise<void> {
  const platform = process.platform;
  const arch = 'amd64';

  const path = await tc.downloadTool(
    `https://github.com/hairyhenderson/gomplate/releases/download/${GOMPLATE_VERSION}/gomplate_${platform}-${arch}-slim`,
  );
  await execCmd('chmod', ['+x', path]);

  const cachedFile = await tc.cacheFile(
    path,
    'gomplate',
    'gomplate',
    GOMPLATE_VERSION,
  );

  core.addPath(cachedFile);
}
