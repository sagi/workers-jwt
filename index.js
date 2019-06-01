const base64url = require('base64url');

const atob = b64str => new Buffer(b64str, 'base64').toString('binary');

const str2ab = str => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

const getDERfromPEM = pem => {
  const pemB64 = pem
    .trim()
    .split('\n')
    .slice(1, -1) // Remove the --- BEGIN / END PRIVATE KEY ---
    .join();
  return str2ab(atob(pemB64));
};

const encode = obj => base64url.encode(str2ab(JSON.stringify(obj)));

const parseServiceAccount = serviceAccountJsonStr => {
  const {
    private_key: privateKeyPEM,
    private_key_id: privateKeyId,
    project_id: projectId,
    client_email: clientEmail,
  } = JSON.parse(serviceAccountJsonStr);
  return { privateKeyPEM, privateKeyId, projectId, clientEmail };
};

const algorithms = {
  RS256: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-256' },
  },
};

const getPayload = (aud, clientEmail, scope = '', expiredAfter = 3600) => {
  const iat = parseInt(Date.now() / 1000);
  const exp = iat + expiredAfter;
  const iss = clientEmail;
  const sub = clientEmail;
  return { aud, iss, sub, iat, exp, scope };
};

const getHeader = (privateKeyId, alg = 'RS256') => ({
  alg,
  kid: privateKeyId,
  typ: 'JWT',
});

const getEncodedMessage = (header, payload) => {
  const encodedHeader = encode(header);
  const encodedPayload = encode(payload);
  const encodedMessage = `${encodedHeader}.${encodedPayload}`;
  return encodedMessage;
};

// https://developers.google.com/identity/protocols/OAuth2ServiceAccount#jwt-auth
const getGCPJWT = async (serviceAccountJsonStr, aud, scope, crypto) => {
  const {
    projectId,
    clientEmail,
    privateKeyId,
    privateKeyPEM,
  } = parseServiceAccount(serviceAccountJsonStr);

  const privateKeyDER = getDERfromPEM(privateKeyPEM);
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyDER,
    algorithms.RS256,
    false,
    ['sign']
  );

  const header = getHeader(privateKeyId);
  const payload = getPayload(aud, clientEmail, scope);

  const encodedMessage = getEncodedMessage(header, payload);
  const encodedMessageArrBuf = str2ab(encodedMessage);

  const signatureArrBuf = await crypto.subtle.sign(
    algorithms.RS256.name,
    privateKey,
    encodedMessageArrBuf
  );

  const encodedSignature = base64url.encode(signatureArrBuf);
  const token = `${encodedMessage}.${encodedSignature}`;

  return token;
};

module.exports = getGCPJWT;
