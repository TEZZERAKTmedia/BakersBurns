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

  // Map of deep links for supported platforms
  const deepLinkMap = {
    Facebook: (url) => `fb://profile/${url.split('/').pop()}`, // Example for Facebook
    Instagram: (url) => `instagram://user?username=${url.split('/').pop()}`, // Example for Instagram
    Twitter: (url) => `twitter://user?screen_name=${url.split('/').pop()}`, // Example for Twitter
    YouTube: (url) => `vnd.youtube:${url.split('/').pop()}`, // Example for YouTube
    Phone: (url) => `tel:${url}`, // Example for phone numbers
    Email: (url) => `mailto:${url}`, // Example for email
  };

  // Fetch social links from the backend
  useEffect(() => {
    const fetchSocialLinks = async () => {
        try {
          const response = await userApi.get('/user-social/social-links');
          console.log('Fetched social links:', response.data);
      
          // Ensure response is an array, log unexpected results
          if (!Array.isArray(response.data)) {
            console.warn('Unexpected response format:', response.data);
            setError('Unexpected data format from the server.');
            return;
          }
      
          setSocialLinks(response.data);
        } catch (err) {
          console.error('Error fetching social links:', err);
          setError('Failed to fetch social links.');
        }
      };
      

    fetchSocialLinks();
  }, []);

  // Check if the user is on a mobile device
  const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleLinkClick = (platform, url) => {
    const deepLink = deepLinkMap[platform] ? deepLinkMap[platform](url) : null;

    if (isMobile() && deepLink) {
      // Try to open the deep link on mobile
      window.location.href = deepLink;
    } else {
      // Fallback to the web URL for desktop
      window.open(url, '_blank');
    }
  };

  return (
    <div style={styles.container}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {socialLinks.length > 0 ? (
        socialLinks.map((link) => (
          <div
            key={link.id}
            onClick={() => handleLinkClick(link.platform, link.url)}
            style={styles.link}
            role="button"
            tabIndex={0}
          >
            <img
              src={`${import.meta.env.VITE_USER_API_URL}/socialIcons/${link.image}`} // Adjust path to match backend
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
