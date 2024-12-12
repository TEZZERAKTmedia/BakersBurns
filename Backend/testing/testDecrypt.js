require('dotenv').config(); // Load environment variables if needed
const { decrypt } = require('../utils/encrypt'); // Adjust the path as per your project structure

// Replace with actual encrypted values from your database
const encryptedShippingAddress = '3bf47062726cfcb155bdfe3061a03bd6:09bf6a5574a80a23e0b13c64a241a97f10bc5685e592eaedeb38b54c29187d0ec287346780c087e7d60a6c96f864518edfa4a94924a6fd9ac6e4e7c2cab2bd90724ffd37cd2eb143a8bdb1a924bd6ba99959ae6b33e2c9d646b769709957a28b5ff31d41e4fb73523eb468c72cd04';
const encryptedBillingAddress = '7691cf63eb160afa559b5aac453c46d7:cd3c4369cb7580c6989e48526c70a7e080e9eb112b7bb48f2ea05a41e5bd5a9f2d34ff2e18b8dc9982bd1cff1198551a0c7c13c1055696b2f1fc1ca2a9256b3b8415df841d45b505f8a437913ccb47b21615af7e8be5fef654ef60e085c37f82cc94777f7e77527f66463d01c1de4a';

try {
    const decryptedShipping = decrypt(encryptedShippingAddress);
    console.log('Decrypted Shipping Address:', decryptedShipping);
} catch (error) {
    console.error('Error decrypting shipping address:', error.message);
}

try {
    const decryptedBilling = decrypt(encryptedBillingAddress);
    console.log('Decrypted Billing Address:', decryptedBilling);
} catch (error) {
    console.error('Error decrypting billing address:', error.message);
}
