# deo

[![npm version](https://img.shields.io/npm/v/deo.svg)](https://www.npmjs.com/package/deo) [![License](https://img.shields.io/npm/l/deo.svg)](https://www.npmjs.com/package/deo) [![Build Status](https://travis-ci.org/vesln/deo.svg)](https://travis-ci.org/vesln/deo)

Minimalistic, safe and easy to use 12factor config manager for Node.js

## Table of Contents

  1. [Installation](#installation)
  1. [Motivation](#motivation)
  1. [Usage](#usage)
  1. [Spec](#spec)
  1. [Development](#development)
  1. [Contributing](#contributing)
  1. [License](#license)

## Installation

```
$ npm install deo --save
```

## Motivation

> The twelve-factor app stores config in environment variables (often shortened
> to env vars or env). Env vars are easy to change between deploys without
> changing any code; unlike config files, there is little chance of them being
> checked into the code repo accidentally; and unlike custom config files, or
> other config mechanisms such as Java System Properties, they are a language-
> and OS-agnostic standard.

However, there are a couple of things you must consider before you start
referring to `process.env` all over the place:

- Spreading the knowledge on where your config values are coming from is not great. Ideally, we want to encapsulate this in a single place.
- `process.env` does not guarantee that the given environment variable will exist, you have to do this manually
- People often end up with `.env.example` files, documents describing everything
  that needs to be set so you can run the app etc.
- Some config values are almost static, they are not sensitive, they do not change
  in the different environments, however we still refer to them as config. So we
  end up either putting them inside the env vars or creating a different "special" config objects

`deo` can will help you deal with those problems and more. Here is how:

- Safe by design: every specified config entry must be set, otherwise it will
  throw an exception
- It makes the entire config immutable, therefore you cannot incidentally
  reassign a config value. Trying to do so will result in an exception.
- Encapsulates the knowledge about where your config data is coming from.
- It comes with a minimalistic API, there is only one function that you can
  call, therefore it's very easy to stub/mock or replace, if necessary, with an alternative solution

## Usage

Here is how you can use it in a simple express app:

`config.js`:

```js
import deo from 'deo'

export default deo({
  server: {
    hostname: 'vesln.local',
    port: null // you must set a PORT env variable, otherwise deo will throw
  }
})
```

`app.js`:

```js
import express from 'express'
import config from './config'

const app = express()

app.listen(config('server.port'), config('server.hostname'))
```

Run the app:

```shell
$ PORT=4000 node index
```

**`deo` also works great with envc, dotenv and other `.env` file loaders**:

`.env`:

```shell
PORT=4000
```

`index.js`:

```js
import envc from 'envc'

envc() // this will load .env in `process.env`

const config = deo({
  port: 3000
})

console.log(config('port')) // => 4000
```

Start the app:

```js
$ SECRET=secure node index
```

**You can also provide a custom env object different from process.env:**

```js
const customEnv = {
  FOO: 3,
}

const config = deo({
  foo: 0,
}, customEnv)

console.log(config('foo')) // => 3
```

## Development

#### Setup

```shell
$ git clone <this repo>
$ cd deo
$ npm install
```

#### Tests

Linters:

```shell
$ npm run test:lint
```

Tests:

```shell
$ npm run test:tests
```

All:

```shell
$ npm test
```

## Contributing

Bug reports and pull requests are welcome on GitHub. This project is intended to be a
safe, welcoming space for collaboration, and contributors are expected to adhere
to the [Contributor Covenant](http://contributor-covenant.org/) code of conduct.

## License

```
 _________________
< The MIT License >
 -----------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```
