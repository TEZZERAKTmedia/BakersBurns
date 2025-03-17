import React, {useState, useEffect} from 'react';
import './InstagramEmbed.css';


const InstagramEmbed = () => {
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [iframeError, setIframeError] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if(!iframeLoaded) {
                setIframeError(true);

            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [iframeLoaded]);


    return (
        <div className='instagram-embedded-container'>
            {!iframeError && (
                <iframe
                src="https://www.instagram.com/bakers_burns"
                title="Instagram Feed"
                frameBorder="0"
                scrolling="no"
                onLoad={() => setIframeLoaded(true)} 
                ></iframe>
            )}
            {!iframeError && (
                <div className='instagram-fallback'>
                    <p>
                        Unable to display intagram feed 
                    </p>
                    <a href="https://www.instagram.com/bakers_burns" target="_blank" rel="noopener noreferrer">
                        https://www.instagram.com/bakers_burns
                    </a>
                </div>
            )}
        </div>
    )
}

export default InstagramEmbed;