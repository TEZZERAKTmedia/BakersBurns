require('dotenv').config();

const crypto = require('crypto');

// Set the encryption key as a 32-byte buffer from the hex string
const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

if (encryptionKey.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be exactly 32 bytes for AES-256 encryption.");
}
const ivLength = 16; // AES block size

// Encrypt function
function encrypt(text) {
  if (!text) {
    console.log('Encrypt function received empty input. Returning null.');
    return null; // Skip encryption for empty inputs
  }
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const result = `${iv.toString('hex')}:${encrypted}`;
  console.log('Encrypting:', text, '->', result); // Log plaintext and encrypted result
  return result;
}

// Decrypt function
function decrypt(encryptedText) {
  console.log('Decrypting input:', encryptedText); // Log the input

  // Check if input is valid
  if (!encryptedText || typeof encryptedText !== 'string') {
    console.error('Decrypt received invalid input. Must be a non-empty string.');
    throw new Error('Input to decrypt must be a non-empty string.');
  }

  // Split the encrypted text into IV and encrypted content
  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    console.error('Decrypt received invalid format. Expected "iv:encryptedText".');
    throw new Error('Invalid encrypted value format. Expected "iv:encryptedText".');
  }

  const [ivHex, encryptedHex] = parts;

  // Ensure IV and encrypted text are valid hex strings
  if (!ivHex || !encryptedHex) {
    console.error('Invalid IV or encrypted text detected.');
    throw new Error('Invalid IV or encrypted text. Ensure both parts are present.');
  }

  let iv, encryptedTextBuffer;

  try {
    iv = Buffer.from(ivHex, 'hex');
    encryptedTextBuffer = Buffer.from(encryptedHex, 'hex');
    console.log('Parsed IV:', ivHex, 'Parsed Encrypted Text:', encryptedHex);
  } catch (err) {
    console.error('Failed to parse IV or encrypted text to buffer:', err.message);
    throw new Error('Failed to convert IV or encrypted text to buffer: ' + err.message);
  }

  // Perform decryption
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
    let decrypted = decipher.update(encryptedTextBuffer, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    console.log('Decryption successful:', encryptedText, '->', decrypted); // Log successful decryption
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err.message);
    throw new Error('Decryption failed: ' + err.message);
  }
}

module.exports = { encrypt, decrypt };
