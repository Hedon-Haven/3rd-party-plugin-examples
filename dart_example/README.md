# WORK IN PROGRESS! DO NOT USE YET!

# Dart example 3rd party plugin

Example of a 3rd party plugin written in dart and compiled to js.

## How to use

1. Write your code in `main.dart`. You may also create additional folders or .dart files and import
   them in main.dart. Make sure that at the end all functions inside `main.dart` are implemented
2. **Do not** edit wrapper.dart or bridge-functions.js
>  TODO: Simplify deployment instructions by creating a better compile script
3. Bump the version in plugin.yaml
4. Run `src/compile.sh` to compile into a ready-to-deploy plugin.zip
5. Bump version in update.yaml, paste the sha256sum of the zip and add a changelog
6. Deploy the plugin.zip and update.yaml to your release channel