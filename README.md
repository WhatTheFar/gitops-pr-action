# gitops-pr-action

## Table of Contents

- [Usage](#usage)
- [Config Template](#config-template)
- [Scenarios](#scenarios)

## Usage

```yaml
- name: Checkout
  uses: actions/checkout@v2
  with:
    # Repository name with owner. For example, actions/checkout
    # Default: ${{ github.repository }}
    repository: ''

    # Personal access token (PAT) used to fetch the repository.
    # If the repository is public, then default is fine.
    # Default: ${{ github.token }}
    token: ''

- uses: WhatTheFar/gitops-pr-action@v1-beta
  with:
    # Relative path under $GITHUB_WORKSPACE to the config template.
    #
    # Required
    configPath: ''

    # Full image URI, including a registry name, repository and tag.
    # For example, gcr.io/PROJECT-ID/my-image:tag1
    #
    # Required
    image: ''

    # Personal access token (PAT), used to open a pull request to the GitOps repository.
    #
    # We recommend using a service account with the least permissions necessary.
    # Also when generating a new PAT, select the least scopes necessary.
    #
    # [Learn more about creating personal access tokens](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token)
    # [Learn more about creating and using encrypted secrets](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets)
    #
    # Required
    token: ''

    # String, used to render {{ .Version }} for config template.
    #
    # We use `gomplate` as a template engine behind the scene.
    # For more information, visits [gomplate](https://github.com/hairyhenderson/gomplate).
    #
    # Required
    version: ''
```

## Config Template

- [Config reference](#config-reference)
- [Example for kustomize](#example-for-kustomize)

We use [gomplate](https://github.com/hairyhenderson/gomplate) cli as a template renderer
behind the scene. So the config template supports full capabilities of go template
engine and some addtional functionalities from gomplate.

At its most basic, gomplate can be used with environment variables.
For example, the template can access $USER via {{ .Env.USER }}.
For more details, please kindly visits [gomplate docs](https://docs.gomplate.ca/).

### Config reference

```yaml
# Configuration management tool that your GitOps uses.
# For now, the tool supports only `kustomize`.
#
# Required
using: ''

# Options for kustomize
#
# Required if `using: kustomize` is set
kustomize:
  # Base image to be overriden by the image URI defined on gitops-pr-action.
  # Required
  baseImage: ''

  # Ralative path from config path to a directory, containing `kustomization.yaml`,
  # `kustomization.yml` or `Kustomize`.
  # Required
  directory: ''

# Use the given string as the commit message for git.
#
# Required
commitMessage: ''

# Options for opening a pull request
#
# Required
pullRequest:
  # Title of the pull request
  # Required
  title: ''

  # Branch name used to commit changes and open a pull request
  # Required
  branch: ''

  # Target branch where the pull request will merge into.
  # For example, 'main' or 'master'
  # Required
  baseBranch: ''

# Options to configure git user
#
# Required
gitUser:
  # Used for `git config --global user.name`
  # Required
  name: GitHub Action

  # Used for `git config --global user.email`
  # Required
  email: action@github.com
```

### Example for kustomize

File tree:

```bash
.
├── gitops.kustomize.yml
└── kustomize
    └── kustomization.yaml
```

`gitops.kustomization.yml`:

```yaml
using: kustomize
kustomize:
  baseImage: gitops-pr-action/hello-world
  directory: kustomize

commitMessage: >
  feat(hello-world): hello-world image {{ .Version }}

pullRequest:
  title: Deploy hello-world {{ .Version }}
  branch: deploy/hello-world/{{ .Version }}
  baseBranch: main

gitUser:
  name: GitHub Action
  email: action@github.com
```

`kustomize/kustomization.yaml`:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

images:
  - name: gitops-pr-action/hello-world
    newName: hello-world
    newTag: latest
```

## Scenarios

- [Get version from tag](#get-version-from-tag)
- [Deliver image to AWS ECR](#deliver-image-to-aws-ecr)

### Get version from tag

Assume the project create a release using semantic versioning via tags.

```yaml
on:
  push:
    tags:
      - v*
jobs:
  gitops:
    steps:
      - name: Get the version
        id: get-version
        run: echo ::set-output name=version::${GITHUB_REF#refs/tags/}

      - uses: WhatTheFar/gitops-pr-action@v1-beta
        with:
          configPath: '' # Required
          image: '' # Required
          token: '' # Required
          version: ${{ steps.get-version.outputs.version }}
```

### Deliver image to AWS ECR

- <https://github.com/aws-actions/configure-aws-credentials>
- <https://github.com/aws-actions/amazon-ecr-login>

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ap-southeast-1

- name: Login to Amazon ECR
  id: login-ecr
  uses: aws-actions/amazon-ecr-login@v1

- name: Build, tag, and push image to Amazon ECR
  env:
    ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
    ECR_REPOSITORY: my-ecr-repo
    IMAGE_TAG: ${{ github.sha }}
  run: |
    docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
    docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

- name: Open a pull request to deploy new image from Amazon ECR
  uses: WhatTheFar/gitops-pr-action@v1-beta
  with:
    configPath: '' # Required
    image: ${{ steps.login-ecr.outputs.registry }}/my-ecr-repo:${{ github.sha }}
    token: '' # Required
    version: ${{ github.sha }}
```
