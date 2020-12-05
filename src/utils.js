import '@sagi.io/globalthis';
import { Base64 } from 'js-base64';

export const str2ab = (str) => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

export const getDERfromPEM = (pem) => {
  const pemB64 = pem
    .trim()
    .split('\n')
    .slice(1, -1) // Remove the --- BEGIN / END PRIVATE KEY ---
    .join('');

  return str2ab(Base64.atob(pemB64));
};

export const b64encodeJSON = (obj) => Base64.encode(JSON.stringify(obj), true);

export const getEncodedMessage = (header, payload) => {
  const encodedHeader = b64encodeJSON(header);
  const encodedPayload = b64encodeJSON(payload);
  const encodedMessage = `${encodedHeader}.${encodedPayload}`;
  return encodedMessage;
};
