import { getEncodedMessage, getDERfromPEM, str2ab, b64encode } from './utils';
import './globalThis';

const algorithms = {
  RS256: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-256' },
  },
};

export const getHeader = (alg, headerAdditions) => ({
  ...headerAdditions,
  alg,
  typ: 'JWT',
});

// XXX https://developers.google.com/identity/protocols/OAuth2ServiceAccount#jwt-auth
export const getToken = async ({
  privateKeyPEM,
  payload,
  alg = 'RS256',
  headerAdditions = {},
  cryptoImpl = null,
}) => {
  const algorithm = algorithms[alg];
  if (!algorithm) {
    throw new Error(`@sagi.io/cfw-jwt: Unsupported algorithm ${alg}.`);
  }

  if (!globalThis.crypto) {
    if (!cryptoImpl) {
      throw new Error(`@sagi.io/cfw-jwt: No crypto nor cryptoImpl were found.`);
    }
    globalThis.crypto = cryptoImpl;
  }

  const privateKeyDER = getDERfromPEM(privateKeyPEM);
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyDER,
    algorithm,
    false,
    ['sign']
  );

  const header = getHeader(alg, headerAdditions);
  const encodedMessage = getEncodedMessage(header, payload);
  const encodedMessageArrBuf = str2ab(encodedMessage);

  const signatureArrBuf = await crypto.subtle.sign(
    algorithms.RS256.name,
    privateKey,
    encodedMessageArrBuf
  );

  const encodedSignature = b64encode(signatureArrBuf);
  const token = `${encodedMessage}.${encodedSignature}`;
  return token;
};

// Service Account Authoriazation without OAuth2:
// https://developers.google.com/identity/protocols/OAuth2ServiceAccount#jwt-auth
// Service Account Auth for OAuth2 Tokens: Choose "HTTP / REST" for:
// https://developers.google.com/identity/protocols/OAuth2ServiceAccount
export const getTokenFromGCPServiceAccount = async ({
  serviceAccountJSON,
  aud,
  scope = '',
  alg = 'RS256',
  expiredAfter = 3600,
  cryptoImpl = null,
}) => {
  const {
    client_email: clientEmail,
    private_key_id: privateKeyId,
    private_key: privateKeyPEM,
  } = serviceAccountJSON;

  const headerAdditions = { kid: privateKeyId };
  const header = getHeader(alg, headerAdditions);

  const iat = parseInt(Date.now() / 1000);
  const exp = iat + expiredAfter;
  const iss = clientEmail;
  const sub = clientEmail;
  const payload = { aud, iss, sub, iat, exp };

  !!scope && Object.assign(payload, { scope });

  return getToken({ privateKeyPEM, payload, alg, headerAdditions, cryptoImpl });
};
