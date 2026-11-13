#!/bin/bash

set -eo pipefail

if [ -n "$1" ] && [ "$1" != "--release" ] && [ "$1" != "--prepare-release" ]; then
  echo "Usage: ./compile.sh [--release | --prepare-release]"
  echo "  (no argument)      Build only"
  echo "  --release          Build and generate deploy/<codeName>.update.yaml from update.yaml"
  echo "  --prepare-release  Only set a new version and changelog in plugin.yaml and update.yaml"
  exit 1
fi

if [ ! -d src ] || [ ! -f plugin.yaml ]; then
  echo "Error: src/ or plugin.yaml not found"
  exit 1
fi

if [ -n "$1" ] && [ ! -f update.yaml ]; then
  echo "Error: update.yaml not found (required by $1)"
  exit 1
fi

if [ "$1" = "--prepare-release" ]; then
  current=$(sed -n "s/^version: //p" update.yaml)

  read -rp "New version (current: $current): " version
  if [[ ! $version =~ ^v?[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: version must be major.minor.patch"
    exit 1
  fi
  version="v${version#v}"

  changelog=()
  echo "Changelog entries (empty line to finish):"
  while read -rp "- " line && [ -n "$line" ]; do
    line=${line//\\/\\\\}
    changelog+=("  - \"${line//\"/\\\"}\"")
  done
  if [ ${#changelog[@]} -eq 0 ]; then
    echo "Error: changelog must not be empty"
    exit 1
  fi

  sed -i "s/^  version: .*/  version: $version/" plugin.yaml
  sed -i -e "s/^version: .*/version: $version/" -e "/^changelog:/,\$d" update.yaml
  echo "changelog:" >> update.yaml
  printf "%s\n" "${changelog[@]}" >> update.yaml

  echo "Prepared $version in plugin.yaml and update.yaml"
  exit 0
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
checksum=$(sha256sum "deploy/$codeName.zip" | cut -d" " -f1)
echo "sha256: $checksum"

if [ "$1" = "--release" ]; then
  echo "Generating deploy/$codeName.update.yaml from update.yaml..."
  sed "s/^sha256Sum: .*/sha256Sum: \"$checksum\"/" update.yaml > "deploy/$codeName.update.yaml"
else
  echo "Skipping update file generation (only needed for releases)."
  echo "Run ./compile.sh --release to also generate deploy/$codeName.update.yaml"
fi

echo "Done"