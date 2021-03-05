#!/bin/bash

## Compare the package.json file from PR branch to master branch and export value to NEXT variable
## if differs else NEXT=false

set -e

printfln() {
  printf "\n$1\n"
}

git fetch --all
git checkout master

old_version=$(cat package.json | jq -r ".version")

printfln "Old package version: ${old_version}"

latest_commit_hash=$(git rev-parse HEAD)
printfln "Latest commit hash: ${latest_commit_hash}"
data=$(hub api -H "Accept: application/vnd.github.groot-preview+json" /repos/leapfrogtechnology/sync-db/commits/"${latest_commit_hash}"/pulls) || true

pr_branch_name=$(echo "$data" | jq -r ".[0].head.ref")

printfln "PR branch name: ${pr_branch_name}"

new_version=$(git checkout ${pr_branch_name} &> /dev/null && \
  cat package.json | jq -r ".version")

printfln "Old package version: ${new_version}"

if [ "$old_version" != "$new_version" ]; then

  printfln "Publishing changes to npm with version: ${new_version}."
  export NEXT=${new_version}
else
  export NEXT=false
fi

printfln "Value of NEXT is: ${NEXT}."

