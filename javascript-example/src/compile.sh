#!/bin/bash

echo "Run from root directory of the plugin for correct output"
echo "Compiling into bundle.js..."

output="bundle.js"
: > "$output"

{
  for file in ./src/*.js; do
    echo "// ==== START: $file ===="
    cat "$file"
    echo -e "\n// ==== END: $file ====\n"
  done
} >> "$output"

echo "Compressing into plugin.zip..."
rm plugin.zip
zip -r plugin.zip . -x "*.zip"

echo "Done"