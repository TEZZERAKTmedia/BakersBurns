import React, { useState, useEffect } from 'react';
import { adminApi } from '../config/axios';
import '../Pagecss/inappmessaging.css';

const InAppMessaging = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // State for sender and receiver usernames
  const [senderUsername, setSenderUsername] = useState('');
  const [receiverUsername, setReceiverUsername] = useState('');

  // State for sender and receiver roles
  const [senderRole, setSenderRole] = useState('');
  const [receiverRole, setReceiverRole] = useState('');

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

  // Fetch threads when component mounts or on button press
  const fetchThreads = async () => {
    try {
      const { data } = await adminApi.get('/admin-message-routes/fetch-all-threads');
      setThreads(data.threads); // Store thread IDs in the state
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };

  // Call fetchThreads only when the component mounts
  useEffect(() => {
    fetchThreads();
  }, []);

  // Fetch messages and user roles when a thread is selected
  useEffect(() => {
    if (selectedThreadId) {
      const fetchMessagesAndRoles = async () => {
        try {
          // Fetch messages
          const { data: messageData } = await adminApi.get(`/admin-message-routes/fetch-messages-by-thread?threadId=${selectedThreadId}`);
          setMessages(messageData.messages);

          // Fetch roles
          const roles = await fetchUserRole(selectedThreadId);
          setSenderRole(roles.senderRole);   // Assuming sender is the user
          setReceiverRole(roles.receiverRole); // Assuming receiver is the other user
        } catch (error) {
          console.error('Error fetching messages or roles:', error);
        }
      };
      fetchMessagesAndRoles();
    }
  }, [selectedThreadId]);

  // Handle user selection from search
  const handleThreadSelected = async (threadId) => {
    setSelectedThreadId(threadId); // Set the selected thread ID
   
    try {
      // Fetch the roles and users associated with the thread
      const { data } = await adminApi.get(`/admin-message-routes/get-roles-thread/${threadId}`);
     
      // Set the sender and receiver usernames and roles
      setSenderUsername(data.senderUsername);
      setReceiverUsername(data.receiverUsername); // <-- Add a log here
      console.log("Receiver Username after thread selection:", data.receiverUsername);
    } catch (error) {
      console.error('Error fetching roles or user:', error);
    }
  };
  
  const handleUserSelected = (user) => {
    setSelectedUser(user);
    setReceiverUsername(user.username); // Set receiver username here
    console.log("Receiver Username after user selection:", user.username);
    setSelectedThreadId(null); // Clear selected thread when selecting a user
    setMessages([]); // Clear message window for new user
  };
  
  
  

  const sendMessageToExistingThread = async () => {
    console.log("Send message to existing thread function is being used.");
    console.log("Message Body:", messageBody);
    console.log("Receiver Username:", receiverUsername);  // Add this log to verify
    console.log("Selected Thread ID:", selectedThreadId); // Add this log to verify
  
    if (!messageBody || !receiverUsername || !selectedThreadId) {
      console.error("Message body, receiverUsername, and selectedThreadId cannot be empty");
      return;
    }
  
    try {
      await adminApi.post('/admin-message-routes/messages/send', {
        messageBody,
        receiverUsername,   // Send message to the user in the thread
        threadId: selectedThreadId, // Attach to the existing thread
      });
  
      setMessageBody(''); // Clear input field after sending
  
      // Fetch messages for the thread after sending
      const { data } = await adminApi.get(`/admin-message-routes/fetch-messages-by-thread?threadId=${selectedThreadId}`);
      setMessages(data.messages);
    } catch (error) {
      console.error('Error sending message to thread:', error);
    }
  };
  
  
  

  // Handle sending a message
// Handle sending a message
// Handle sending a message
const sendMessageToSearchedUser = async () => {
  console.log("Send message to searched user function is being used");
  console.log("Message Body:", messageBody);
  console.log("Receiver Username:", receiverUsername);

  if (!messageBody || !receiverUsername) {
    console.error("Message body and receiverUsername cannot be empty");
    return;
  }

  try {
    await adminApi.post('/admin-message-routes/messages/send', {
      messageBody,
      receiverUsername,   // Send receiver username from the frontend
      // The backend will handle the senderUsername based on the authenticated admin user
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




  // Fetch roles for the given threadId
  const fetchUserRole = async (threadId) => {
    try {
      const { data } = await adminApi.get(`/admin-message-routes/get-roles-thread/${threadId}`);
      console.log('Roles fetched:', data); // Inspect the fetched data
      return {
        senderRole: data.senderRole,
        receiverRole: data.receiverRole,
      };
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return {};
    }
  };

  const fetchUsernamesAndRolesByThreadId = async (threadId) => {
    try {
      const { data } = await adminApi.get(`/admin-message-routes/get-usernames-by-thread/${threadId}`);
      return {
        senderUsername: data.senderUsername,
        receiverUsername: data.receiverUsername,
        senderRole: data.senderRole,
        receiverRole: data.receiverRole,
      };
    } catch (error) {
      console.error('Error fetching usernames and roles:', error);
    }
  };

  // Call this function when a thread is selected
  useEffect(() => {
    if (selectedThreadId) {
      const fetchData = async () => {
        const usernamesAndRoles = await fetchUsernamesAndRolesByThreadId(selectedThreadId);
        if (usernamesAndRoles) {
          setSenderUsername(usernamesAndRoles.senderUsername);
          setReceiverUsername(usernamesAndRoles.receiverUsername);
          setSenderRole(usernamesAndRoles.senderRole);
          setReceiverRole(usernamesAndRoles.receiverRole);
        }
      };
      fetchData();
    }
  }, [selectedThreadId]);

  return (
    <div className={`messaging-interface ${selectedThreadId ? 'thread-selected' : ''}`}>
      {/* Search bar */}
      <div className="search-bar">
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Search users by username or email" 
        />
        <button onClick={() => { handleSearch(); fetchThreads(); }}>Search</button>
        <ul>
          {searchResults.map(user => (
            <li key={user.id} onClick={() => handleUserSelected(user)}>
              {user.username} ({user.email})
            </li>
          ))}
        </ul>
      </div>

      {/* Main messaging body */}
      <div className="messaging-body">
        {/* Thread preview */}
        <div className="thread-preview">
          <h3>Message Threads</h3>
          <button onClick={fetchThreads}>Reload Threads</button>
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

            {/* Display messages if a thread is selected */}
            {selectedThreadId && messages.length > 0 ? (
              <ul>
                {messages.map((message, index) => (
                  <li key={index}>
                    <strong>{message.senderUsername}</strong>: {message.messageBody}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Select a thread or search for a user to start messaging</p>
            )}

            {/* If a thread is selected, show the input field for sending messages to an existing thread */}
            {selectedThreadId ? (
              <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessageToExistingThread(); // Call the function without passing parameters
                  }}
                >
                  <input
                    type="text"
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder={`Type a message to ${receiverUsername}`} // Show receiver's name
                  />
                  <button type="submit">Send to Thread</button>
                </form>

            ) : (
              // If no thread is selected but a user is selected via search, show input field for sending a message to the searched user
              selectedUser ? (
                <form onSubmit={(e) => { e.preventDefault(); sendMessageToSearchedUser();  }}>
                  <input 
                    type="text" 
                    value={messageBody} 
                    onChange={(e) => setMessageBody(e.target.value)} 
                    placeholder="Type a message to new user"
                  />
                  <button type="submit">Send to New User</button>
                </form>
              ) : (
                <p>Search for a user or select a thread to start messaging</p>
              )
            )}
          </div>


      </div>
    </div>
  );
};

export default InAppMessaging;
