import React, { useEffect, useState } from 'react';
import { registerApi } from '../config/axios';
import loadingImage from '../assets/loading.png'; // Import your loading image

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
    marginTop: '50px'
  },
  icon: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  loadingContainer: {
    textAlign: 'center',
    marginTop: '20px',
    
  },
  loadingImage: {
    height: '100px',
    width: '100px'
  },
};

const SocialLinks = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Map of deep links for supported platforms
  const deepLinkMap = {
    Facebook: (url) => `fb://profile/${url.split('/').pop()}`,
    Instagram: (url) => `instagram://user?username=${url.split('/').pop()}`,
    Twitter: (url) => `twitter://user?screen_name=${url.split('/').pop()}`,
    YouTube: (url) => `vnd.youtube:${url.split('/').pop()}`,
    Phone: (url) => `tel:${url}`,
    Email: (url) => `mailto:${url}`,
  };

  // Fetch social links from the backend
  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        setLoading(true);
        const response = await registerApi.get('/user-social/social-links');
        console.log('Fetched social links:', response.data);

        const data = Array.isArray(response.data) ? response.data : [response.data];
        setSocialLinks(data);
      } catch (err) {
        console.error('Error fetching social links:', err);
        setError('Failed to fetch social links.');
      } finally {
        setLoading(false);
      }
    };

    fetchSocialLinks();
  }, []);

  // Check if the user is on a mobile device
  const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleLinkClick = (platform, url) => {
    const deepLink = deepLinkMap[platform] ? deepLinkMap[platform](url) : null;

    if (isMobile() && deepLink) {
      window.location.href = deepLink;
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div>
      <div style={styles.container}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <img src={loadingImage} alt="Loading..." style={styles.loadingImage} />
          </div>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : socialLinks.length > 0 ? (
          socialLinks.map((link) => (
            <div
              key={link.id}
              onClick={() => handleLinkClick(link.platform, link.url)}
              style={styles.link}
              role="button"
              tabIndex={0}
            >
              <img
                src={`${import.meta.env.VITE_BACKEND}/socialIcons/${link.image}`}
                alt={link.platform}
                style={styles.icon}
              />
            </div>
          ))
        ) : (
          <p>No social links available</p>
        )}
      </div>
    </div>
  );
};

export default SocialLinks;
