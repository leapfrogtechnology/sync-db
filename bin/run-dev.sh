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
# Allow the CLI's node process to be able to resolve local project dependencies (development mode);
# This is important as in the DEV mode the CLI is referenced usually from outside the local project directory.
# And, the local project installation has some of the packages that the CLI needs eg: DB connectors like mssql, pg.
#
# This allows the CLI's require calls to fallback to the local packages from the PWD, if needed to be resolved.
NODE_PATH="${UPDATED_PATH}" node $BASEDIR/run
