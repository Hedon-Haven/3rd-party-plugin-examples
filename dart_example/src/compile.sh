#!/bin/bash

echo "Run from root directory of the plugin for correct output!"

echo "Compiling dart code to js..."
dart compile js ./src/lib/wrapper.dart -O4 -o ./src/lib/compiled-dart.js

echo "Combining into bundle.js..."
: > bundle.js
{
  echo "// ==== START: bridge-functions.js ===="
  cat src/lib/bridge-functions.js
  echo -e "\n// ==== END: bridge-functions.js ====\n"

  echo "// ==== START: compiled-dart.js ===="
  cat ./src/lib/compiled-dart.js
  echo -e "\n// ==== END: compiled-dart.js ====\n"
} > bundle.js

echo "Compressing into plugin.zip..."
rm plugin.zip
# Set timestamps to 0 unix time for all files to achieve reproducible zip
touch -d "@0" ./plugin.yaml ./bundle.js
find ./src -exec touch -d "@0" {} \;
zip -X -r plugin.zip src/ bundle.js plugin.yaml -x "src/.dart_tool/*"

echo "Done"