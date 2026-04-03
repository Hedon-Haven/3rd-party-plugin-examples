#!/bin/bash

echo "Run from root directory of the plugin for correct output!"

echo "Combining into bundle.js..."
: > bundle.js

{
  for file in ./src/*.js; do
    echo "// ==== START: $file ===="
    cat "$file"
    echo -e "\n// ==== END: $file ====\n"
  done
} >> bundle.js

echo "Compressing into plugin.zip..."
rm plugin.zip
zip -r plugin.zip src/ bundle.js plugin.yaml

echo "Done"