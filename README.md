# `biome migrate eslint` drops `eqeqeq`'s null checks

Repro for [biomejs/biome#12374](https://github.com/biomejs/biome/issues/12374).

ESLint's `eqeqeq` (default `"always"`) also flags `x == null`. `biome migrate eslint` turns it into a plain
`noDoubleEquals`, which keeps `ignoreNull: true`, so after migrating, `x == null` isn't reported anymore.

## Steps

```sh
npm install
npm run migrate   # biome migrate eslint --write
npm run lint      # biome lint src
npm run eslint    # eslint src, to compare
```

`eslint.config.mjs` is just:

```js
export default [{ rules: { eqeqeq: "error" } }];
```

and `src/index.js`:

```js
export function f(a, b, x) {
  if (typeof a == "object" && typeof b == "object") return 1;
  if (x == null) return 2;
  return 3;
}
```

## What happens

`npm run migrate` adds this to `biome.json`:

```json
"suspicious": { "noDoubleEquals": "error" }
```

`npm run lint` then reports the two `==` on line 2, but not `x == null` on line 3 ("== is only allowed when
comparing against null"). `npm run eslint` reports all three (2:16, 2:40 and 3:9).

## What I expected

Since ESLint's default flags `== null` too, I'd expect the migration to write:

```json
"noDoubleEquals": { "level": "error", "options": { "ignoreNull": false } }
```

With that in `biome.json`, Biome reports 3:9 as well and matches ESLint.

`["error", "always", { "null": "ignore" }]` and `["error", "smart"]` migrate to the same plain
`"noDoubleEquals": "error"`. For those, `ignoreNull: true` is right (or the closest Biome has), so it's only the
default `"always"` that loses checks.

Tested with Biome 2.5.15, ESLint 10.12.0 and Node 22.
