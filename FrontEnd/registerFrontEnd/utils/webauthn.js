// WebAuthn utility functions for the frontend

/**
 * Convert a base64 string to an ArrayBuffer.
 * @param {String} base64
 * @returns {ArrayBuffer}
 */
function bufferDecode(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  /**
   * Convert an ArrayBuffer to a base64 string.
   * @param {ArrayBuffer} buffer
   * @returns {String}
   */
  function bufferEncode(buffer) {
    const bytes = new Uint8Array(buffer);
    const binaryString = bytes.reduce((str, byte) => str + String.fromCharCode(byte), '');
    return window.btoa(binaryString);
  }
  
  /**
   * Create WebAuthn credentials for registration.
   * @param {Object} options - Options returned from the server's registration challenge
   * @returns {PublicKeyCredential}
   */
  export async function create(options) {
    // Decode challenge and user id from base64 to ArrayBuffer
    options.challenge = bufferDecode(options.challenge);
    options.user.id = bufferDecode(options.user.id);
  
    // Decode any public key credential parameters
    options.pubKeyCredParams = options.pubKeyCredParams.map((param) => ({
      ...param,
      alg: param.alg,
    }));
  
    // Call WebAuthn API for creating credentials
    const credential = await navigator.credentials.create({
      publicKey: options,
    });
  
    // Extract required information and encode back to base64
    const { id, rawId, response } = credential;
    return {
      id,
      rawId: bufferEncode(rawId),
      type: credential.type,
      response: {
        clientDataJSON: bufferEncode(response.clientDataJSON),
        attestationObject: bufferEncode(response.attestationObject),
      },
    };
  }
  
  /**
   * Get WebAuthn credentials for login (assertion).
   * @param {Object} options - Options returned from the server's login challenge
   * @returns {PublicKeyCredential}
   */
  export async function get(options) {
    // Decode challenge and allowCredentials from base64 to ArrayBuffer
    options.challenge = bufferDecode(options.challenge);
    options.allowCredentials = options.allowCredentials.map((cred) => ({
      ...cred,
      id: bufferDecode(cred.id),
    }));
  
    // Call WebAuthn API for asserting credentials
    const assertion = await navigator.credentials.get({
      publicKey: options,
    });
  
    // Extract required information and encode back to base64
    const { id, rawId, response } = assertion;
    return {
      id,
      rawId: bufferEncode(rawId),
      type: assertion.type,
      response: {
        clientDataJSON: bufferEncode(response.clientDataJSON),
        authenticatorData: bufferEncode(response.authenticatorData),
        signature: bufferEncode(response.signature),
        userHandle: bufferEncode(response.userHandle),
      },
    };
  }
  