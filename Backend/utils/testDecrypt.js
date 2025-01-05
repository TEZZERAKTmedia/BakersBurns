const crypto = require('crypto');

const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
if (!encryptionKey || encryptionKey.length !== 32) {
  console.error('ENCRYPTION_KEY must be a 32-byte hex string.');
  process.exit(1);
}

const encryptedValue = '21c5073fee41ed972bcfe558864f3591:a2ef2e707cf40fa0df6f2e54b284ed4d59acf94a75984e769f60360da5c575c3b2077db1c05733522f796f388e6539bf9bd61f8aadbc284de0348119ba5d17bd7e8f66bd7fac4fad02c29dd218f43561efd6bf2c3745205bbae48c6567de0da1b424068ebcc6bddbc16c96c6ba0774'; // Replace with your value

try {
  console.log('Testing decryption for value:', encryptedValue);

  // Split the value into IV and encrypted content
  const [ivHex, encryptedHex] = encryptedValue.split(':');
  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid encrypted value format. Expected "iv:encryptedText".');
  }

  console.log('IV Hex:', ivHex);
  console.log('Encrypted Hex:', encryptedHex);

  // Convert the IV and encrypted text from hex to buffers
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedTextBuffer = Buffer.from(encryptedHex, 'hex');

  console.log('IV Buffer:', iv);
  console.log('Encrypted Text Buffer:', encryptedTextBuffer);

  // Decrypt the value
  const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
  let decrypted = decipher.update(encryptedTextBuffer, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  console.log('Decrypted Value:', decrypted);
} catch (err) {
  console.error('Error during decryption:', err.message);
}
