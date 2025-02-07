const express = require("express");
const { getShippingRates, getUPSRates, getFedExRates, getUSPSRates } = require("../../controllers/register/ratesController");

const router = express.Router();

//Get shipping rates
router.post('/all-rates', getShippingRates);

// Route to fetch live shipping rates
router.post('/ups-rates', getUPSRates);
router.post('/fedex-rates', getFedExRates);
router.post('/usps-rates', getUSPSRates);


module.exports = router;
