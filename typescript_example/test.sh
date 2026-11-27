#!/bin/bash

set -eo pipefail

if [ "$(uname -s)" != "Linux" ] || [ "$(uname -m)" != "x86_64" ]; then
  echo "Error: only x86_64 linux is supported. Use the Test plugin GitHub action, WSL or a VM"
  exit 1
fi

if [ ! -f test_map.yaml ]; then
  echo "Error: test_map.yaml not found"
  exit 1
fi

root=$(pwd)
testsDir="$root/hedon-haven-tests"
codeName=$(sed -n "s/^  codeName: \"\(.*\)\"/\1/p" plugin.yaml)

# Set HEDON_HAVEN_TESTS_DIR to use a local dir instead of downloading the latest release.
# It must contain the contents of plugin-tests-linux-x86_64.tar.gz:
#   lib/, test/, assets/, pubspec.yaml, pubspec.lock and natives/ (all native libs, flat)
if [ -n "$HEDON_HAVEN_TESTS_DIR" ]; then
  testsDir=$(realpath "$HEDON_HAVEN_TESTS_DIR")
  echo "Using plugin tests from $testsDir"
else
  echo "Downloading plugin tests from the latest Hedon-Haven release..."
  tag=$(curl -fsSL https://changelog.hedon-haven.top/latest)
  url="https://download.hedon-haven.top/$tag/plugin-tests-linux-x86_64.tar.gz"
  # The url contains the release tag, so an unchanged url means the tests are up to date
  if [ "$(cat "$testsDir/.url" 2>/dev/null)" = "$url" ]; then
    echo "Plugin tests are already up to date"
  else
    rm -rf "$testsDir"
    mkdir "$testsDir"
    curl -fsSL "$url" | tar -xz -C "$testsDir"
    echo "$url" > "$testsDir/.url"
  fi
fi

echo "Building plugin.zip..."
./build.sh

echo "Unpacking deploy/$codeName.zip..."
rm -rf build/test_plugin
unzip -q "deploy/$codeName.zip" -d build/test_plugin

echo "Running plugin tests..."
cd "$testsDir"
flutter pub get
export LD_LIBRARY_PATH="$testsDir/natives:$LD_LIBRARY_PATH"
status=0
PLUGIN_PATH="$root/build/test_plugin" PLUGIN_TEST_MAP="$root/test_map.yaml" \
  flutter test --no-pub test/plugin_test.dart "$@" || status=$?

echo "Copying dumps to $root/dumps..."
rm -rf "$root/dumps"
[ -d dumps ] && cp -r dumps "$root/dumps"

exit $status
