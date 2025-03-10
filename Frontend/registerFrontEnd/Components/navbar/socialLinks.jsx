import React, { useEffect, useState } from 'react';
import { registerApi } from '../../config/axios';
import loadingImage from '../../assets/loading.gif';
import './social_links.css';

// Import local icons
import Instagram from '../../assets/instagram.webp';
import Facebook from '../../assets/facebook.webp';
import Twitter from '../../assets/x.webp';
//import YouTube from '../../assets/youtube.webp';
import Phone from '../../assets/phone.webp';
import Email from '../../assets/email.webp';

const SocialLinks = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Map of deep links with associated icons
  const deepLinkMap = {
    Facebook: {
      deepLink: (url) => `fb://profile/${url.split('/').pop()}`,
      icon: Facebook
    },
    Instagram: {
      deepLink: (url) => `instagram://user?username=${url.split('/').pop()}`,
      icon: Instagram
    },
    Twitter: {
      deepLink: (url) => `twitter://user?screen_name=${url.split('/').pop()}`,
      icon: Twitter
    },
    //YouTube: {
     // deepLink: (url) => `vnd.youtube:${url.split('/').pop()}`,
     // icon: YouTube
    //},
    Phone: {
      deepLink: (url) => `tel:${url}`,
      icon: Phone
    },
    Email: {
      deepLink: (url) => `mailto:${url}`,
      icon: Email
    }
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
    if (!deepLinkMap[platform]) return;

    const deepLink = deepLinkMap[platform].deepLink(url);
    
    if (isMobile() && deepLink) {
      window.location.href = deepLink;
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="social-links-container">
      {loading ? (
        <div className="social-links-loading">
          <img src={loadingImage} alt="Loading..." className="social-links-loading-img" />
        </div>
      ) : error ? (
        <p className="social-links-error">{error}</p>
      ) : socialLinks.length > 0 ? (
        socialLinks.map((link) => {
          const iconSrc = deepLinkMap[link.platform]?.icon || loadingImage; // Default to loading if missing

          return (
            <div
              key={link.id}
              onClick={() => handleLinkClick(link.platform, link.url)}
              className="social-link-item"
              role="button"
              tabIndex={0}
            >
              <img
                src={iconSrc}
                alt={link.platform}
                className="social-link-icon"
              />
            </div>
          );
        })
      ) : (
        <p className="social-links-no-available">No social links available</p>
      )}
    </div>
  );
};

export default SocialLinks;
