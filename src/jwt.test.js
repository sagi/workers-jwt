import fs from 'fs';
import * as jwt from './jwt';
import * as utils from './utils';
import '@sagi.io/globalthis';
import { Base64 } from 'js-base64';

describe('workers-jwt', () => {
  const cryptoImpl = require('crypto').webcrypto;
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
      cryptoImpl,
    });
    expect(token).toMatchSnapshot();
  });

  test.skip('getToken; ES256', async () => {
    // XXX Don't worry - this key was randomly generated with:
    // $ openssl ecparam -name secp256r1 -genkey
    const privateKeyPEM = `-----BEGIN PRIVATE KEY-----
    MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgjnXNC9pkNUldJ24k
    FaqSJlJxEPpWyA4zwzwwJFFswx+hRANCAASd0uVJpD8DYV5+/G0R3Z3A1STknuF8
    kYSh/fnRTRSgI9LgxUSZ2GtGm6HMVCRsoF0C9px9BRRpuIX8dbe0iiFJ
    -----END PRIVATE KEY-----
    `;
    const iat = parseInt(Date.now() / 1000);
    const exp = iat + 60 * 60;
    const iss = 'satoshin@gmx.com';
    const sub = `satoshin@gmx.com`;
    const aud = 'https://sagi.io';
    const scope = 'bla:xyz';
    const payload = { iss, sub, iat, exp, aud, scope };
    const headerAdditions = { kid: 'deadbeef' };
    const alg = 'ES256';

    const token = await jwt.getToken({
      privateKeyPEM,
      payload,
      alg,
      headerAdditions,
      cryptoImpl,
    });

    const b64SignedInput = token.split('.').slice(0, 2).join('.');
    const b64Signature = token.split('.')[2];

    const b64SignedInputArrBuf = utils.str2ab(b64SignedInput);
    const signature = Base64.toUint8Array(b64Signature);
    const algorithm = jwt.algorithms[alg];

    const privateKeyDER = utils.getDERfromPEM(privateKeyPEM);
    const publicKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyDER,
      algorithm,
      false,
      ['verify']
    );

    const verified = await crypto.subtle.verify(
      algorithm,
      publicKey,
      signature,
      b64SignedInputArrBuf
    );
    expect(verified).toBe(true);
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
        cryptoImpl,
        alg: 'RSA-PSS',
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
    const payloadAdditions = { scope };

    const token = await jwt.getTokenFromGCPServiceAccount({
      serviceAccountJSON,
      aud,
      payloadAdditions,
      cryptoImpl,
    });
    expect(token).toMatchSnapshot();

    const token2 = await jwt.getTokenFromGCPServiceAccount({
      serviceAccountJSON,
      aud,
      cryptoImpl,
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
