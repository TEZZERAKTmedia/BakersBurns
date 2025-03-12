import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './about.css'; 
import Headshot from '../../assets/headshot.webp';
import SocialLink from '../../Components/navbar/socialLinks';

const About = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="about-container">
            <div>
                <h1 className="about-title" data-aos="fade-up">About the Artist</h1>
                <img
                    src={Headshot}
                    alt="Artist's portrait"
                    className="about-image"
                    data-aos="fade-up"
                />
                <p className="about-text">
                    Welcome to the world of burn design art by Kalea. With a passion for 
                    creating intricate and expressive pieces, Kalea Baker has been mastering 
                    the craft of pyrography for over 3 years. Inspired by the natural beauty 
                    of various materials, each piece tells a story and captures the essence 
                    of the artist's vision.
                </p>

                <h2 className="about-section-title">Our Work</h2>
                <p className="about-text">
                    Kalea specializes in custom burn designs on a variety of surfaces, including 
                    **wood, felt, suede, leather, and hats**. From detailed portraits and landscapes 
                    to abstract designs and personalized gifts, every piece is meticulously crafted, 
                    ensuring no two artworks are the same. The natural textures of these materials 
                    add depth and character to each creation, making every piece truly unique.
                </p>

                <h2 className="about-section-title">Our Process</h2>
                <p className="about-text">
                    The process of burn design, also known as pyrography, involves using a heated 
                    tool to create intricate patterns and artwork on **wood, leather, suede, and felt**. 
                    Kalea carefully selects high-quality materials, sketches the initial design, 
                    and then uses various tips and techniques to burn the artwork onto the surface. 
                    Each material reacts differently to the burning process, requiring precision, 
                    patience, and expertise to bring the designs to life. The final step includes 
                    sealing and finishing the artwork to enhance its durability and aesthetic appeal.
                </p>

                <h2 className="about-section-title">Get in Touch</h2>
                <p className="about-text">
                    If you're interested in commissioning a custom piece or learning more about burn 
                    design art, please don't hesitate to contact us. Follow Kalea on social media to 
                    stay updated on the latest creations and upcoming exhibitions.
                </p>

                <div className="about-button-container">
                    <SocialLink />
                </div>
            </div>
        </div>
    );
};

export default About;
