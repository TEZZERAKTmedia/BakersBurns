import React, { useEffect, useState } from 'react';
import { userApi } from '../config/axios';

// Inline styles for simplicity
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    padding: '10px 0',
  },
  link: {
    display: 'inline-block',
    width: '40px',
    height: '40px',
  },
  icon: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
};

const SocialLinks = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [error, setError] = useState('');

  // Fetch social links from the backend
  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await userApi.get('/user-social/social-links'); // Adjust endpoint as necessary
        console.log('Fetched social links:', response.data);

        // Ensure the response is an array
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setSocialLinks(data);
      } catch (err) {
        console.error('Error fetching social links:', err);
        setError('Failed to fetch social links.');
      }
    };

    fetchSocialLinks();
  }, []);

  return (
    <div style={styles.container}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {socialLinks.length > 0 ? (
        socialLinks.map((link) => (
          <div
            key={link.id}
            onClick={() => {
              if (link.url) {
                window.open(link.url, '_blank');
              }
            }}
            style={styles.link}
            role="button"
            tabIndex={0}
          >
            <img
              src={`${import.meta.env.VITE_USER_API_URL}/socialIcons/${link.image}`} // Ensure this matches your backend storage
              alt={link.platform}
              style={styles.icon}
            />
          </div>
        ))
      ) : (
        <p>No social links available</p>
      )}
    </div>
  );
};

export default SocialLinks;
