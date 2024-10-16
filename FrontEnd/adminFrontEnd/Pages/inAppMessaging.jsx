import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../config/axios';
import { motion, AnimatePresence } from 'framer-motion';
import '../Pagecss/inappmessaging.css';

const InAppMessaging = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const [senderUsername, setSenderUsername] = useState('');
  const [receiverUsername, setReceiverUsername] = useState('');
  const [senderRole, setSenderRole] = useState('');
  const [receiverRole, setReceiverRole] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return;
    try {
      const { data } = await adminApi.get(`/admin-message-routes/search?searchTerm=${searchTerm}`);
      setSearchResults(data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }, [searchTerm]);

  const fetchThreads = useCallback(async () => {
    try {
      const { data } = await adminApi.get('/admin-message-routes/fetch-all-threads');
      setThreads(data.threads);
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const fetchMessagesAndRoles = useCallback(async (threadId, previewUsername) => {
    try {
      const [messageResponse, rolesResponse] = await Promise.all([
        adminApi.get(`/admin-message-routes/fetch-messages-by-thread?threadId=${threadId}`),
        adminApi.get(`/admin-message-routes/get-roles-thread/${threadId}`)
      ]);

      setMessages(messageResponse.data.messages);
      setSenderUsername(rolesResponse.data.senderUsername);
      setReceiverUsername(rolesResponse.data.receiverUsername || previewUsername);
      setSenderRole(rolesResponse.data.senderRole);
      setReceiverRole(rolesResponse.data.receiverRole);

      if (isMobileView) setIsMobileView(false);
    } catch (error) {
      console.error('Error fetching messages or roles:', error);
    }
  }, [isMobileView]);

  const handleThreadSelected = useCallback(async (thread) => {
    setReceiverUsername(thread.threadPreviewUsername);
    setSelectedThreadId(thread.threadId);
    await fetchMessagesAndRoles(thread.threadId, thread.threadPreviewUsername);
  }, [fetchMessagesAndRoles]);

  const handleUserSelected = useCallback(async (user) => {
    setSelectedUser(user);
    setReceiverUsername(user.username);

    setMessages([]);
    setSearchTerm('');
    setSearchResults([]);

    try {
      const { data } = await adminApi.get(`/admin-message-routes/check-thread?receiverUsername=${user.username}`);
      if (data.threadId) {
        handleThreadSelected({ threadId: data.threadId, threadPreviewUsername: user.username });
      } else {
        setSelectedThreadId(null);
      }
    } catch (error) {
      console.error('Error checking if thread exists for user:', error);
    }
  }, [handleThreadSelected]);

  const sendMessage = useCallback(async () => {
    if (!messageBody || !receiverUsername) return;

    try {
      await adminApi.post('/admin-message-routes/messages/send', {
        messageBody,
        receiverUsername,
        threadId: selectedThreadId,
      });
      setMessageBody('');

      if (selectedThreadId) {
        fetchMessagesAndRoles(selectedThreadId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [messageBody, receiverUsername, selectedThreadId, fetchMessagesAndRoles]);

  // Framer Motion Variants for Animation
  const containerVariants = {
    hidden: { opacity: 0, x: '-100vw' },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120 } },
    exit: { x: '100vw', opacity: 0, transition: { ease: 'easeInOut' } }
  };

  return (
    <div className={`messaging-interface ${selectedThreadId ? 'thread-selected' : ''}`}>
      {isMobileView && selectedThreadId ? (
        <motion.button
          className="back-button"
          onClick={() => setSelectedThreadId(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Back to Threads
        </motion.button>
      ) : (
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
              <motion.li
                key={user.id}
                onClick={() => handleUserSelected(user)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {user.username} ({user.email})
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      <div className={`messaging-body ${isMobileView && selectedThreadId ? 'mobile-view' : ''}`}>
        <AnimatePresence>
          {!isMobileView || !selectedThreadId ? (
            <motion.div
              className="thread-preview"
              key="thread-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3>Message Threads</h3>
              <ul>
                {threads.map(thread => (
                  <motion.li
                    key={thread.threadId}
                    onClick={() => handleThreadSelected(thread)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <h3>{thread.threadPreviewUsername}</h3>
                    <p>{thread.lastMessageTime}</p>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {(!isMobileView || selectedThreadId) && (
          <motion.div
            className="messaging-window"
            key="message-window"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h3>Messages</h3>
            {selectedThreadId && messages.length > 0 ? (
              <ul>
                {messages.map((message, index) => (
                  <li key={index}>
                    <strong>{message.senderUsername}</strong>:
                    <div>{message.messageBody}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Select a thread or search for a user to start messaging</p>
            )}

            {(selectedThreadId || selectedUser) && (
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                <input 
                  type="text" 
                  value={messageBody} 
                  onChange={(e) => setMessageBody(e.target.value)} 
                  placeholder={`Type a message to ${receiverUsername || 'user'}`}
                />
                <button type="submit">Send</button>
              </form>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InAppMessaging;
