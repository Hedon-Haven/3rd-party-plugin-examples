# Dart example 3rd party plugin

> [!WARNING]
> WIP! DO NOT FOLLOW THESE INSTRUCTIONS YET! If you would like to create a 3rd party plugin,
> please [contact me](mailto:contact@hedon-haven.top) first!

Example of a 3rd party plugin written in Dart and compiled to JavaScript.

## How to use

1. Write your code in `main.dart`. You may also create additional folders or `.dart` files and
   import them in `main.dart`. Make sure that at the end all functions inside `main.dart` are
   implemented.
2. **Do not** edit or delete `wrapper.dart` and `bridge_functions.js`!
3. Build the plugin with `bash build.sh`.
4. Test in the app: install the zip from `deploy/` in the Hedon Haven app.
5. To publish the plugin, follow the "Releasing" section in `TEMPLATE_README.md`.

## Caveats

The plugin runs in a QuickJS JavaScript runtime. `build.sh` compiles the Dart code into a single
JavaScript file (`bundle.js`).

- Packages from pub.dev can be added to the `pubspec.yaml` in `src/`, `build.sh` will fetch them.
- Packages and any other code in the plugin ship inside the plugin zip. Make sure that all of them
  are used in line with their licenses.