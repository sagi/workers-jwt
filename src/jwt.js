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

const getTokenFromGCPServiceAccount = async ({
  serviceAccountJSON,
  aud,
  scope,
  alg = 'RS256'
  cryptoImpl = null,
}) => {
  const {
    projectId,
    clientEmail,
    privateKeyId,
    privateKeyPEM,
  } = parseServiceAccount(serviceAccountJsonStr);

  const header = getHeader(alg, { kid: privateKeyId });

  const payload = getPayload(aud, clientEmail, scope);

  return token;
};
