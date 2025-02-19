import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../config/axios';
import './messaging.css';

const MessagingApp = () => {
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const { data } = await adminApi.get('/admin-message-routes/fetch-all-threads');
        console.log('Fetched Threads:', data.threads);
        setThreads(data.threads);
      } catch (error) {
        console.error('Error fetching threads:', error);
      }
    };
    fetchThreads();
  }, []);

  const fetchMessages = async (threadId) => {
    if (!threadId) return;
    try {
      const { data } = await adminApi.get(
        `/admin-message-routes/fetch-messages-by-thread?threadId=${threadId}`
      );
      setMessages(data.messages);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    console.log('Messages: ', messages);
  }, [messages]);

  const refetchMessages = async () => {
    if (!selectedThreadId) return;
    try {
      const { data } = await adminApi.get(
        `/admin-message-routes/fetch-messages-by-thread?threadId=${selectedThreadId}`
      );
      setMessages(data.messages);
      scrollToBottom();
    } catch (error) {
      console.error('Error refetching messages:', error);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleThreadSelect = (thread) => {
    setSelectedThreadId(thread.threadId);
    console.log('Selected Thread ID:', thread.threadId);
    setSelectedUser(null);
    fetchMessages(thread.threadId);
    scrollToBottom();
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const { data } = await adminApi.get(
        `/admin-message-routes/search?searchTerm=${searchTerm}`
      );
      setSearchResults(data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setMessages([]);
    setSearchResults([]);
    setSearchTerm('');
    try {
      const { data } = await adminApi.get(
        `/admin-message-routes/check-thread?receiverUsername=${user.username}`
      );
      if (data.threadId) {
        handleThreadSelect({ threadId: data.threadId, threadPreviewUsername: user.username });
      } else {
        setSelectedThreadId(null);
      }
    } catch (error) {
      console.error('Error checking thread:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageBody.trim() || !selectedThreadId) return;
    try {
      const selectedThread = threads.find((thread) => thread.threadId === selectedThreadId);
      let receiverUsername = null;
      if (selectedThread) {
        receiverUsername = selectedThread.senderUsername || null;
      }
      await adminApi.post('/admin-message-routes/messages/send', {
        threadId: selectedThreadId,
        messageBody,
        receiverUsername,
      });
      setMessageBody('');
      await refetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const goBackToThreads = () => {
    setSelectedThreadId(null);
    setMessages([]);
  };

  const renderDesktopView = () => (
    <div className="messaging-app">
      <div className="sidebar">
        <h3></h3>
        {/*<div className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users"
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            Search
          </button>
  </div> */}
        <ul className="user-list">
          {searchResults.map((user) => (
            <li key={user.id} onClick={() => handleUserSelect(user)} className="user-item">
              {user.username} ({user.email})
            </li>
          ))}
        </ul>
        <ul className="thread-list">
          {threads.map((thread) => (
            <li key={thread.threadId} onClick={() => handleThreadSelect(thread)} className="thread-item">
              <div className="thread-username">
                {thread.senderUsername === 'Admin'
                  ? thread.receiverUsername || 'Unknown User'
                  : thread.senderUsername || 'Unknown User'}
              </div>
              <div className="thread-message">
                {thread.lastMessage?.messageBody || 'No messages yet'}
              </div>
              <div className="thread-timestamp">
                {thread.lastMessageTime
                  ? new Date(thread.lastMessageTime).toLocaleString()
                  : 'No recent messages'}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="message-window">
        {selectedThreadId && (
          <>
            <ul className="message-list">
              {messages.map((message, index) => {
                const isAdminMessage = message.senderUsername === 'Admin';
                return (
                  <li key={index} className="message-item">
                    <div className={`message-bubble ${isAdminMessage ? 'dsk-admin' : 'user'}`}>
                      <p className={`message-text ${isAdminMessage ? 'dsk-admin-text' : 'user-text'}`}>{message.messageBody}</p>
                    </div>
                    <small className={`message-timestamp ${isAdminMessage ? 'timestamp-left' : 'timestamp-right'}`}>
                      {new Date(message.createdAt).toLocaleString()}
                    </small>
                  </li>
                );
              })}
              <div ref={messagesEndRef} />
            </ul>
            <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="mobile-send-form"
          >
            <input
              type="text"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Type a message"
              className="mobile-send-input"
            />
            <button type="submit" className="mobile-send-button">
              Send
            </button>
          </form>
          </>
        )}
      </div>
    </div>
  );

  const renderMobileView = () => (
    <div className="mobile-container">
      {selectedThreadId ? (
        <div className="mobile-message-view">
          <button onClick={goBackToThreads} className="mobile-back-button">
            &lt;
          </button>
          <div className="mobile-header">{selectedThreadId.threadPreviewUsername}</div>
          <ul className="mobile-message-list">
            {messages.map((message, index) => {
              const isAdminMessage = message.senderUsername === 'Admin';
              return (
                <li key={index} className="mobile-message-item">
                  <div className={`mobile-message-bubble ${isAdminMessage ? 'mbl-admin' : 'mbl-user'}`}>
                    <p className={`mobile-message-text ${isAdminMessage ? 'mbl-admin-text' : 'mbl-user-text'}`}>{message.messageBody}</p>
                  </div>
                  <small className={`mbl-message-timestamp ${isAdminMessage ? 'mbl-timestamp-left' : 'mbl-timestamp-right'}`}>
                      {new Date(message.createdAt).toLocaleString()}
                    </small>
                </li>
              );
            })}
            <div ref={messagesEndRef} />
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="mobile-send-form"
          >
            <input
              type="text"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Type a message"
              className="mobile-send-input"
            />
            <button type="submit" className="mobile-send-button">
              Send
            </button>
          </form>
        </div>
      ) : (
        <div className="mobile-default">
          <h3 className="mobile-title"></h3>
          {/* 
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users"
            className="search-input"
          />
          <ul className="user-list">
            {searchResults.map((user) => (
              <li key={user.id} onClick={() => handleUserSelect(user)} className="user-item">
                {user.username}
              </li>
            ))}
          </ul>
          */}
          <ul className="mobile-thread-list">
            {threads.map((thread) => (
              <li
                key={thread.threadId}
                onClick={() => handleThreadSelect(thread)}
                className="mobile-thread-item"
              >
                <div className="mobile-thread-username">
                  {thread.senderUsername || 'Unknown User'}
                </div>
                <div className="mobile-thread-message">
                  {thread.lastMessage?.messageBody || 'No messages yet'}
                </div>
                <div className="mobile-thread-timestamp">
                  {thread.lastMessage?.createdAt
                    ? new Date(thread.lastMessage.createdAt).toLocaleString()
                    : ''}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return isMobileView ? renderMobileView() : renderDesktopView();
};

export default MessagingApp;
