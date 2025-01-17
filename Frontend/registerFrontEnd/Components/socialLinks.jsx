import React from 'react';

// Import the PNG images
import facebookIcon from '../assets/facebook.png';
import phoneIcon from '../assets/phone.png';
import instagramIcon from '../assets/instagram.png';
import emailIcon from '../assets/email.png';

// Social links data
const socialLinks = [
    { name: 'Facebook', icon: facebookIcon, url: 'https://www.facebook.com' },
    { name: 'Instagram', icon: instagramIcon, url: 'https://www.instagram.com' },
    {
      name: 'Phone',
      icon: phoneIcon,
      onClick: () => window.location.href = 'tel:+1234567890', // Use a virtual number
    },
    {
      name: 'Email',
      icon: emailIcon,
      onClick: () => window.location.href = 'mailto:support@example.com', // Use a generic email
    },
  ];
  
  const SocialLinks = () => (
    <div style={styles.container}>
      {socialLinks.map((link) => (
        <div
          key={link.name}
          onClick={link.onClick}
          style={styles.link}
          role="button"
          tabIndex={0}
        >
          <img src={link.icon} alt={link.name} style={styles.icon} />
        </div>
      ))}
    </div>
  );
  

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

export default SocialLinks;
