import React, { useState, useEffect } from 'react';
import { adminApi } from '../config/axios'; // Axios instance configured for admin routes

const Messaging = () => {
  const [users, setUsers] = useState([]);  // Users list for search
  const [selectedUser, setSelectedUser] = useState(null);  // Selected user to message
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Search users based on input
  const handleSearch = async () => {
    try {
      const response = await adminApi.get(`/users/search?term=${searchTerm}`);
      setUsers(response.data);  // Update users list based on search
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Send message to either the selected user or all opted-in users
  const handleSendMessage = async () => {
    const messageData = {
      messageBody: message,
      receiverId: selectedUser ? selectedUser.id : null  // Send to specific user if selected
    };

    try {
      await adminApi.post('/messages/send', messageData);  // API endpoint to send messages
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <h2>Admin Messaging System</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search users by username or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {/* Display list of users */}
      {users.length > 0 && (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.username} ({user.email})
              <button onClick={() => setSelectedUser(user)}>Message</button>
            </li>
          ))}
        </ul>
      )}

      {/* Message Input */}
      <textarea
        placeholder={`Message ${selectedUser ? selectedUser.username : 'All Opted-in Users'}`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></textarea>

      {/* Send Message Button */}
      <button onClick={handleSendMessage}>
        Send Message {selectedUser ? `to ${selectedUser.username}` : 'to All Opted-in Users'}
      </button>
    </div>
  );
};

export default Messaging;
