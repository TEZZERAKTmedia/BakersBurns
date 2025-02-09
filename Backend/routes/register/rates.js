const express = require("express");
const { getShippingRates, getUPSRatesHandler, getFedExRatesHandler, getUSPSRatesHandler } = require("../../controllers/register/ratesController");

const router = express.Router();

//Get shipping rates
router.post('/all-rates', getShippingRates);

// Route to fetch live shipping rates
router.post('/ups-rates', getUPSRatesHandler);
router.post('/fedex-rates', getFedExRatesHandler);
router.post('/usps-rates', getUSPSRatesHandler);


module.exports = router;
