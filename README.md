# Homebrew tap for Esfera

```sh
brew install orbitspatial/esfera/esfera
```

That installs `esfera`, the command-line tool for the [Esfera Converter API](https://developers.esfera.audio): sign in, convert a spatial audio master or a folder of them to IAMF / Eclipsa, and check usage. You need an API key from the [Esfera Console](https://console.esfera.audio).

Prefer npm? `npm install -g @esfera/cli` installs the same thing.

## How this tap updates

The formula installs the published [`@esfera/cli`](https://www.npmjs.com/package/@esfera/cli) package from npm, which is built from [orbitspatial/esfera-js](https://github.com/orbitspatial/esfera-js). Every three hours, `.github/workflows/bump.yml` looks for a newer release, installs and tests it on macOS, and commits the new formula if it passes.

A new release reaches Homebrew about a day after it reaches npm. Homebrew won't install npm packages published less than a day ago, so the tap waits rather than pointing at a version that can't be installed yet.

Bugs in the CLI itself: [esfera-js issues](https://github.com/orbitspatial/esfera-js/issues). Account or conversion questions: support@esfera.audio.

## Licence

Apache-2.0. See [LICENSE](LICENSE).
