# TypeScript example 3rd party plugin

> [!WARNING]
> WIP! DO NOT FOLLOW THESE INSTRUCTIONS YET! If you would like to create a 3rd party plugin,
> please [contact me](mailto:contact@hedon-haven.top) first!

Example of a 3rd party plugin written in TypeScript and compiled to JavaScript.

## How to use

1. Install [Node.js](https://nodejs.org) (includes `npm`).
2. Write your code in `.ts` files anywhere in `src/`, in any folder structure. Implement all
   functions of the `plugin` object in `main.ts`, the compiler reports any missing ones.
3. **Do not** edit or delete `wrapper.ts`, `bridge_functions.js` and `bridge_functions.d.ts`!
4. Build the plugin with `bash build.sh`. A type error fails the build.
5. Test in the app: install the zip from `deploy/` in the Hedon Haven app.
6. To publish the plugin, follow the "Releasing" section in `TEMPLATE_README.md`.

## Caveats

The plugin runs in a QuickJS JavaScript runtime. `build.sh` type-checks and compiles the code with
`tsc`, then joins `bridge_functions.js` and the resulting `.js` files into a single script
(`bundle.js`), the latter in alphabetical order of their paths. `tsc` cannot bundle files itself.
This has some consequences:

- `import` and `export` cannot be used. Files do not need them, as everything ends up in the same
  script. A file that uses them is compiled as a module and breaks the build output.
- All top-level names (functions, classes, constants, types) share one global scope. Names must be
  unique across all files.
- Top-level `const` and `class` declarations can not be used before the line that defines them. If
  one is used while the script loads, and not only when a function runs later, the file that
  declares it has to come first alphabetically.
- The runtime has no DOM or Node.js APIs. Only the globals declared in `bridge_functions.d.ts` and
  the standard JavaScript library (ES2020) can be used.
- npm packages cannot be imported, as there is no module system or bundler. Packages can only be
  used for types (e.g. `@types/...` in `devDependencies`), or as standalone scripts copied into
  `src/`.
- Everything in `src/` ships inside the plugin zip, except `node_modules`. Make sure that all code
  is used in line with its license.
