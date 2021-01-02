# gitops-pr-action

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

We use [gomplate](https://github.com/hairyhenderson/gomplate) cli as a template renderer
behind the scene. So the config template supports full capabilities of go template
engine and some addtional functionalities from gomplate.

At its most basic, gomplate can be used with environment variables.
For example, the template can access $USER via {{ .Env.USER }}.
For more details, please kindly visits [gomplate docs](https://docs.gomplate.ca/).

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
