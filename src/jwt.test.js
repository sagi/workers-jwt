import fs from 'fs';
import * as jwt from './jwt';

describe('cfw-jwt', () => {
  const WebCrypto = require('node-webcrypto-ossl');
  const crypto = new WebCrypto();

  global.Date.now = jest.fn(() => 1530518207007);

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
    const x = await jwt.getToken({
      privateKeyPEM,
      payload,
      headerAdditions,
      cryptoImpl: crypto,
    });
    console.log(x);
    //const token = await getGCPJWT(s, 'https://baba', '', crypto);
    //expect(token).toMatchSnapshot();
  });
});
