# esbuild-ajv

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![MIT License][license-image]][license-url]

This package provides a plugin for esbuild to pre-compile Ajv schemas at build time.

**Table of Contents**

- [Installation](#installation)
- [Use-cases](#use-cases)
- [Usage](#usage)
  - [Build config](#build-config)
  - [Precompile imported schema](#precompile-imported-schema)
- [Running Tests](#running-tests)

## Installation

Install using the node package registry:

```bash
npm install -D esbuild-ajv ajv
```

## Use-cases

**The motivation to pre-compile schemas<sup>[1](#ref-1)</sup>:**

- avoids dynamic code evaluation with Function constructor (used for schema
  compilation) - _useful in browser environments where `'unsafe-eval'` is not
  allowed by CSP (Content Security Policy)_
- faster startup times
- lower memory footprint/bundle size
- compatible with strict content security policies
- almost no risk to compile schema more than once
- better for short-lived environments

## Usage

### Build config

```ts
import esbuild from 'esbuild'
import AjvPlugin from 'esbuild-ajv'

esbuild.build({
  /* ... */
  plugins: [
    AjvPlugin({
      extraKeywords: [
        /* Ajv.CodeKeywordDefinition */
      ],
      ajvOptions: {
        coerceTypes: true,
      },
    }),
  ],
  /* ... */
})
```

### Precompile imported schema

```js
import * as validationModule from './someJsonSchema.ajv.json'

/**
 * @description use compiled schema in your code
 */
const validate = (x) => {
  const { validator } = validationModule
  if (!validator(x)) throw validator.errors
  return x
}
```

## Running Tests

The tests use mocha, istanbul and mochawesome. Run them using the node test script:

```bash
npm test
```

## References

- <b name="ref-1">[1]</b>: _Standalone Validation Code_ in _Ajv documentation_
  https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code

[npm-image]: https://img.shields.io/npm/v/esbuild-ajv.svg?style=flat
[npm-url]: https://npmjs.org/package/esbuild-ajv
[downloads-image]: http://img.shields.io/npm/dm/esbuild-ajv.svg?style=flat
[downloads-url]: https://img.shields.io/npm/dm/esbuild-ajv.svg
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[license-url]: LICENSE
[snyk-image]: https://snyk.io/test/github/srax47/esbuild-ajv/badge.svg?targetFile=package.json
[snyk-url]: https://snyk.io/test/github/srax47/esbuild-ajv?targetFile=package.json
