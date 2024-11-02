import React, { useState, useEffect } from 'react';
import { userApi } from '../config/axios';
import '../Pagecss/inappmessaging.css';

const UserMessaging = () => {
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const receiverUsername = 'admin';

  const getThreadId = async () => {
    try {
      const { data } = await userApi.get('/user-message-routes/get-thread', {
        params: {
          senderUsername: userUsername,
          receiverUsername: receiverUsername
        }
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
      const { data: messageData } = await userApi.get(`/user-message-routes/fetch-messages-by-thread?threadId=${threadId}`);
      setMessages(messageData.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const checkThreadAndLoadMessages = async () => {
    const threadId = await getThreadId();
    if (threadId) {
      fetchMessages(threadId);
    }
  };

  useEffect(() => {
    setUserUsername('currentLoggedInUser');
    checkThreadAndLoadMessages();
  }, []);

  const sendMessage = async () => {
    if (!messageBody) return;

    try {
      const { data } = await userApi.post('/user-message-routes/send-message', {
        messageBody,
        threadId: selectedThreadId,
        senderUsername: userUsername,
        receiverUsername: receiverUsername
      });
      setMessageBody('');
      fetchMessages(data.threadId || selectedThreadId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessages = () => {
    return messages.map((message, index) => {
      // Determine if the message is from an admin or a user
      const isAdmin = message.senderRole === 'admin';
  
      return (
        <li
          key={index}
          className={`message ${isAdmin ? 'admin-message' : 'user-message'}`}
          style={{
            backgroundColor: isAdmin ? 'orange' : 'blue',
            alignSelf: isAdmin ? 'flex-start' : 'flex-end',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '10px',
            maxWidth: '70%',
          }}
        >
          <div>{message.messageBody}</div>
        </li>
      );
    });
  };

  return (
    <div className="messaging-interface">
      <div className="messaging-body" style={{ marginTop: '100px' }}>
        <h3>Conversation with Admin</h3>
        {selectedThreadId && messages.length > 0 ? (
          <ul className="message-list" style={{ listStyle: 'none', padding: 0 }}>
            {renderMessages()}
          </ul>
        ) : (
          <p>No conversation yet. Start by typing a message.</p>
        )}
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
