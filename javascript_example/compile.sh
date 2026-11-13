#!/bin/bash

set -eo pipefail

if [ ! -d src ] || [ ! -f plugin.yaml ]; then
  echo "Error: src/ or plugin.yaml not found"
  exit 1
fi

codeName=$(sed -n "s/^  codeName: \"\(.*\)\"/\1/p" plugin.yaml)
echo "Starting build for $codeName"

echo "Cleaning build and deploy directories..."
rm -rf build deploy
mkdir build deploy

echo "Combining into build/bundle.js..."
{
  for file in ./src/*.js; do
    echo "// ==== START: $file ===="
    cat "$file"
    echo -e "\n// ==== END: $file ====\n"
  done
} > build/bundle.js

echo "Compressing into deploy/$codeName.zip..."
# Set timestamps to 0 unix time for all files to achieve reproducible zip
touch -d "@0" ./plugin.yaml ./compile.sh ./build/bundle.js
find ./src -exec touch -d "@0" {} \;
zip -X -r "deploy/$codeName.zip" src/ compile.sh plugin.yaml
# The host expects bundle.js in the zip root
zip -X -j "deploy/$codeName.zip" build/bundle.js

echo "Calculating sha256 checksum..."
sha256sum "deploy/$codeName.zip"

echo "Done"