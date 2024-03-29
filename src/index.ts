import * as core from '@actions/core';
import * as github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';
import { RequestError } from '@octokit/request-error';
import * as path from 'path';
import 'reflect-metadata';

import { gitOpsConfigFormText } from './config';
import { varsFromText } from './config/vars';
import { gitHubEnv } from './env';
import { metaFromUrl } from './git';
import { renderConfig, setImageFor } from './template';
import { installGomplate } from './tools';
import { execCmd } from './utils';

type Octokit = InstanceType<typeof GitHub>;

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

async function run(): Promise<void> {
  // inputs defined in action metadata file
  const configPathRelative = core.getInput('config-path', { required: true });
  const image = core.getInput('image', { required: true });
  const token = core.getInput('token', { required: true });
  const version = core.getInput('version', { required: true });

  const varsText = core.getInput('vars');
  const varsResp = varsFromText(varsText);
  if ('error' in varsResp) {
    core.setFailed('Parsing input <vars> error: invalid yaml');
    return;
  }
  const { vars } = varsResp;

  await installGomplate();

  const configPath = path.resolve(gitHubEnv.workspace, configPathRelative);
  const configText = await renderConfig(configPath, version, vars);

  const configResp = gitOpsConfigFormText(configText);
  if ('error' in configResp) {
    core.setFailed('Parseing config file error: invalid config');
    switch (configResp.error) {
      case 'ValidationError':
        core.error('Validation failed');
        core.error(configResp.validationErrors.toString());
        break;
      case 'InvalidConfigError':
        core.error('Config file might be empty or invalid yaml file.');
        break;
      default:
        const _exhaustiveCheck: never = configResp;
        return _exhaustiveCheck;
    }
    return;
  }
  const { config } = configResp;

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
  const changes = await setImageFor(config, configPath, image);

  // configures git
  await configureGit(config.gitUser.email, config.gitUser.name);

  // add and commit changes
  const addResult = await execCmd('git', ['add', ...changes]);
  if (addResult.exitCode !== 0) {
    // add changes error
    throw new Error(`git add error: ${addResult.stderr}`);
  }
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
  const url = urlResult.stdout.trim();
  // TODO: handle error for metaFromUrl()
  const { owner, repo } = metaFromUrl(url);

  // get octokit
  const octokit = github.getOctokit(token);

  // create a pull request
  const prResult = await createPullRequest(
    octokit,
    { owner, repo },
    {
      head: config.pullRequest.branch,
      base: config.pullRequest.baseBranch,
      title: config.pullRequest.title,
    },
  );

  if (prResult === undefined) {
    return;
  }
  const { pullNumber } = prResult;

  // set outputs
  core.setOutput('pull-number', pullNumber);

  // request reviewers for the pull request
  await requestReviewers(
    octokit,
    { owner, repo, pullNumber },
    {
      users: config.pullRequest.reviewers?.users,
      teams: config.pullRequest.reviewers?.teams,
    },
  );

  // add assignees to the pull request
  if (config.pullRequest.assignees !== undefined) {
    await addAssignees(
      octokit,
      { owner, repo, pullNumber },
      config.pullRequest.assignees,
    );
  }
}

async function createPullRequest(
  octokit: Octokit,
  meta: {
    owner: string;
    repo: string;
  },
  pullRequest: {
    head: string;
    base: string;
    title: string;
  },
): Promise<{ pullNumber: number } | undefined> {
  const { owner, repo } = meta;
  const { head, base, title } = pullRequest;

  try {
    const prResult = await octokit.rest.pulls.create({
      owner,
      repo,
      head,
      base,
      title,
      // TODO: support PR body
      body: '',
    });

    return { pullNumber: prResult.data.number };
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
    }

    return undefined;
  }
}

async function requestReviewers(
  octokit: Octokit,
  meta: { owner: string; repo: string; pullNumber: number },
  reviewers: {
    users?: string[];
    teams?: string[];
  },
): Promise<void> {
  const { owner, repo, pullNumber } = meta;
  const { users, teams } = reviewers;

  try {
    await octokit.rest.pulls.requestReviewers({
      owner,
      repo,
      pull_number: pullNumber,
      reviewers: users === undefined ? [] : users,
      team_reviewers: teams === undefined ? [] : teams,
    });
  } catch (error) {
    if (error instanceof RequestError) {
      // https://docs.github.com/en/free-pro-team@latest/rest/reference/pulls#request-reviewers-for-a-pull-request
      switch (error.status) {
        case 403:
          core.error('Requesting reviewers returns 403 Forbidden');
          core.error(error);
          break;
        case 422:
          // Status: 422 Unprocessable Entity
          // Response if user is not a collaborator
          core.warning(
            'Requesting reviewers returns 422 Unprocessable Entity.',
          );
          core.warning('Users might not be a collaborator.');
          break;
        default:
          core.error('Requesting reviewers unknown error');
          core.error(error);
      }
    }
  }
}

async function addAssignees(
  octokit: Octokit,
  meta: { owner: string; repo: string; pullNumber: number },
  assignees: string[],
): Promise<void> {
  const { owner, repo, pullNumber } = meta;
  try {
    await octokit.rest.issues.addAssignees({
      owner,
      repo,
      issue_number: pullNumber,
      assignees,
    });
  } catch (error) {
    if (error instanceof RequestError) {
      // https://docs.github.com/en/free-pro-team@latest/rest/reference/issues#add-assignees-to-an-issue
      switch (error.status) {
        default:
          core.error('Adding assignees returns unknown error');
          core.error(error);
      }
    }
  }
}

run().catch((error) => {
  core.setFailed(error.message);
});
