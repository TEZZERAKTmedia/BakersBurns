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
          <ul style={{ listStyle: 'none', padding: 0 }}>
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
          <input
            type="text"
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Type a message to Admin"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              fontFamily: 'Arial, sans-serif',
            }}
            disabled={sending} // Disable input while sending
          />
          <button
            type="submit"
            style={{ fontFamily: 'Arial, sans-serif' }}
            disabled={sending} // Disable button while sending
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserMessaging;
