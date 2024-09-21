import React, { useState } from 'react';
import { adminApi } from '../config/axios'; // Ensure axios is set up for admin routes
import '../Pagecss/email.css';

const AdminEmailComponent = () => {
  // State for individual user emailing
  const [searchTerm, setSearchTerm] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [password, setPassword] = useState('');

  // State for emailing everyone
  const [everyoneSubject, setEveryoneSubject] = useState('');
  const [everyoneMessageBody, setEveryoneMessageBody] = useState('');
  const [everyonePassword, setEveryonePassword] = useState('');

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

  // Function to send email to specific users
  const handleSendEmailToUsers = async () => {
    if (!subject || !messageBody || !password) {
      return alert('Please complete all fields and enter your password.');
    }

    try {
      const recipientIds = recipients.map((user) => user.id);
      await adminApi.post('/admin-mail/send-to-user', {
        recipientIds,
        subject,
        messageBody,
        password,
      });
      alert('Email sent successfully to selected users!');
      setRecipients([]);
      setSubject('');
      setMessageBody('');
      setPassword('');
    } catch (error) {
      console.error('Error sending email to users:', error);
      alert('Failed to send email to users.');
    }
  };

  // Function to send email to everyone
  const handleSendEmailToEveryone = async () => {
    if (!everyoneSubject || !everyoneMessageBody || !everyonePassword) {
      return alert('Please complete all fields and enter your password.');
    }

    try {
      await adminApi.post('/admin-mail/send-to-all', {
        subject: everyoneSubject,
        messageBody: everyoneMessageBody,
        password: everyonePassword,
      });
      alert('Email sent successfully to all users!');
      setEveryoneSubject('');
      setEveryoneMessageBody('');
      setEveryonePassword('');
    } catch (error) {
      console.error('Error sending email to everyone:', error);
      alert('Failed to send email to everyone.');
    }
  };

  return (
    <div className="email-app">
      <h2>Admin Email</h2>

      {/* Section 1: Emailing Specific Users */}
      <div className="section">
        <h3>Email Specific Users</h3>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search users by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleUserSearch}>Search</button>

        {/* Search Results */}
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

        {/* Recipients List */}
        <div className="recipients-list">
          <h4>Selected Recipients:</h4>
          {recipients.map((user) => (
            <div key={user.id}>
              {user.username} ({user.email})
              <button onClick={() => removeRecipient(user.id)}>Remove</button>
            </div>
          ))}
        </div>

        {/* Email Form for Specific Users */}
        <div className="email-form">
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            placeholder="Message body"
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
          ></textarea>
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSendEmailToUsers}>Send Email to Selected Users</button>
        </div>
      </div>

      {/* Section 2: Emailing Everyone */}
      <div className="section">
        <h3>Email Everyone</h3>
        <div className="email-form">
          <input
            type="text"
            placeholder="Subject"
            value={everyoneSubject}
            onChange={(e) => setEveryoneSubject(e.target.value)}
          />
          <textarea
            placeholder="Message body"
            value={everyoneMessageBody}
            onChange={(e) => setEveryoneMessageBody(e.target.value)}
          ></textarea>
          <input
            type="password"
            placeholder="Admin Password"
            value={everyonePassword}
            onChange={(e) => setEveryonePassword(e.target.value)}
          />
          <button onClick={handleSendEmailToEveryone}>Send Email to Everyone</button>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailComponent;
