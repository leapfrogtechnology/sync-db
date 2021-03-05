#!/bin/bash

### Release management and changelog generation script. ###

set -e

changelog() {
  # NOTE: This requires github_changelog_generator to be installed.
  # https://github.com/skywinder/github-changelog-generator

  if [ -z "$NEXT" ]; then
      NEXT="Unreleased"
  fi

  echo "Generating changelog upto version: $NEXT"
  github_changelog_generator \
    --no-verbose \
    --pr-label "**Changes**" \
    --bugs-label "**Bug Fixes**" \
    --issues-label "**Closed Issues**" \
    --issue-line-labels=ALL \
    --future-release="$NEXT" \
    --release-branch=master \
    --exclude-labels=unnecessary,duplicate,question,invalid,wontfix
}

bump() {

  if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
      printfln "Exiting for pull request without versioning."
  fi

  last_tag=$(git tag --sort=-creatordate | head -n 1)

  printfln "$last_tag"

  if [ "$BRANCH" == "master" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
      echo "Bumping the version: ${last_tag} -> ${NEXT}"
      git tag "${NEXT}"

      hub release create "$NEXT" -m "$NEXT" || true
  fi
}

# Run command received from args.
$1
