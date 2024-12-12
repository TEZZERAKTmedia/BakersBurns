const express = require('express');
const router = express.Router();
const {subscribeToUPS} = require('../../controllers/carrier/ups');
const {subscribeToFedEx} = require('../../controllers/carrier/fedex');
const {addTrackingNumberController} = require('../../controllers/carrier/usps');

// Routes for carrier webhook
router.post('/ups', subscribeToUPS);  
router.post('/fedex', subscribeToFedEx);
router.post('/usps', addTrackingNumberController);



module.exports = router;

