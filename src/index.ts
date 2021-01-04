import * as core from '@actions/core';
import * as github from '@actions/github';
import { RequestError } from '@octokit/request-error';
import * as path from 'path';
import { gitOpsConfigFormText, isKustomtizeGitOpsConfig } from './config';
import { gitHubEnv } from './env';
import { metaFromUrl } from './git';
import { renderConfig, setKustomizeImage } from './template';
import { installGomplate, installKustomize } from './tools';
import { execCmd } from './utils';

async function configureGit(email: string, name: string): Promise<void> {
  const configEmailResult = await execCmd('git', [
    'config',
    '--global',
    'user.email',
    email,
  ]);
  if (configEmailResult.exitCode !== 0) {
    throw new Error(`git config user.email error: ${configEmailResult.stderr}`);
  }
  const configNameResult = await execCmd('git', [
    'config',
    '--global',
    'user.name',
    name,
  ]);
  if (configNameResult.exitCode !== 0) {
    throw new Error(`git config user.name error: ${configNameResult.stderr}`);
  }
}

async function run() {
  // inputs defined in action metadata file
  const configPathRelative = core.getInput('configPath');
  const image = core.getInput('image');
  const token = core.getInput('token');
  const version = core.getInput('version');

  await installGomplate();

  const configPath = path.resolve(gitHubEnv.workspace, configPathRelative);
  const configText = await renderConfig(configPath, version);

  const config = gitOpsConfigFormText(configText);

  // checkout a head branch
  const checkoutResult = await execCmd('git', [
    'checkout',
    '-b',
    config.pullRequest.branch,
  ]);
  if (checkoutResult.exitCode !== 0) {
    throw new Error(`git checkout branch error: ${checkoutResult.stderr}`);
  }
  core.info(checkoutResult.stdout);

  // set image
  if (isKustomtizeGitOpsConfig(config)) {
    await installKustomize();

    const kDir = path.resolve(
      path.dirname(configPath),
      config.kustomize.directory,
    );
    await setKustomizeImage(kDir, config.kustomize.baseImage, image);
  }

  // configures git
  await configureGit(config.gitUser.email, config.gitUser.name);

  // commit changes
  const commitResult = await execCmd('git', [
    'commit',
    '-am',
    config.commitMessage,
  ]);
  if (commitResult.exitCode !== 0) {
    // no changes to commit
    core.warning('Something went wrong. No chagnes to commit.');
    throw new Error(`git commit error: ${commitResult.stderr}`);
  }
  core.info(commitResult.stdout);

  // push commits
  const pushResult = await execCmd('git', [
    'push',
    // TODO: make remote name configurable
    'origin',
    config.pullRequest.branch,
  ]);
  if (pushResult.exitCode !== 0) {
    throw new Error(`git push error: ${pushResult.stderr}`);
  }
  core.info(pushResult.stdout);

  // get owner and repo string
  const urlResult = await execCmd('git', ['remote', 'get-url', 'origin']);
  if (urlResult.exitCode !== 0) {
    throw new Error(`git remote get-url error: ${urlResult.stderr}`);
  }
  const url = urlResult.stdout;
  // TODO: handle error for metaFromUrl()
  const { owner, repo } = metaFromUrl(url);
  core.warning(url);
  core.warning(owner + repo);

  // get octokit
  const octokit = github.getOctokit(token);

  // create a pull request
  try {
    await octokit.pulls.create({
      owner,
      repo,
      head: config.pullRequest.branch,
      base: config.pullRequest.baseBranch,
      title: config.pullRequest.title,
      // TODO: support PR body
      body: '',
    });
  } catch (error: unknown) {
    if (error instanceof RequestError) {
      // https://docs.github.com/en/free-pro-team@latest/rest/reference/pulls#create-a-pull-request
      switch (error.status) {
        case 403:
          core.setFailed('Creating PR returns status: 403 Forbidden');
          break;
        case 422:
          core.setFailed(
            'Creating PR returns status: 422 Unprocessable Entity',
          );
          break;
        default:
          core.setFailed('Creating PR returns unknown error');
      }
      core.error(error);
      core.error(error.message);
    }
  }
}

run().catch((error) => {
  core.setFailed(error.message);
});
