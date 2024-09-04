import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) return <p>Loading...</p>;

  return (
    <div>
      <h2>User Dashboard</h2>
      <p>Welcome, {userData.username}</p>
      <p>Your Email: {userData.email}</p>
      {/* Display other user-specific data */}
    </div>
  );
};

export default UserDashboard;
