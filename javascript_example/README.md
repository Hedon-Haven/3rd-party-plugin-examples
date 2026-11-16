# JavaScript example 3rd party plugin

> [!WARNING]
> WIP! DO NOT FOLLOW THESE INSTRUCTIONS YET! If you would like to create a 3rd party plugin,
> please [contact me](mailto:contact@hedon-haven.top) first!

Example of a 3rd party plugin written in raw JavaScript.

## How to use

1. Write your code in `.js` files anywhere in `src/`, in any folder structure.
2. **Do not** edit or delete `wrapper.js` and `bridge_functions.js`!
3. Build the plugin with `bash build.sh`.
4. Test in the app: install the zip from `deploy/` in the Hedon Haven app.
5. To publish the plugin, follow the "Releasing" section in `TEMPLATE_README.md`.

## Caveats

The plugin runs in a QuickJS JavaScript runtime. `build.sh` does not use a module system or a
bundler, it simply joins all `.js` files in `src/` and its subfolders into a single script
(`bundle.js`), in alphabetical order of their paths. This has some consequences:

- `import` and `export` cannot be used. Files do not need them, as everything ends up in the same
  script.
- All top-level names (functions, classes, constants) share one global scope. Names must be unique
  across all files.
- Functions can be used before the line that defines them, even across files. Top-level `const` and
  `class` declarations can not. If one is used while the script loads, and not only when a function
  runs later, the file that declares it has to come first alphabetically.
- npm packages cannot be installed or imported, as there is no module system or bundler. A library
  can only be used by copying a standalone build of it into `src/`, as a plain script without
  `import`, `export` or `require`. Libraries that need Node.js or browser APIs may not work in
  QuickJS.
- Libraries copied into `src/` ship inside the plugin zip. Make sure that all of them are used in
  line with their licenses.