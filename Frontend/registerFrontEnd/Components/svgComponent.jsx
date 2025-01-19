import React from 'react';
import './svg.css'; // External CSS file for styling

const SocialLinks = () => {
  const socialMediaLinks = [
    { name: 'Facebook', url: 'https://www.facebook.com' },
    { name: 'Twitter', url: 'https://www.twitter.com' },
    { name: 'Instagram', url: 'https://www.instagram.com' },
  ];

  return (
    <div className="social-links">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        width="150"
        height="150"
        className="animated-svg"
      >
        <g id="ViewLayer_LineSet">
          <g id="strokes">
            <path
              fill="none"
              stroke-width="3.0"
              stroke-linecap="butt"
              stroke-opacity="1.0"
              stroke="rgb(0, 0, 0)"
              stroke-linejoin="round"
              d="M 828.038,840.306 835.391,833.528 838.379,830.773 ..."
              className="animated-path"
            />
          </g>
        </g>
      </svg>
      <ul className="social-list">
        {socialMediaLinks.map((link) => (
          <li key={link.name} className="social-item">
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SocialLinks;
