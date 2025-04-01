import React, { useState } from 'react';
import './social_links.css';

// Local icons
import Instagram from '../../assets/instagram.webp';
import Facebook from '../../assets/facebook.webp';
import Twitter from '../../assets/x.webp';
import Phone from '../../assets/phone.webp';
import Email from '../../assets/email.webp';

const SocialLinks = () => {
  // Hardcode your social links here
  const [socialLinks] = useState([
    {
      id: 1,
      platform: 'Facebook',
      url: 'https://www.facebook.com/kalea.baker.16'
    },
    {
      id: 2,
      platform: 'Instagram',
      url: 'https://www.instagram.com/bakers_burns/'
    },

    {
      id: 4,
      platform: 'Phone',
      url: '+1-970-712-7015'
    },
    {
      id: 5,
      platform: 'Email',
      url: 'bakersburns@gmail.com'
    }
  ]);

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
    

    Phone: {
      deepLink: (url) => `tel:${url}`,
      icon: Phone
    },
    Email: {
      deepLink: (url) => `mailto:${url}`,
      icon: Email
    }
  };

  // Check if the user is on a mobile device
  const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleLinkClick = (platform, url) => {
    if (!deepLinkMap[platform]) return;

    const deepLink = deepLinkMap[platform].deepLink(url);

    // Use deep link if on mobile, else open the web URL
    if (isMobile() && deepLink) {
      window.location.href = deepLink;
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="social-links-container">
      {socialLinks.length > 0 ? (
        socialLinks.map((link) => {
          const iconSrc = deepLinkMap[link.platform]?.icon;
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
        <p className="social-links-no-available">
          No social links available
        </p>
      )}
    </div>
  );
};

export default SocialLinks;
