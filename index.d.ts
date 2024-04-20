interface HeaderAdditions {
	/**
	 * Cryptographic algorithm used to secure the JWT
	 * @example "RS256"
	 */
	alg?: string,
	/**
	 * Type of token
	 * @example "JWT"
	 */
	typ?: string,
	/**
	 * Service account's private key ID
	 */
	kid?: string,
}

/**
 * General purpose JWT generation
 */
declare function getToken ({
	privateKeyPEM,
	payload,
	alg,
	headerAdditions,
	cryptoImpl
}: {
	/**
	 * The private key string in PEM format
	 */
	privateKeyPEM: string,
	payload: {
			/**
			 * Service account's email address (sa.client_email)
			 */
			iss: string,
			/**
			 * Service account's email address (sa.client_email)
			 */
			sub: string,
			/**
			 * Current Unix timem when the token was issued (in seconds since epoch)
			 */
			iat: number,
			/**
			 * The time exactly 3600 seconds after the token was issued, when the JWT expires
			 */
			exp: number,
			/**
			 * The API endpoint.
			 * @example https://<SERVICE>.googleapis.com/
			 */
			aud: string,
			/**
			 * The scope of the token
			 */
			scope: string
	},
	/**
	 * Cryptographic algorithm used to secure the JWT
	 * @default "RS256"
	 */
	alg?: string,
	/**
	 * An object with keys and string values to be added to the header of the JWT.
	 */
	headerAdditions?: HeaderAdditions,
	/**
	 * The crypto implementation to use. Use `null` to use the default implementation.
	 * @see https://w3c.github.io/webcrypto/#crypto-interface
	 * @default null
	 */
	cryptoImpl?: Crypto
}): Promise<string>

/**
 * Generate a JWT from a service account JSON
 */
declare function getTokenFromGCPServiceAccount ({
		serviceAccountJSON,
		aud,
		alg,
		cryptoImpl,
		headerAdditions,
		payloadAdditions
}: {
	/**
	 * Structure of a service account JSON
	 */
	serviceAccountJSON: {
		type: string;
		project_id: string;
		private_key_id: string;
		private_key: string;
		client_email: string;
		client_id: string;
		auth_uri: string;
		token_uri: string;
		auth_provider_x509_cert_url: string;
		client_x509_cert_url: string;
	},
	/**
	 * The API endpoint.
	 * @example https://<SERVICE>.googleapis.com/
	 */
	aud: string,
	/**
	 * Cryptographic algorithm used to secure the JWT
	 * @default "RS256"
	 */
	alg?: string,
	/**
	 * The crypto implementation to use. Use `null` to use the default implementation.
	 * @see https://w3c.github.io/webcrypto/#crypto-interface
	 * @default null
	 */
	cryptoImpl?: Crypto,
	/**
	 * The time in seconds after the token was issued when the JWT expires
	 * @default 3600
	 */
	expiredAfter?: number,
	/**
	 * An object with keys and string values to be added to the header of the JWT.
	 */
	headerAdditions?: HeaderAdditions,
	/**
	 * an object with keys and string values to be added to the payload of the JWT.
	 * @example { scope: 'https://www.googleapis.com/auth/chat.bot' }
	 */
	payloadAdditions?: Record<string, any>
}): Promise<string>

export { getTokenFromGCPServiceAccount, getToken }

interface commonjsModule {
	getTokenFromGCPServiceAccount,
	getToken
}

export default commonjsModule;
