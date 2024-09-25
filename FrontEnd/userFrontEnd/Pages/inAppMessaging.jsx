import React, { useState, useEffect, useRef } from 'react';
import { userApi } from '../config/axios';  // Axios instance for user routes
import ('../Pagecss/inAppMessaging.css');

const InAppMessaging = () => {
  const [allMessages, setAllMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const userId = 2; // Replace this with the actual logged-in user ID from your authentication

  // Create a ref for the message end (the last message or bottom of the chat)
  const messageEndRef = useRef(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to bottom every time the allMessages array is updated (after sending or receiving)
  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const receivedResponse = await userApi.get('/user-message-routes/get-received-messages');
        const sentResponse = await userApi.get('/user-message-routes/get-sent-messages');

        // Combine sent and received messages
        const combinedMessages = [...receivedResponse.data, ...sentResponse.data];

        // Sort messages by createdAt (timestamp) in ascending order
        const sortedMessages = combinedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        setAllMessages(sortedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
      }
    };

    fetchMessages();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      const response = await userApi.post('/user-message-routes/send-message', { messageBody: newMessage });
      setNewMessage('');

      // Fetch messages again after sending
      const receivedResponse = await userApi.get('/user-message-routes/get-received-messages');
      const sentResponse = await userApi.get('/user-message-routes/get-sent-messages');
      const combinedMessages = [...receivedResponse.data, ...sentResponse.data];
      const sortedMessages = combinedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setAllMessages(sortedMessages);

      // Scroll to the bottom after sending a message (will be triggered automatically by useEffect)
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="in-app-messaging-page">
      <h2>Your Messages</h2>
      <div className="messaging-layout">
        {allMessages.length === 0 ? (
          <div>No messages found.</div>
        ) : (
          allMessages.map((message) => (
            <div
              key={message.id}
              className={`message-item ${message.senderId === userId ? 'sent' : 'received'}`}
            >
              <strong>{message.senderId === userId ? 'You:' : 'Admin:'}</strong> {message.messageBody}
              <div className="message-timestamp">{new Date(message.createdAt).toLocaleString()}</div>
            </div>
          ))
        )}

        {/* This empty div will be scrolled into view to ensure the page scrolls to the bottom */}
        <div ref={messageEndRef} />
      </div>

      {/* Message input and send button */}
      <div className="message-input-container">
        <input
          type="text"
          className="message-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="message-send-button" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default InAppMessaging;
