import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../config/axios';

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
      const { data } = await adminApi.get(`/admin-message-routes/fetch-messages-by-thread?threadId=${threadId}`);
      setMessages(data.messages);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const refetchMessages = async () => {
    if (!selectedThreadId) return;
    try {
        const { data } = await adminApi.get(`/admin-message-routes/fetch-messages-by-thread?threadId=${selectedThreadId}`);
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
    setSelectedThreadId(thread.threadId); // Ensure only the ID is set
    setSelectedUser(null);
    fetchMessages(thread.threadId);
    scrollToBottom();
};

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const { data } = await adminApi.get(`/admin-message-routes/search?searchTerm=${searchTerm}`);
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
      const { data } = await adminApi.get(`/admin-message-routes/check-thread?receiverUsername=${user.username}`);
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
        await adminApi.post('/admin-message-routes/messages/send', {
            messageBody,
            receiverUsername: selectedUser?.username || messages[0]?.receiverUsername,
            threadId: selectedThreadId,
        });
        setMessageBody(''); // Clear the input
        await refetchMessages(); // Refetch messages to update the list
    } catch (error) {
        console.error('Error sending message:', error);
    }
};



  const goBackToThreads = () => {
    setSelectedThreadId(null);
    setMessages([]);
  };

  const renderDesktopView = () => (
    <div style={{ display: 'flex', height: '100vh', marginTop: '100px', width: '100vw', fontFamily: 'Arial, sans-serif',backgroundColor:'white', }}>
      {/* Sidebar for Threads */}
      <div style={{ width: '300px', borderRight: '1px solid #ddd', padding: '10px' }}>
        <h3 style={{ fontSize: '2rem', fontFamily: 'Dancing Script' }}>Conversations</h3>
        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users"
            style={{ flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button onClick={handleSearch} style={{ padding: '5px 10px', borderRadius: '4px', backgroundColor: '#007bff', color: '#fff' }}>Search</button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '10px' }}>
          {searchResults.map((user) => (
            <li key={user.id} onClick={() => handleUserSelect(user)} style={{ padding: '5px 0', cursor: 'pointer', color: '#007bff' }}>
              {user.username} ({user.email})
            </li>
          ))}
        </ul>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {threads.map((thread) => (
            <li key={thread.threadId} onClick={() => handleThreadSelect(thread)} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #ddd' }}>
              <div style={{ color: 'black', fontFamily: 'Dancing Script', fontSize: '3rem' }}>{thread.threadPreviewUsername}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>{new Date(thread.lastMessageTime).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
  
      {/* Main Message Window */}
      <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', }}>
        {selectedThreadId && (
          <>
            <ul style={{ listStyle: 'none', padding: 0, flex: 1, overflowY: 'auto' }}>
              {messages.map((message, index) => (
                <li
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.senderRole === 'admin' ? 'flex-end' : 'flex-start',
                    marginBottom: '10px',
                    maxWidth: '50%', // Limit the maximum width of each message
                  }}
                >
                  <div
                    style={{
                      padding: '10px',
                      borderRadius: '15px',
                      backgroundColor: message.senderRole === 'admin' ? '#ff9800' : '#e0e0e0',
                      color: message.senderRole === 'admin' ? '#fff' : '#000',
                      maxWidth: '70%', // Consistent max-width for messages
                      wordWrap: 'break-word', // Wrap text within the box
                      textAlign: message.senderRole === 'admin' ? 'right' : 'left',
                      alignSelf: message.senderRole === 'admin' ? 'flex-end' : 'flex-start', // Align based on sender role
                    }}
                    
                  >
                    
                    <p style={{ margin: 0 }}>{message.messageBody}</p>
                    <div ref={messagesEndRef} />
                  </div>
                  <small style={{ fontSize: '10px', color: '#999', marginTop: '5px' }}>
                    {new Date(message.createdAt).toLocaleString()}
                  </small>
                </li>
              ))}
              

            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}
            >
 <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto', // Two columns: input takes the remaining space, button auto-sizes
      gap: '10px',
      alignItems: 'center', // Vertically align input and button
      marginRight:'50%',
      backgroundColor:'white',
      
    }}
  >
    <input
      type="text"
      value={messageBody}
      onChange={(e) => setMessageBody(e.target.value)}
      placeholder="Type a message"
      style={{
        padding: '10px',
        borderRadius: '20px',
        border: '1px solid #ddd',
        
       
        
      }}
    />
    <button
      type="submit"
      style={{
        padding: '10px 20px',
        borderRadius: '20px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        marginBottom:'100px'
      }}
    >
      Send
    </button>
  </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
  

  const renderMobileView = () => (
    <div style={{ height: '100vh', width: '100vw',  flexDirection: 'column', position: 'relative' }}>
    {selectedThreadId ? (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <button
          onClick={goBackToThreads}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
            fontSize: '2rem',
            marginTop: '10%',
            width: '50px',
            height: '50px',
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 1000,
          }}
        >
          &lt;
        </button>
        <div style={{ color: 'black', fontSize: '2rem', fontFamily: 'Dancing Script', backgroundColor: 'black', textAlign: 'center', padding: '10px' }}>
          {selectedThreadId.threadPreviewUsername}
        </div>

        <ul style={{ listStyle: 'none', padding: '10px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '10%' }}>
        {messages.map((message, index) => (
          <li
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.senderRole === 'admin' ? 'flex-end' : 'flex-start',
              marginBottom: '0px',
              maxWidth: '100%', // Limit the maximum width of each message
            }}
          >
            <div
              style={{
                padding: '10px',
                borderRadius: '15px',
                backgroundColor: message.senderRole === 'admin' ? '#ff9800' : '#e0e0e0',
                color: message.senderRole === 'admin' ? '#fff' : '#000',
                maxWidth: '100%', // Restrict message box to max-width
                wordWrap: 'break-word', // Wrap text within the box
                textAlign: message.senderRole === 'admin' ? 'right' : 'left',
                alignSelf: message.senderRole === 'admin' ? 'flex-end' : 'flex-start',
              }}
            >
              <p style={{ margin: 0 }}>{message.messageBody}</p>
            </div>
            <small style={{ fontSize: '10px', color: '#999', marginTop: '5px' }}>
              {new Date(message.createdAt).toLocaleString()}
            </small>
          </li>
        ))}

          <div ref={messagesEndRef} />
        </ul>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            backgroundColor: '#f0f0f0',
            borderTop: '1px solid #ddd',
            zIndex: 1000,
          }}
        >
          <input
            type="text"
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Type a message"
            style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              marginLeft: '10px',
              borderRadius: '20px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
            }}
          >
            Send
          </button>
        </form>
      </div>
    ) : (
      <div style={{ padding: '10px' }}>
        <h3 style={{ fontFamily: 'Dancing Script', fontSize: '5rem', marginTop: '10%'}}>Conversations</h3>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users"
          style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc', }}
        />
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {searchResults.map((user) => (
            <li key={user.id} onClick={() => handleUserSelect(user)} style={{ padding: '5px 0', cursor: 'pointer', }}>
              {user.username}
            </li>
          ))}
        </ul>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {threads.map((thread) => (
            <li key={thread.threadId} onClick={() => handleThreadSelect(thread)} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #ddd', color: 'black',fontFamily: 'Dancing Script', fontSize: '3rem' }}>
              {thread.threadPreviewUsername}
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
