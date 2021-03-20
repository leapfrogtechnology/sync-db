#!/bin/bash

### Release management and changelog generation script. ###

set -e

printfln() {
  printf "\n$1\n"
}

changelog() {
  # NOTE: This requires github_changelog_generator to be installed.
  # https://github.com/skywinder/github-changelog-generator

  if [ -z "$NEXT" ]; then
      NEXT="Unreleased"
  fi

  echo "Generating changelog upto version: $NEXT"
  github_changelog_generator \
    --user="leapfrogtechnology" \
    --project="sync-db" \
    --token="$GITHUB_TOKEN" \
    --no-verbose \
    --pr-label "**Changes**" \
    --bugs-label "**Bug Fixes**" \
    --issues-label "**Closed Issues**" \
    --future-release="$NEXT" \
    --release-branch=master \
    --exclude-labels=unnecessary,duplicate,question,invalid,wontfix
}

bump() {
  last_tag=$(git tag --sort=-creatordate | head -n 1)

  printfln "$last_tag"

  echo "Bumping the version: ${last_tag} -> ${NEXT}"
  git tag "${NEXT}"
  hub release create "$NEXT" -m "$NEXT" || true
}

compare_and_release() {
  ## Compare the package.json file from published package to master branch and export
  ## value to NEXT variable if it differs.

  old_version=$(npm show @leapfrogtechnology/sync-db version)

  printfln "Old package version: ${old_version}"

  new_version=$(cat package.json | jq -r ".version")

  printfln "New package version: ${new_version}"

  NEXT=false

  if [ "$old_version" != "$new_version" ]; then
    printfln "Publishing changes to npm with version: ${new_version}"
    NEXT="v${new_version}"
  else
    printfln "Skipping publish as package version has not changed"
  fi

  if [ "$NEXT" != "false" ]; then
    # Update CHANGELOG.md
    changelog

    # Update commands and usage of CLI in README.md
    yarn doc:update

    git config --global user.email "travis@travis-ci.org"
    git config --global user.name "Travis CI"

    git add CHANGELOG.md README.md
    git commit -v -m "${NEXT} Release :tada: :fireworks: :bell:" -m "[skip ci]"

    # Add new "origin" with access token in the git URL for authentication
    git remote add lft https://leapfrogtechnology:${GITHUB_TOKEN}@github.com/leapfrogtechnology/sync-db.git
    git push lft master

    printfln "Changelog updated."

    # Bump & release tag
    bump
  fi
}

# Run command received from args.
$1
