import React, { useState, useEffect } from 'react';
import { adminApi } from '../config/axios';

const InAppMessaging = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Handle user search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      console.error('Search term is empty');
      return;
    }

    try {
      const { data } = await adminApi.get(`/admin-message-routes/search?searchTerm=${searchTerm}`);
      setSearchResults(data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Fetch all thread IDs when component mounts
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const { data } = await adminApi.get('/admin-message-routes/fetch-all-threads');
        setThreads(data.threads); // Store thread IDs in the state
      } catch (error) {
        console.error('Error fetching threads:', error);
      }
    };
    fetchThreads();
  }, []);

  // Fetch messages when a thread is selected
  useEffect(() => {
    if (selectedThreadId) {
      const fetchMessages = async () => {
        try {
          const { data } = await adminApi.get(`/admin-message-routes/fetch-messages-by-thread?threadId=${selectedThreadId}`);
          setMessages(data.messages);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
    }
  }, [selectedThreadId]);

  // Handle user selection from search
  const handleUserSelected = (user) => {
    setSelectedUser(user);
    setSelectedThreadId(null); // Clear selected thread when selecting a user
    setMessages([]); // Clear message window for new user
  };

  // Handle thread selection from thread preview
  const handleThreadSelected = (threadId) => {
    setSelectedThreadId(threadId);
    setSelectedUser(null); // Clear selected user when selecting a thread
  };

  // Handle sending a message
  const sendMessage = async () => {
    try {
      await adminApi.post('/admin-message-routes/messages/send', {
        messageBody,
        recipientId: selectedUser?.id,
        recipientUsername: selectedUser?.username,
      });
      setMessageBody(''); // Clear input field
      // Re-fetch messages after sending
      if (selectedThreadId) {
        const { data } = await adminApi.get(`/admin-message-routes/fetch-messages-by-thread?threadId=${selectedThreadId}`);
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="messaging-interface">
      {/* Search bar */}
      <div className="search-bar">
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Search users by username or email" 
        />
        <button onClick={handleSearch}>Search</button>
        <ul>
          {searchResults.map(user => (
            <li key={user.id} onClick={() => handleUserSelected(user)}>
              {user.username} ({user.email})
            </li>
          ))}
        </ul>
      </div>

      {/* Thread preview */}
      <div className="thread-preview">
        <h3>Message Threads</h3>
        <ul>
          {threads.map(thread => (
            <li key={thread.threadId} onClick={() => handleThreadSelected(thread.threadId)}>
              <h3>{thread.receiverUsername}</h3>
              <p>{thread.lastMessageTime || 'No messages yet'}</p> {/* Display the most recent message */}
            </li>
          ))}
        </ul>
      </div>

      {/* Messaging window */}
      <div className="messaging-window">
        <h3>Messages</h3>
        {selectedThreadId && messages.length > 0 ? (
          <ul>
            {messages.map((message, index) => (
              <li key={index}>
                <strong>{message.senderUsername}</strong>: {message.messageBody} <em>{new Date(message.createdAt).toLocaleString()}</em>
              </li>
            ))}
          </ul>
        ) : (
          <p>Select a thread to view messages</p>
        )}
        {selectedUser && (
          <>
            <input 
              type="text" 
              value={messageBody} 
              onChange={(e) => setMessageBody(e.target.value)} 
              placeholder="Type a message" 
            />
            <button onClick={sendMessage}>Send</button>
          </>
        )}
      </div>
    </div>
  );
};

export default InAppMessaging;
