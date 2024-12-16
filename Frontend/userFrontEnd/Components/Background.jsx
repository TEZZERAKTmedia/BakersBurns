import React, { useEffect } from 'react';
import '../Componentcss/background.css';


const ScrollVideoBackground = () => {
  useEffect(() => {
    const totalSegments = 5; // Total number of video segments
    const segmentLength = 1 / totalSegments;

    // Handle scrolling and video segment playback
    const handleScroll = () => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = scrollPosition / maxScrollTop;

      let currentSegment = Math.floor(scrollFraction / segmentLength);
      let segmentProgress = (scrollFraction % segmentLength) / segmentLength;

      // Hide all segments and pause their playback
      document.querySelectorAll('.video-segment').forEach((video) => {
        video.style.display = 'none';
      });

      // Show the current segment and set the frame based on scroll
      const currentVideo = document.getElementById(`video-${currentSegment + 1}`);
      if (currentVideo) {
        currentVideo.style.display = 'block';
        const frameTime = segmentProgress * currentVideo.duration;
        currentVideo.currentTime = frameTime;
      }
    };

    // Preload video segments
    const preloadVideos = () => {
      document.querySelectorAll('.video-segment').forEach((video) => {
        video.preload = 'auto';
        video.style.display = 'none';
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('load', preloadVideos);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('load', preloadVideos);
    };
  }, []);

  return (
    <div id="background-container">
      <div id="video-wrapper">
        <video id="video-1" className="video-segment" src="../../../../media/page1.mp4" muted />
        <video id="video-2" className="video-segment" src="./assets/page2.mp4" muted />
        <video id="video-3" className="video-segment" src="./assets/page3.mp4" muted />
        <video id="video-4" className="video-segment" src="./assets/page4.mp4" muted />
        <video id="video-5" className="video-segment" src="./assets/page5.mp4" muted />
      </div>
    </div>
  );
};

export default ScrollVideoBackground;
