import React, { useState } from 'react';
import { adminApi } from '../config/axios';
import { motion, AnimatePresence } from 'framer-motion';
import '../Pagecss/email.css';
import LoadingPage from '../Components/loading';

const AdminEmailComponent = () => {

  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [customSubject, setCustomSubject] = useState('');
  const [customMessageBody, setCustomMessageBody] = useState('');
  const [promotionSubject, setPromotionSubject] = useState('');
  const [promotionMessageBody, setPromotionMessageBody] = useState('');
  const [orderUpdateSubject, setOrderUpdateSubject] = useState('');
  const [orderUpdateMessageBody, setOrderUpdateMessageBody] = useState('');
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterMessageBody, setNewsletterMessageBody] = useState('');

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [emailType, setEmailType] = useState(''); // Track email type for the preview

  // Function to search users in the database
  const handleUserSearch = async () => {
    try {
      const response = await adminApi.get('/admin-mail/search-users', {
        params: { searchTerm },
      });
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Function to add a recipient
  const addRecipient = (user) => {
    setRecipients([...recipients, user]);
    setSearchResults([]);
    setSearchTerm('');
  };

  // Function to remove a recipient
  const removeRecipient = (id) => {
    setRecipients(recipients.filter((user) => user.id !== id));
  };

  // Function to handle showing the preview modal for Custom Email
  const handleShowCustomPreview = () => {
    if (!customSubject || !customMessageBody) {
      return alert('Please complete all fields.');
    }

    const recipientEmails = recipients.map((user) => `${user.username} (${user.email})`);
    setPreviewData({ url: '/admin-mail/send-custom', subject: customSubject, messageBody: customMessageBody, recipientEmails });
    setEmailType('custom');
    setShowPreview(true);
  };

  // Function to handle showing the preview modal for Promotional Email
  const handleShowPromotionalPreview = () => {
    if (!promotionSubject || !promotionMessageBody) {
      return alert('Please complete all fields.');
    }

    const recipientEmails = recipients.map((user) => `${user.username} (${user.email})`);
    setPreviewData({ url: '/admin-mail/send-promotions', subject: promotionSubject, messageBody: promotionMessageBody, recipientEmails });
    setEmailType('promotion');
    setShowPreview(true);
  };

  // Similar preview functions for Order Update and Newsletter
  const handleShowOrderUpdatePreview = () => {
    if (!orderUpdateSubject || !orderUpdateMessageBody) {
      return alert('Please complete all fields.');
    }

    const recipientEmails = recipients.map((user) => `${user.username} (${user.email})`);
    setPreviewData({ url: '/admin-mail/send-order-update', subject: orderUpdateSubject, messageBody: orderUpdateMessageBody, recipientEmails });
    setEmailType('orderUpdate');
    setShowPreview(true);
  };

  const handleShowNewsletterPreview = () => {
    if (!newsletterSubject || !newsletterMessageBody) {
      return alert('Please complete all fields.');
    }

    const recipientEmails = recipients.map((user) => `${user.username} (${user.email})`);
    setPreviewData({ url: '/admin-mail/send-newsletter', subject: newsletterSubject, messageBody: newsletterMessageBody, recipientEmails });
    setEmailType('newsletter');
    setShowPreview(true);
  };

  // Dynamic send function based on email type
  const handleSendEmail = async () => {
    const recipientIds = recipients.map(user => user.id);  // Send IDs of recipients
    setLoading(true);
    try {
      const response = await adminApi.post(previewData.url, {
        recipientIds,
        subject: previewData.subject,
        messageBody: previewData.messageBody,
      });

       // Success message
      setShowPreview(false);  // Close the preview after sending
      
    } catch (error) {
      if (error.response && error.response.data.message) {
        alert(error.response.data.message);  // Error message with specific user not opted-in
      } else {
        console.error('Error sending email:', error);
      } 

    } finally {
      setLoading(false); // Hide loading
    }
  };

  const sendUpdateEmail = async (type) => {
    setLoading(true);
    try {
     const endpoint =
      type === 'privacyPolicy'
        ? 'admin-mail/send-privacy-email'
        : '/admin-mail/send-terms-of-service'; 

        const response = await adminApi.post(endpoint);

        alert(response.data.message || `${type === 'privacyPolicy' ? 'Privacy Policy' : 'Terms of Service'} email sent successfully`)
    } catch (error) {
      console.error(`Error sending ${type} email:`, error);
      alert(`Failed to send ${type === 'privacyPolicy' ? 'Privacy Policy' : 'Terms of Service'} email sent successfully`)
    } finally {
      setLoading(false);
    }
  }

  return (

    <div>
    {loading && <LoadingPage />}
    <motion.div className="email-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Admin Email
      </motion.h2>

      {/* Section 1: Emailing Specific Users */}
      <motion.section className="section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
          <motion.h3
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Send Custom Email
            
          </motion.h3>
        {/* Custom Message Section */}
        <motion.section className="section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >

<div className="search-container">
        <h3>Search for Users</h3>
        <input
          type="text"
          placeholder="Search users by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleUserSearch}>Search</button>
      </div>

      {/* Display Search Results */}
      <div className="search-results">
        {searchResults.map((user) => (
          <motion.div
            key={user.id}
            className={`search-result-item ${user.isOptedInForEmailUpdates ? 'opted-in' : 'not-opted-in'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {user.username} ({user.email})
            <p>{user.isOptedInForEmailUpdates ? 'Opted in for email messaging' : 'Not opted in for email messaging'}</p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addRecipient(user)}
            >
              Add
            </motion.button>
          </motion.div>
        ))}
      </div>
      

      {/* Display Selected Recipients */}
      <div className="recipients-container">
        <h3>Selected Recipients</h3>
        {recipients.length === 0 && <p>No recipients selected yet.</p>}
        {recipients.map((user) => (
          <motion.div
            key={user.id}
            className={`recipient-item ${user.isOptedInForEmailUpdates ? 'opted-in' : 'not-opted-in'}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            {user.username} ({user.email})
            <p>{user.isOptedInForEmailUpdates ? 'Opted in for email messaging' : 'Not opted in for email messaging'}</p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => removeRecipient(user.id)}
            >
              Remove
            </motion.button>
          </motion.div>
        ))}
      </div>
      <div className="email-form">
          <input
            type="text"
            placeholder="Custom Subject"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
          />
          <textarea
            placeholder="Custom Message Body"
            value={customMessageBody}
            onChange={(e) => setCustomMessageBody(e.target.value)}
            style={{height: '100px'}}
          ></textarea>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShowCustomPreview}
            style={{width: '100%'}}
          >
            
            Preview & Send Custom Email
          </motion.button>
          </div>
        </motion.section>
      </motion.section>

      {/* Section for Promotions */}
      <motion.section className="section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h3
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Send Promotional Email
        </motion.h3>
        <div className="email-form">
          <input
            type="text"
            placeholder="Promotion Subject"
            value={promotionSubject}
            onChange={(e) => setPromotionSubject(e.target.value)}
          />
          <textarea
            placeholder="Promotion Message Body"
            value={promotionMessageBody}
            onChange={(e) => setPromotionMessageBody(e.target.value)}
          ></textarea>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShowPromotionalPreview}
          >
            Preview & Send Promotional Email
          </motion.button>
        </div>
        
      </motion.section>
      <motion.section className="section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <motion.h3 initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            Send Privacy Policy Update
          </motion.h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendUpdateEmail('privacyPolicy')}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Send Privacy Policy Update
          </motion.button>
        </motion.section>

        {/* Terms of Service Email Section */}
        <motion.section className="section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <motion.h3 initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            Send Terms of Service Update
          </motion.h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendUpdateEmail('termsOfService')}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Send Terms of Service Update
          </motion.button>
        </motion.section>

      {/* Preview Modal */}
      {showPreview && (
        <AnimatePresence>
          <motion.div
            className="preview-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
          ></motion.div>
          <motion.div
            className="preview-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="preview-content">
              <h3 style={{ color: 'black' }}>Email Preview</h3>
              <p style={{ color: 'black' }}><strong>Subject:</strong> {previewData.subject}</p>
              <p><strong>Message Body:</strong> {previewData.messageBody}</p>
              <p><strong>Recipients:</strong> {previewData.recipientEmails.join(', ')}</p>
              <div className="preview-actions">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendEmail}
                >
                  Send Email
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPreview(false)}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
    </div>
  );
};

export default AdminEmailComponent;
