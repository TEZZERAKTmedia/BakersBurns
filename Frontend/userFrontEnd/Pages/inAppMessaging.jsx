import React, { useState, useEffect, useRef } from 'react';
import { userApi } from '../config/axios';
import '../Pagecss/inappmessaging.css';
import LoadingPage from '../Components/loading'; // Import the loading component

const UserMessaging = () => {
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state for initial load
  const [sending, setSending] = useState(false); // Add sending state for sending messages
  const receiverUsername = 'admin';
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const getThreadId = async () => {
    try {
      const { data } = await userApi.get('/user-message-routes/get-thread', {
        params: {
          senderUsername: userUsername,
          receiverUsername: receiverUsername,
        },
      });
      if (data.threadId) {
        setSelectedThreadId(data.threadId);
        return data.threadId;
      }
      return null;
    } catch (err) {
      console.error('Failed to get thread', err);
      return null;
    }
  };

  const fetchMessages = async (threadId) => {
    try {
      const { data: messageData } = await userApi.get(
        `/user-message-routes/fetch-messages-by-thread?threadId=${threadId}`
      );
      setMessages(messageData.messages);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false); // Stop loading after fetching messages
    }
  };

  const checkThreadAndLoadMessages = async () => {
    const threadId = await getThreadId();
    if (threadId) {
      await fetchMessages(threadId);
    } else {
      setLoading(false); // Stop loading if no thread is found
    }
  };

  useEffect(() => {
    setUserUsername('currentLoggedInUser'); // Replace with dynamic user logic if applicable
    checkThreadAndLoadMessages();
  }, []);

  const sendMessage = async () => {
    if (!messageBody) return;

    setSending(true); // Start the sending state
    try {
      const { data } = await userApi.post('/user-message-routes/send-message', {
        messageBody,
        threadId: selectedThreadId,
        senderUsername: userUsername,
        receiverUsername: receiverUsername,
      });
      setMessageBody('');
      await fetchMessages(data.threadId || selectedThreadId); // Reload messages after sending
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false); // Stop the sending state
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessages = () => {
    return messages.map((message, index) => {
      const isAdminMessage = message.senderUsername === 'NULL' || message.senderUsername === null;
      const timestamp = new Date(message.createdAt).toLocaleString();

      return (
        <div
          key={index}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isAdminMessage ? 'flex-start' : 'flex-end',
            marginBottom: '15px',
          }}
        >
          <li
            style={{
              backgroundColor: isAdminMessage ? 'orange' : 'white',
              color: isAdminMessage ? 'white' : 'black',
              padding: '10px',
              borderRadius: '8px',
              maxWidth: '70%',
            }}
          >
            <div>{message.messageBody}</div>
          </li>
          <div
            style={{
              fontSize: '0.8rem',
              color: isAdminMessage ? '#ddd' : '#555',
              marginTop: '2px',
              alignSelf: isAdminMessage ? 'flex-start' : 'flex-end',
            }}
          >
            {timestamp}
          </div>
        </div>
      );
    });
  };

  return loading ? (
    <LoadingPage /> // Display loading page during initial loading
  ) : (
    <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginTop: '100px' }}>
        <h3 style={{ fontFamily: 'Arial, sans-serif' }}>Conversation with Admin</h3>
        {selectedThreadId && messages.length > 0 ? (
          <ul
            ref={messagesContainerRef}
            style={{
              listStyle: 'none',
              padding: 0,
              height: 'calc(100vh - 160px)', // Dynamically calculate height based on footer
              overflowY: 'auto', // Make the message container scrollable
              paddingBottom: '60px', // Ensure space for the footer
            }}
          >
            {renderMessages()}
            <div ref={messagesEndRef} />
          </ul>
        ) : (
          <p style={{ fontFamily: 'Arial, sans-serif' }}>
            No conversation yet. Start by typing a message.
          </p>
        )}
        {sending && <LoadingPage />} {/* Show loading animation during message send */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          <div
            style={{
              position: 'fixed',
              bottom: '0',
              left: '0',
              width: '100%',
              backgroundColor: '#fff',
              padding: '10px',
              boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
              zIndex: '0',
            }}
          >
            <input
              type="text"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Type a message to Admin"
              style={{
                width: '90%',
                padding: '10px',
                fontFamily: 'Arial, sans-serif',
                borderRadius: '4px',
                border: '1px solid #ccc',
                marginBottom: '10px',
              }}
              disabled={sending} // Disable input while sending
            />
            <button
              className="message-send-button"
              type="submit"
              style={{
                padding: '10px 15px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              disabled={sending} // Disable button while sending
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserMessaging;
