# WORK IN PROGRESS! DO NOT USE YET!

# JavaScript example 3rd party plugin

Example of a 3rd party plugin written in raw JavaScript.

## How to use

1. Write your code in src/*.js
2. **Do not** edit wrapper.js or bridge_functions.js
3. Run `./build.sh` to build the plugin zip into `deploy/` and test it
4. To release, run `./build.sh --prepare-release` and enter the new version and changelog. This
   updates `plugin.yaml` and `update.yaml`
5. Run `./build.sh --release`. It builds again and also generates
   `deploy/<codeName>.update.yaml` with the zip's checksum
6. Upload everything in `deploy/` to your release channel