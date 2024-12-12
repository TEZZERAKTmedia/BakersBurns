const crypto = require('crypto');
require('dotenv').config({ path: '../.env' });



// Set the encryption key as a 32-byte buffer from the hex string
const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

if (encryptionKey.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be exactly 32 bytes for AES-256 encryption.");
}
const ivLength = 16; // AES block size

// Encrypt function
function encrypt(text) {
  if (!text) return null; // Skip encryption for empty inputs
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt function
function decrypt(encryptedText) {
  console.log('Decrypting:', encryptedText); // Log the input
  if (!encryptedText) {
      throw new Error('Input to decrypt is undefined or null');
  }

  const [ivHex, encryptedHex] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedTextBuffer = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
  let decrypted = decipher.update(encryptedTextBuffer, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}


module.exports = { encrypt, decrypt };
