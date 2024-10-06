import React, { useState } from 'react';
import { adminApi } from '../config/axios';
import '../Pagecss/email.css';

const AdminEmailComponent = () => {
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

  // Function to handle showing the preview modal
  const handleShowPreview = (url, subject, messageBody) => {
    if (!subject || !messageBody) {
      return alert('Please complete all fields.');
    }

    const recipientEmails = recipients.map((user) => `${user.username} (${user.email})`);
    setPreviewData({ url, subject, messageBody, recipientEmails });
    setShowPreview(true);
  };

  // Function to send the email after confirming the preview
  const handleSendEmail = async () => {
    const { url, subject, messageBody } = previewData;

    try {
      const recipientIds = recipients.map((user) => user.id);
      await adminApi.post(url, {
        recipientIds,
        subject,
        messageBody,
      });
      alert('Email sent successfully!');
      setRecipients([]);
      setShowPreview(false);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email.');
    }
  };

  return (
    <div className="email-app">
      <h2>Admin Email</h2>

      {/* Section 1: Emailing Specific Users */}
      <section className="section">
        <h3>Email Specific Users</h3>
        <input
          type="text"
          placeholder="Search users by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleUserSearch}>Search</button>

        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((user) => (
              <div key={user.id}>
                {user.username} ({user.email})
                <button onClick={() => addRecipient(user)}>Add</button>
              </div>
            ))}
          </div>
        )}

        <div className="recipients-list">
          <h4>Selected Recipients:</h4>
          {recipients.map((user) => (
            <div key={user.id}>
              {user.username} ({user.email})
              <button onClick={() => removeRecipient(user.id)}>Remove</button>
            </div>
          ))}
        </div>

        {/* Custom Message Section */}
        <section className="section">
          <h3>Send Custom Email</h3>
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
          ></textarea>
          <button onClick={() => handleShowPreview('/admin-mail/send-custom', customSubject, customMessageBody)}>
            Preview & Send Custom Email
          </button>
        </section>
      </section>

      {/* Section for Promotions */}
      <section className="section">
        <h3>Send Promotional Email</h3>
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
          <button onClick={() => handleShowPreview('/admin-mail/send-promotions', promotionSubject, promotionMessageBody)}>
            Preview & Send Promotional Email
          </button>
        </div>
      </section>

      {/* Section for Order Updates */}
      <section className="section">
        <h3>Send Order Update Email</h3>
        <div className="email-form">
          <input
            type="text"
            placeholder="Order Update Subject"
            value={orderUpdateSubject}
            onChange={(e) => setOrderUpdateSubject(e.target.value)}
          />
          <textarea
            placeholder="Order Update Message Body"
            value={orderUpdateMessageBody}
            onChange={(e) => setOrderUpdateMessageBody(e.target.value)}
          ></textarea>
          <button onClick={() => handleShowPreview('/admin-mail/send-order-update', orderUpdateSubject, orderUpdateMessageBody)}>
            Preview & Send Order Update Email
          </button>
        </div>
      </section>

      {/* Section for Newsletter */}
      <section className="section">
        <h3>Send Newsletter Email</h3>
        <div className="email-form">
          <input
            type="text"
            placeholder="Newsletter Subject"
            value={newsletterSubject}
            onChange={(e) => setNewsletterSubject(e.target.value)}
          />
          <textarea
            placeholder="Newsletter Message Body"
            value={newsletterMessageBody}
            onChange={(e) => setNewsletterMessageBody(e.target.value)}
          ></textarea>
          <button onClick={() => handleShowPreview('/admin-mail/send-newsletter', newsletterSubject, newsletterMessageBody)}>
            Preview & Send Newsletter
          </button>
        </div>
      </section>

      {/* Preview Modal */}
      {showPreview && (
        <>
          <div className="preview-overlay"></div>
          <div className="preview-modal">
            <div className="preview-content">
              <h3 style={{color: 'black'}}>Email Preview</h3>
              <p style={{color: 'black'}}><strong>Subject:</strong> {previewData.subject}</p>
              <p><strong>Message Body:</strong> {previewData.messageBody}</p>
              <p><strong>Recipients:</strong> {previewData.recipientEmails.join(', ')}</p>
              <div className="preview-actions">
                <button onClick={handleSendEmail}>Send Email</button>
                <button onClick={() => setShowPreview(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminEmailComponent;
