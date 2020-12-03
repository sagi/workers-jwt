import '@sagi.io/globalthis';

export const base64urlEncode = (arrayBuffer) =>
  btoa(arrayBuffer).replace(/-/g, '+').replace(/_/g, '/').replace(/=/g, '');

export const atobImpl = (b64str) =>
  new Buffer.from(b64str, 'base64').toString('binary');
export const btoaImpl = (str) => new Buffer.from(str).toString('base64');

export const str2ab = (str) => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

export const ab2str = (arrayBuffer) =>
  String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));

export const getDERfromPEM = (pem) => {
  const pemB64 = pem
    .trim()
    .split('\n')
    .slice(1, -1) // Remove the --- BEGIN / END PRIVATE KEY ---
    .join('');
  return str2ab(atob(pemB64));
};

export const b64encodeJSON = (obj) => base64urlEncode(JSON.stringify(obj));

export const getEncodedMessage = (header, payload) => {
  const encodedHeader = b64encodeJSON(header);
  const encodedPayload = b64encodeJSON(payload);
  const encodedMessage = `${encodedHeader}.${encodedPayload}`;
  return encodedMessage;
};
