// src/components/InvoiceCards.js
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import './invoice.css';
import { adminApi } from '../../config/axios';

const InvoiceCards = () => {
  // State variables
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch invoices when component mounts
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await adminApi.get('/invoice-routes'); // Adjust endpoint if needed
        setInvoices(response.data);
        setFilteredInvoices(response.data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };
    fetchInvoices();
  }, []);

  // Filter invoices whenever search term or invoices change
// Filter invoices whenever search term or invoices change
useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = invoices.filter((inv) => {
      // Create an array with the values you want to search.
      // We convert each value to a string (and lower-case it) so that numeric values and dates work as well.
      const fieldsToSearch = [
        inv.id,
        inv.username,
        inv.total,
        inv.shippingAddress,
        inv.billingAddress,
        inv.carrier,
        inv.trackingNumber,
        new Date(inv.invoiceDate).toLocaleDateString()
      ].map(field => String(field).toLowerCase());
  
      // Return true if any of the fields include the search term.
      return fieldsToSearch.some(fieldStr => fieldStr.includes(lowerSearch));
    });
    setFilteredInvoices(filtered);
  }, [searchTerm, invoices]);
  

  // Sort invoices whenever sort options change
  useEffect(() => {
    const sorted = [...filteredInvoices].sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredInvoices(sorted);
  }, [sortField, sortOrder]);

  // Handle sorting when a sort option is clicked
  const handleSort = (field) => {
    let order = 'asc';
    if (sortField === field && sortOrder === 'asc') order = 'desc';
    setSortField(field);
    setSortOrder(order);
  };

  // Generate a PDF report from the current filtered invoices
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Invoice Report', 14, 20);

    const tableColumn = [
      'ID',
      'Username',
      'Total',
      'Shipping Address',
      'Billing Address',
      'Carrier',
      'Tracking Number',
      'Invoice Date',
    ];
    const tableRows = filteredInvoices.map((invoice) => [
      invoice.id,
      invoice.username,
      invoice.total,
      invoice.shippingAddress,
      invoice.billingAddress,
      invoice.carrier,
      invoice.trackingNumber,
      new Date(invoice.invoiceDate).toLocaleDateString(),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
    });

    doc.save('invoices_report.pdf');
  };

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <h2></h2>
        <div className="invoice-controls">
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={generatePDF}>Generate PDF</button>
        </div>
      </div>

      <div className="sort-options">
        <button onClick={() => handleSort('id')}>
          Sort by ID {sortField === 'id' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button onClick={() => handleSort('username')}>
          Sort by Username {sortField === 'username' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button onClick={() => handleSort('total')}>
          Sort by Total {sortField === 'total' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button onClick={() => handleSort('invoiceDate')}>
          Sort by Date {sortField === 'invoiceDate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
        </button>
      </div>

      {/* Wrap the grid in a scrollable container */}
      <div className="invoice-grid-wrapper">
        <AnimatePresence>
          <div className="invoice-grid">
            {filteredInvoices.map((invoice) => (
              <motion.div
                key={invoice.id}
                className="invoice-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
              >
                <h3>Invoice #{invoice.id}</h3>
                <p className="invoice-card__detail">
                  <strong>Username:</strong> {invoice.username}
                </p>
                <p className="invoice-card__detail">
                  <strong>Total:</strong> ${invoice.total}
                </p>
                <p className="invoice-card__detail">
                  <strong>Shipping:</strong> {invoice.shippingAddress}
                </p>
                <p className="invoice-card__detail">
                  <strong>Billing:</strong> {invoice.billingAddress}
                </p>
                <p className="invoice-card__detail">
                  <strong>Carrier:</strong> {invoice.carrier}
                </p>
                <p className="invoice-card__detail">
                  <strong>Tracking:</strong> {invoice.trackingNumber}
                </p>
                <p className="invoice-card__detail">
                  <strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InvoiceCards;
