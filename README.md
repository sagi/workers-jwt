# cfw-jwt

[`@sagi.io/cfw-jwt`](https://www.npmjs.com/package/@sagi.io/cfw-jwt) helps you
generate a `JWT` on Cloudflare Workers with the WebCrypto API. Helper function for GCP Service Accounts included.


[![CircleCI](https://circleci.com/gh/sagi/cfw-jwt.svg?style=svg)](https://circleci.com/gh/cfw-jwt)
[![Coverage Status](https://coveralls.io/repos/github/sagi/cfw-jwt/badge.svg?branch=master)](https://coveralls.io/github/sagi/cfw-jwt?branch=master)
[![MIT License](https://img.shields.io/npm/l/@sagi.io/cfw-jwt.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![version](https://img.shields.io/npm/v/@sagi.io/cfw-jwt.svg?style=flat-square)](http://npm.im/@sagi.io/cfw-jwt)

## Installation

~~~
$ npm i @sagi.io/cfw-jwt
~~~

## API

We currently expose two methods: `getToken` for general purpose `JWT` generation
and `getTokenFromGCPServiceAccount` for `JWT` generation using a `GCP` service account.

### **`getToken({ ... })`**

Function definition:

```js
const getToken = async ({
  privateKeyPEM,
  payload,
  alg = 'RS256',
  cryptoImppl = null,
  headerAdditions = {},
}) => { ... }
```

Where:

  - `privateKeyPEM` is a the private key `string` in `PEM` format.
  - `payload` is the `JSON` payload to be signed, i.e. the `{ aud, iat, exp, iss, sub, scope, ... }`.
  - `alg` is the signing algorithm as defined in [`RFC7518`](https://tools.ietf.org/html/rfc7518#section-3.1), currently only `RS256` is supported.
  - `cryptoImpl` is a `WebCrypto` `API` implementation. Cloudflare Workers support `WebCrypto` out of the box. For `Node.js` you can use [`node-webcrypto-ossl`](https://github.com/PeculiarVentures/node-webcrypto-ossl) - see examples below and in the tests.
  - `headerAdditions` is an object with keys and string values to be added to the header of the `JWT`.

### **`getTokenFromGCPServiceAccount({ ... })`**

Function definition:

```js
const getTokenFromGCPServiceAccount = async ({
  serviceAccountJSON,
  alg = 'RS256',
  cryptoImppl = null,
  expiredAfter = 3600,
  headerAdditions = {},
  payloadAdditions = {}
}) => { ... }
```

## Example

Suppose you'd like to use `Firestore`'s REST API. The first step is to generate
a service account with the "Cloud Datastore User" role. Please download the
service account and store its contents in the `SERVICE_ACCOUNT_JSON_STR` environment
variable.

The `aud` is defined by GCP's [service definitions](https://github.com/googleapis/googleapis/tree/master/google)
and is simply the following concatenated string: `'https://' + SERVICE_NAME + '/' + API__NAME`.
More info [here](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#jwt-auth).

For `Firestore` the `aud` is `https://firestore.googleapis.com/google.firestore.v1.Firestore`.

## Cloudflare Workers Usage

Cloudflare Workers expose the `crypto` global for the `Web Crypto API`.

~~~js
const jwt = require('@sagi.io/cfw-jwt')

const serviceAccountJsonStr = await ENVIRONMENT.get('SERVICE_ACCOUNT_JSON_STR', 'text')
const aud = `https://firestore.googleapis.com/google.firestore.v1.Firestore`

const token = await jwt(serviceAccountJsonStr, aud, crypto)

const headers = { Authorization: `Bearer ${token}` }

const projectId = 'example-project'
const collection = 'exampleCol'
const document = 'exampleDoc'

const docUrl =
  `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`
  + `/${collection}/${document}`

const response = await fetch(docUrl, { headers })

const documentObj =  await response.json()
~~~

## Node

We use the `node-webcrypto-ossl` package to imitate the `Web Crypto API` in Node.

~~~js
const WebCrypto = require('node-webcrypto-ossl');
const crypto = new WebCrypto();

<... SAME AS CLOUDFLARE WORKERS ...>
~~~
