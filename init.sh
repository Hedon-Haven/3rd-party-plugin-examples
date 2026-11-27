#!/bin/bash

set -eo pipefail

languages=("JavaScript" "Dart" "TypeScript")
folders=("javascript_example" "dart_example" "typescript_example")


echo "Available languages:"
for i in "${!languages[@]}"; do
  echo "  $((i + 1))) ${languages[$i]}"
done
read -rp "Language number: " choice
if [[ ! $choice =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt ${#folders[@]} ]; then
  echo "Error: invalid choice"
  exit 1
fi
lang=${folders[$((choice - 1))]}

read -rp "Plugin codeName (e.g. com.myname.myplugin): " codeName
if [[ ! $codeName =~ ^[a-z0-9]([a-z0-9_]*[a-z0-9])?(\.[a-z0-9]([a-z0-9_]*[a-z0-9])?){2}$ ]]; then
  echo "Error: codeName must be exactly 3 lowercase segments separated by dots (a-z, 0-9, inner _)"
  exit 1
fi
if [[ $codeName == com.hedon_haven.* ]]; then
  echo "Error: com.hedon_haven is reserved for bundled plugins"
  exit 1
fi


echo
echo "Overview:"
echo "  Language: ${languages[$((choice - 1))]}"
echo "  codeName: $codeName"
echo "Other languages and unneeded files in this repo will be deleted."
read -rp "Continue? [Y/n] " confirm
if [ -n "$confirm" ] && [[ $confirm != [yY] ]]; then
  echo "Aborted"
  exit 1
fi

others=()
for folder in "${folders[@]}"; do
  if [ "$folder" != "$lang" ]; then
    others+=("$folder")
  fi
done

echo "Moving $lang to the repo root..."
shopt -s dotglob
mv -f "$lang"/* .
rmdir "$lang"
for other in "${others[@]}"; do
  rm -rf "$other"
done

echo "Replacing codeName..."
oldCodeName=$(sed -n "s/^  codeName: \"\(.*\)\"/\1/p" plugin.yaml)
{ grep -rlF --exclude-dir=.dart_tool --exclude-dir=node_modules "$oldCodeName" src || true; } | xargs -r sed -i "s/$oldCodeName/$codeName/g"
if [ -f src/pubspec.yaml ]; then
  sed -i "s/^name: .*/name: ${codeName//./_}/" src/pubspec.yaml
fi

echo "Installing plugin.yaml and update.yaml templates..."
mv -f templates/plugin.yaml templates/update.yaml .
sed -i "s/^  codeName: .*/  codeName: \"$codeName\"/" plugin.yaml

echo "Installing workflows..."
rm -f .github/workflows/*
mv templates/build-release.yml templates/test-plugin.yml .github/workflows/
rm -rf templates

echo "Done. Follow the remaining steps in TEMPLATE_README.md"
rm -- "$0"