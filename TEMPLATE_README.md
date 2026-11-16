# 3rd-party-plugin-examples

> [!WARNING]
> WIP! DO NOT FOLLOW THESE INSTRUCTIONS YET! If you would like to create a 3rd party plugin,
> please [contact me](mailto:contact@hedon-haven.top) first!


Template repo for creating third party plugins for Hedon Haven.

Supported languages:

* Dart
* JavaScript
* TypeScript (coming soon)

> Third party plugins run in a QuickJS JavaScript runtime. In theory, any language that can run in
> QuickJS (e.g. by transpiling to JavaScript) should work too.

## Quick start

1. Create a new repo from this template, clone it and run `./init.sh` locally. It sets up the
   repo for the plugin.
2. Fill in `plugin.yaml`. Every value that must be set is commented out. All keys are explained in
   the [plugin.yaml documentation](https://docs.hedon-haven.top/plugin-yaml.md).
3. Follow the instructions in the `README.md` of the chosen language.
4. Once the plugin is ready to publish, see [Releasing](#releasing).
5. (Optional) After the first release, email `contact@hedon-haven.top` with the subject:
   `Add "provider name" plugin to official list` to have the plugin linked on the official website.

## Testing

TBD

## Releasing

1. Run `./build.sh --prepare-release` locally. It asks for the new version and a changelog and
   updates all files that need them automatically.
2. Commit and push.
3. Publish:
    - On GitHub: run the `Build release` action. It builds the plugin and publishes the release
      automatically.
    - Elsewhere: run `./build.sh --release` and upload all files from `deploy/` to a host.