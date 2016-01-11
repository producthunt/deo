# deo

[![npm version](https://img.shields.io/npm/v/deo.svg)](https://www.npmjs.com/package/deo) [![License](https://img.shields.io/npm/l/deo.svg)](https://www.npmjs.com/package/deo) [![Build Status](https://travis-ci.org/producthunt/deo.svg)](https://travis-ci.org/producthunt/deo)

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

Let's start with the following simple express app:

```js
import express from 'express'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cookieParser(process.env.SECRET))

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(process.env.PORT, process.env.HOSTNAME)
```

The app requires you to specify:

- cookie secret
- port
- hostname

This is very obvious, since our app is quite simple and just in a single file.
Let's say we decided to refactor it a little bit and extract the configurations
into another file, since a couple of weeks later, the app config is all over the
place:

`config.js`:
```js
export default {
  port: process.env.PORT,
  hostname: process.env.HOSTNAME,
  secret: process.env.SECRET,
}
```

And then our app becomes:

```js
import config from './config'

// ...

app.use(cookieParser(config.secret))

// ...

app.listen(config.port, config.hostname)
```

Very nice! However, what if we want to enforce the presence of let's say secret?
Easy!

```js
const secret = process.env.SECRET;

if (!secret) throw new Error('oops, secret is required!')

export default {
  port: process.env.PORT,
  hostname: process.env.HOSTNAME,
  secret,
}
```

OK... so, we solve this issue, but now we have to remember to do it for every single
required entry...

A couple of week later happily using our config, it turns out that the
`process.env.SECRET` on staging is not what we have configured. We start
investigating and we find the following code:

```js
// NOTE: temporairly override for testing
config.secret = 'test';
```

Oh, boy! How did we commit that without noticing? We are now eager to fix this
issue by making our config immutable:

```js
const secret = process.env.SECRET;

if (!secret) throw new Error('oops, secret is required!')

const config = {
  secret,
  port: process.env.PORT,
  hostname: process.env.HOSTNAME,
}

Object.freeze(config)

export default config
```

Woohoo! We just resolved our issue... except, we totally forgot that
`Object.freeze` is shallow, and if we add another object inside `config`
it will not be frozen. Duh...

Here is how we can replace our implementation with `deo`, that will take care of
immutability, constancy and will force us to set all config entires:

```js
export default deo({
  server: {
    hostname: 'localhost', // default value, replace with the SERVER_HOSTNAME env var
    port: 4000, // default value, replace with the SERVER_PORT env var
  },
  secret: null, // no default, it will force us to set it, otherwise will throw
})
```

And our app:

```js
import config from './config'

// ...

app.use(cookieParser(config('secret')))

// ...

app.listen(config('server.port'), config('server.host'))
```

And that's it, we are good to go!

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

[![Product Hunt](http://i.imgur.com/dtAr7wC.png)](https://www.producthunt.com)

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
