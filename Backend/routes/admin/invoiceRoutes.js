// routes/invoiceRoutes.js

const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../../middleware/adminAuthMiddleware');
const {getAllInvoices, getInvoiceById} = require('../../controllers/admin/invoiceController');

// GET /api/invoices - fetch all invoices
router.get('/', adminAuthMiddleware('admin'), getAllInvoices);

// GET /api/invoices/:id - fetch a specific invoice by ID
router.get('/:id',adminAuthMiddleware('admin'), getInvoiceById);

module.exports = router;
