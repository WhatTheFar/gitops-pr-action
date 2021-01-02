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
