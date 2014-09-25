#!/usr/bin/env bash

# The watchify process is started in the background. Use
# pkill -f watchify or pkill -f "node.*watchify"
# to stop them.

watchify_cmd=node_modules/watchify/bin/cmd.js

bin_path=`dirname $0`
pushd $bin_path/.. > /dev/null
mkdir dist 2> /dev/null

$watchify_cmd \
  --entry index.js \
  --outfile dist/audio.js \
  --debug \
  --verbose \
  &

popd > /dev/null
