#!/bin/bash

set -eo pipefail

if [ ! -f test_map.yaml ]; then
  echo "Error: test_map.yaml not found"
  exit 1
fi

root=$(pwd)
hedonHavenDir="$root/hedon-haven"
codeName=$(sed -n "s/^  codeName: \"\(.*\)\"/\1/p" plugin.yaml)

if [ -d "$hedonHavenDir/.git" ]; then
  echo "Updating Hedon-Haven in $hedonHavenDir..."
  git -C "$hedonHavenDir" pull --ff-only
else
  echo "Cloning Hedon-Haven into $hedonHavenDir..."
  git clone --depth=1 https://github.com/Hedon-Haven/Hedon-Haven "$hedonHavenDir"
fi

echo "Building plugin.zip..."
./build.sh

echo "Unpacking deploy/$codeName.zip..."
rm -rf build/test_plugin
unzip -q "deploy/$codeName.zip" -d build/test_plugin

echo "Prepping flutter and building native libs..."
cd "$hedonHavenDir"
flutter pub get
# Generates the mocks needed by the tests
flutter pub run build_runner build
# Builds the native libs the tests need
flutter build linux

release="$hedonHavenDir/build/linux/x64/release"
export LD_LIBRARY_PATH="$release/bundle/lib:$release/plugins/flutter_js/bundle/lib:$LD_LIBRARY_PATH"

echo "Running plugin tests..."
status=0
PLUGIN_PATH="$root/build/test_plugin" PLUGIN_TEST_MAP="$root/test_map.yaml" \
  flutter test --no-pub test/plugin_test.dart "$@" || status=$?

echo "Copying dumps to $root/dumps..."
rm -rf "$root/dumps"
[ -d dumps ] && cp -r dumps "$root/dumps"

exit $status
