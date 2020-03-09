#!/bin/sh

# Get the local node_modules path;
# if NODE_PATH is already set, append it to the existing value.
if [ -n "$NODE_PATH" ]; then
  UPDATED_PATH="${NODE_PATH}:${PWD}/node_modules"
else
  UPDATED_PATH="${PWD}/node_modules"
fi

BASEDIR=$(dirname "$0")

# Run the CLI with NODE_PATH env variable including the path to
# the local project's node_modules (from the current working directory).
#
# Use-case:
# The main reason for this is to allow the CLI's node process
# to be able to resolve local project dependencies;
# this is important when the CLI is installed globally and
# the local project installation has some of the packages that the CLI needs.
# For eg: if the local project has mssql package installed and the CLI is invoked globally.
#
# This allows the CLI's require calls to fallback to the local dependencies if needed.
NODE_PATH="${UPDATED_PATH}" node $BASEDIR/run.js
