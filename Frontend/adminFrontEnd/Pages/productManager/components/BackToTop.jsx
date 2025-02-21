import React, { useState, useEffect } from 'react';

const BackToTop = ({ containerRef }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef?.current;

    const handleScroll = () => {
      if (container) {
        const scrollPos = container.scrollTop;
        const clientHeight = container.clientHeight;
        if (scrollPos > clientHeight * 0.7) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [containerRef]);

  const scrollToTop = () => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '40px',
        right: '40px',
        backgroundColor: 'var(--btn-bg)',
        color: 'var(--inverted-button-text)',
        border: 'none',
        padding: '12px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        zIndex: 10,
        display: isVisible ? 'block' : 'none',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      Back to Top
    </button>
  );
};

export default BackToTop;
