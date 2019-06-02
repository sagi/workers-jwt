const parseServiceAccount = serviceAccountJsonStr => {
  const {
    private_key: privateKeyPEM,
    private_key_id: privateKeyId,
    project_id: projectId,
    client_email: clientEmail,
  } = JSON.parse(serviceAccountJsonStr);
  return { privateKeyPEM, privateKeyId, projectId, clientEmail };
};

const getPayload = (aud, clientEmail, scope = '', expiredAfter = 3600) => {
  const iat = parseInt(Date.now() / 1000);
  const exp = iat + expiredAfter;
  const iss = clientEmail;
  const sub = clientEmail;
  return { aud, iss, sub, iat, exp, scope };
};

module.exports = getGCPJWT;
