import React, { useState, useEffect } from 'react';
import { userApi } from '../config/axios';  // Assuming userApi is configured for user endpoints
import '../Pagecss/inappmessaging.css';

const UserMessaging = () => {
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [userUsername, setUserUsername] = useState('');  // Logged-in user's username
  const receiverUsername = 'admin';  // Assuming you're messaging the admin, adjust if dynamic

  // Get the threadId based on the senderUsername and receiverUsername
  const getThreadId = async () => {
    try {
      const { data } = await userApi.get('/user-message-routes/get-thread', {
        params: {
          senderUsername: userUsername,   // Pass the logged-in user's username
          receiverUsername: receiverUsername   // Pass the receiver's username (e.g., admin)
        }
      });

      if (data.threadId) {
        setSelectedThreadId(data.threadId);  // Set the threadId in the state
        console.log('ThreadId:', data.threadId);
        return data.threadId;
      }

      return null;
    } catch (err) {
      console.error('Failed to get thread', err);
      return null;
    }
  };

  // Fetch messages for the thread
  const fetchMessages = async (threadId) => {
    try {
      const { data: messageData } = await userApi.get(`/user-message-routes/fetch-messages-by-thread?threadId=${threadId}`);
      setMessages(messageData.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Check for the threadId and load messages on mount
  const checkThreadAndLoadMessages = async () => {
    const threadId = await getThreadId();  // Get or create the threadId
    if (threadId) {
      fetchMessages(threadId);  // Fetch the messages for the thread
    }
  };

  // Fetch the user's data and check thread on mount
  useEffect(() => {
    // Assume userUsername is fetched from an auth context or cookie
    setUserUsername('currentLoggedInUser');  // Set the logged-in user's username dynamically

    checkThreadAndLoadMessages();
  }, []);

  // Send a message (create a thread if it doesn't exist)
  const sendMessage = async () => {
    if (!messageBody) {
      console.error('Message body cannot be empty');
      return;
    }

    try {
      let threadId = selectedThreadId;

      // If no threadId exists, allow backend to create one dynamically
      const { data } = await userApi.post('/user-message-routes/send-message', {
        messageBody,      // The input message content
        threadId,         // Use the existing or pass null to create a new thread
        senderUsername: userUsername,  // Send current user as the sender
        receiverUsername: receiverUsername  // Send admin as the receiver
      });

      // Set the threadId if it was just created
      if (!threadId && data.threadId) {
        setSelectedThreadId(data.threadId);
      }

      setMessageBody('');  // Clear input field after sending
      fetchMessages(data.threadId || threadId);  // Refetch messages to update the UI

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Render messages with styling based on the sender's role
// Render messages with styling based on the sender's role
const renderMessages = () => {
  return messages.map((message, index) => {
    const isAdmin = message.senderRole === 'admin';

    return (
      <li
        key={index}
        className={`message ${isAdmin ? 'admin' : 'user'}`}
      >
        <strong >{isAdmin ? '' : ''}</strong>
        <div  >{message.messageBody}</div>
      </li>
    );
  });
};


  return (
    <div className={`messaging-interface ${selectedThreadId ? 'thread-selected' : ''}`}>
      <div className="messaging-body" style={{ marginTop: '100px'}}>
        <h3>Conversation with Admin</h3>

        {/* Display messages if a thread is selected */}
        {selectedThreadId && messages.length > 0 ? (
          <ul className="message-list" style={{ listStyle: 'none', padding: 0 }}>
            {renderMessages()}
          </ul>
        ) : (
          <p>No conversation yet. Start by typing a message.</p>
        )}

        {/* Message input field */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            type="text"
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Type a message to Admin"
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default UserMessaging;












