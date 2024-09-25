import React, { useState, useEffect } from 'react';
import { adminApi } from '../config/axios'; // Axios instance configured for admin routes

const InAppMessaging = () => {
  const [users, setUsers] = useState([]);  // Users list for search
  const [selectedUsers, setSelectedUsers] = useState([]);  // List of selected users to message
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Search users based on input
  const handleSearch = async () => {
    try {
      const response = await adminApi.get('/admin-mail/search-users', {
        params: { searchTerm },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };


  // Add or remove users from the selected list
  const handleSelectUser = (user) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      // If user is already selected, remove them
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      // Otherwise, add them to the list
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Send message to all selected users
  const handleSendMessage = async () => {
    const messageData = {
      messageBody: message,
      recipientIds: selectedUsers.map(user => user.id)  // Send message to all selected users
    };

    try {
      await adminApi.post('/messages/in-app/send', messageData);  // API endpoint to send messages
      console.log('Messages sent successfully');
    } catch (error) {
      console.error('Error sending messages:', error);
    }
  };

  return (
    <div>
      <h2>Admin In-App Messaging System</h2>

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
              <input
                type="checkbox"
                checked={selectedUsers.find((u) => u.id === user.id) ? true : false}
                onChange={() => handleSelectUser(user)}
              />
              {user.username} ({user.email})
            </li>
          ))}
        </ul>
      )}

      {/* Message Input */}
      <textarea
        placeholder={`Message selected users (${selectedUsers.length})`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></textarea>

      {/* Send Message Button */}
      <button onClick={handleSendMessage} disabled={selectedUsers.length === 0}>
        Send Message to {selectedUsers.length > 0 ? `${selectedUsers.length} selected users` : 'all opted-in users'}
      </button>
    </div>
  );
};

export default InAppMessaging;
