#!/usr/bin/env bash

browserify_cmd=node_modules/browserify/bin/cmd.js

bin_path=`dirname $0`
pushd $bin_path/.. > /dev/null
mkdir dist 2> /dev/null

$browserify_cmd \
  --entry index.js \
  --outfile dist/audio.js \
  --debug \
  --verbose

popd > /dev/null
