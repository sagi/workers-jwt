import { getEncodedMessage, getDERfromPEM, str2ab } from './utils';
import '@sagi.io/globalthis';
import { Base64 } from 'js-base64';

export const algorithms = {
  RS256: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-256' },
  },
  ES256: {
    name: 'ECDSA',
    namedCurve: 'P-256',
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
  cryptoImpl = null,
  headerAdditions = {},
}) => {
  const algorithm = algorithms[alg];
  if (!algorithm) {
    throw new Error(`@sagi.io/workers-jwt: Unsupported algorithm ${alg}.`);
  }

  if (!globalThis.crypto) {
    if (!cryptoImpl) {
      throw new Error(
        `@sagi.io/workers-jwt: No crypto nor cryptoImpl were found.`
      );
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
    algorithm,
    privateKey,
    encodedMessageArrBuf
  );
  const signatureUint8Array = new Uint8Array(signatureArrBuf);
  const encodedSignature = Base64.fromUint8Array(signatureUint8Array, true);
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
  alg = 'RS256',
  cryptoImpl = null,
  expiredAfter = 3600,
  headerAdditions = {},
  payloadAdditions = {},
}) => {
  const {
    client_email: clientEmail,
    private_key_id: privateKeyId,
    private_key: privateKeyPEM,
  } = serviceAccountJSON;

  Object.assign(headerAdditions, { kid: privateKeyId });
  const header = getHeader(alg, headerAdditions);

  const iat = parseInt(Date.now() / 1000);
  const exp = iat + expiredAfter;
  const iss = clientEmail;
  const sub = clientEmail;
  const payload = { aud, iss, sub, iat, exp, ...payloadAdditions };

  return getToken({ privateKeyPEM, payload, alg, headerAdditions, cryptoImpl });
};
