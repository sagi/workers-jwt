const fs = require('fs');
const getGCPJWT = require('../index.js');

describe('gcp-jwt', () => {
  const WebCrypto = require('node-webcrypto-ossl');
  const crypto = new WebCrypto();

  global.Date.now = jest.fn(() => 1530518207007);

  test('getGCPJWT', async () => {
    // XXX Don't worry - this service account was deleted (i.e. can't be abused).
    const s = fs.readFileSync('./assets/service_account.json', {
      encoding: 'utf8',
    });
    const token = await getGCPJWT(s, 'https://baba', crypto);
    expect(token).toMatchSnapshot();
  });
});
