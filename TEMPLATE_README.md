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
4. Fill in `test_map.yaml` with test cases for the provider, see [Testing](#testing).
5. Once the plugin is ready to publish, see [Releasing](#releasing).
6. (Optional) After the first release, email `contact@hedon-haven.top` with the subject:
   `Add "provider name" plugin to official list` to have the plugin linked on the official website.

## Testing

`test_map.yaml` still contains the example values. Replace them with test cases for the plugin's
provider. All keys are explained in the
[test map documentation](https://docs.hedon-haven.top/plugin-test-map.md).

- Locally (Linux x86_64 only): install the
  [flutter sdk](https://docs.flutter.dev/get-started/install) and run `./test.sh`, which downloads
  the tests from the latest Hedon-Haven release. To run only some tests, add `--name <regex>`, e.g. `./test.sh --name getComments`.
- On GitHub: the `Test plugin` action runs automatically every day at 00:00 UTC. It can also be
  run manually. To change or disable the schedule, edit `.github/workflows/test-plugin.yml`.

`./test.sh` builds the plugin and tests it with the tests of the latest Hedon-Haven release, using
the test cases in `test_map.yaml`. Dumps of all requests and results are written to `dumps/`.

To run without downloading, set `HEDON_HAVEN_TESTS_DIR` to a local directory with the contents of
`plugin-tests-linux-x86_64.tar.gz` from a Hedon-Haven release: `lib/`, `test/`, `assets/`,
`pubspec.yaml`, `pubspec.lock` and `natives/` (all native libs, flat).

## Releasing

1. Run `./build.sh --prepare-release` locally. It asks for the new version and a changelog and
   updates all files that need them automatically.
2. Commit and push.
3. Publish:
    - On GitHub: run the `Build release` action. It builds the plugin and publishes the release
      automatically.
    - Elsewhere: run `./build.sh --release` and upload all files from `deploy/` to a host.