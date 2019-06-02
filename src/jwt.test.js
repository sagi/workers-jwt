import fs from 'fs';
import * as jwt from './jwt';
import './globalThis';
import WebCrypto from 'node-webcrypto-ossl';

describe('cfw-jwt', () => {
  const crypto = new WebCrypto();
  global.Date.now = jest.fn(() => 1530518207007);

  beforeEach(() => {
    globalThis.crypto = null;
  });

  test('getToken', async () => {
    // XXX Don't worry - this service account was deleted (i.e. can't be abused).
    const sa = require('./testdata/service_account.json');
    const iat = parseInt(Date.now() / 1000);
    const exp = iat + 60 * 60;
    const iss = sa.client_email;
    const sub = sa.client_email;
    const aud = 'https://sagi.io';
    const scope = 'bla:xyz';
    const payload = { iss, sub, iat, exp, aud, scope };

    const headerAdditions = { kid: sa.private_key_id };
    const privateKeyPEM = sa.private_key;
    const token = await jwt.getToken({
      privateKeyPEM,
      payload,
      headerAdditions,
      cryptoImpl: crypto,
    });
    expect(token).toMatchSnapshot();
  });

  test('getToken; Unsupported algorithm', async () => {
    // XXX Don't worry - this service account was deleted (i.e. can't be abused).
    const sa = require('./testdata/service_account.json');
    const iat = parseInt(Date.now() / 1000);
    const exp = iat + 60 * 60;
    const iss = sa.client_email;
    const sub = sa.client_email;
    const aud = 'https://sagi.io';
    const scope = 'bla:xyz';
    const payload = { iss, sub, iat, exp, aud, scope };

    const headerAdditions = { kid: sa.private_key_id };
    const privateKeyPEM = sa.private_key;
    await expect(
      jwt.getToken({
        privateKeyPEM,
        payload,
        headerAdditions,
        cryptoImpl: crypto,
        alg: 'ES256',
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test('getToken; No crypto implementation', async () => {
    // XXX Don't worry - this service account was deleted (i.e. can't be abused).
    const sa = require('./testdata/service_account.json');
    const iat = parseInt(Date.now() / 1000);
    const exp = iat + 60 * 60;
    const iss = sa.client_email;
    const sub = sa.client_email;
    const aud = 'https://sagi.io';
    const scope = 'bla:xyz';
    const payload = { iss, sub, iat, exp, aud, scope };

    const headerAdditions = { kid: sa.private_key_id };
    const privateKeyPEM = sa.private_key;
    await expect(
      jwt.getToken({
        privateKeyPEM,
        payload,
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test('getTokenFromGCPServiceAccount', async () => {
    // XXX Don't worry - this service account was deleted (i.e. can't be abused).
    const serviceAccountJSON = require('./testdata/service_account.json');

    const aud = 'https://sagi.io';
    const scope = 'bla:xyz';

    const token = await jwt.getTokenFromGCPServiceAccount({
      serviceAccountJSON,
      aud,
      scope,
      cryptoImpl: crypto,
    });
    expect(token).toMatchSnapshot();

    const token2 = await jwt.getTokenFromGCPServiceAccount({
      serviceAccountJSON,
      aud,
      cryptoImpl: crypto,
    });
    expect(token2).toMatchSnapshot();
  });

  test('getTokenFromGCPServiceAccount; No crypto implementation', async () => {
    // XXX Don't worry - this service account was deleted (i.e. can't be abused).
    const serviceAccountJSON = require('./testdata/service_account.json');
    const aud = 'https://sagi.io';

    await expect(
      jwt.getTokenFromGCPServiceAccount({
        serviceAccountJSON,
        aud,
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
