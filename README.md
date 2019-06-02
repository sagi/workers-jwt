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


## Example

Suppose you'd like to use `Firestore`'s REST API. The first step is to generate
a service account with the "Cloud Datastore User" role. Please download the
service account and store its contents in the `SERVICE_ACCOUNT_JSON_STR` environment
variable.

The `aud` is defined by GCP's [service definitions](https://github.com/googleapis/googleapis/tree/master/google)
and is simply the following concatenated string: `'https://' + SERVICE_NAME + '/' + API__NAME`.
More info [here](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#jwt-auth).

For `Firestore` the `aud` is `https://firestore.googleapis.com/google.firestore.v1.Firestore`.

## Cloudflare Workers

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
