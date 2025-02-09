// controllers/invoiceController.js

const Invoice = require('../../models/invoice'); // Adjust the path as needed
const { decrypt } = require('../../utils/encrypt'); // Adjust the path as needed

/**
 * Get all invoices.
 * GET /api/invoices
 */
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll();
    
    // Map over each invoice and decrypt addresses if they exist
    const decryptedInvoices = invoices.map(invoice => {
      // Convert the Sequelize instance into a plain object
      const invoiceObj = invoice.toJSON();

      if (invoiceObj.shippingAddress) {
        try {
          invoiceObj.shippingAddress = decrypt(invoiceObj.shippingAddress);
        } catch (err) {
          console.error(
            `Error decrypting shipping address for invoice ${invoiceObj.id}: ${err.message}`
          );
          invoiceObj.shippingAddress = 'Decryption Error';
        }
      }

      if (invoiceObj.billingAddress) {
        try {
          invoiceObj.billingAddress = decrypt(invoiceObj.billingAddress);
        } catch (err) {
          console.error(
            `Error decrypting billing address for invoice ${invoiceObj.id}: ${err.message}`
          );
          invoiceObj.billingAddress = 'Decryption Error';
        }
      }

      return invoiceObj;
    });

    return res.status(200).json(decryptedInvoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Get a single invoice by ID.
 * GET /api/invoices/:id
 */
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Convert the Sequelize instance into a plain object
    const invoiceObj = invoice.toJSON();

    if (invoiceObj.shippingAddress) {
      try {
        invoiceObj.shippingAddress = decrypt(invoiceObj.shippingAddress);
      } catch (err) {
        console.error(
          `Error decrypting shipping address for invoice ${invoiceObj.id}: ${err.message}`
        );
        invoiceObj.shippingAddress = 'Decryption Error';
      }
    }

    if (invoiceObj.billingAddress) {
      try {
        invoiceObj.billingAddress = decrypt(invoiceObj.billingAddress);
      } catch (err) {
        console.error(
          `Error decrypting billing address for invoice ${invoiceObj.id}: ${err.message}`
        );
        invoiceObj.billingAddress = 'Decryption Error';
      }
    }

    return res.status(200).json(invoiceObj);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById
};
