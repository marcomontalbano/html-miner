# Contributing

## Developing

### Release Life Cycle

1. Create a pull request for each development
1. [ *only pre-release* ] Create a new version from `master` with `npm version [premajor | preminor | prepatch] --preid=beta`
1. Create a new version from `master` with `npm version [major | minor | patch]`
1. Create a new release on GitHub attaching the release note
1. [ *only pre-release* ] Flag the GitHub release with `This is a pre-release`
1. Publish the release from GitHub
1. [ *only pre-release* ] Publish the package to npm registry with `npm publish --tag beta`
1. Publish the package to npm registry with `npm publish`
