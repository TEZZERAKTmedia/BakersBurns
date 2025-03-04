import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './about.css'; // Import external CSS
import Headshot from '../../assets/headshot.webp';

const About = () => {
    useEffect(() => {
        // Scroll to the top of the page on load
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
                    Welcome to the world of woodburning art by Kalea. With a passion for
                    creating intricate and expressive pieces, Kalea Baker has been mastering the
                    craft of pyrography for over 3 years. Inspired by the natural beauty of wood and
                    the endless possibilities of this unique medium, each piece tells a story and
                    captures the essence of the artist's vision.
                </p>

                <h2 className="about-section-title">Our Work</h2>
                <p className="about-text">
                    Kalea specializes in creating custom woodburned art, ranging from detailed
                    portraits and landscapes to abstract designs and personalized gifts. Every piece
                    is meticulously crafted, ensuring that no two artworks are the same. The natural
                    grain and texture of the wood are embraced, adding depth and character to each
                    creation.
                </p>

                <h2 className="about-section-title">Our Process</h2>
                <p className="about-text">
                    The process of woodburning, also known as pyrography, involves using a heated
                    tool to burn designs onto wood surfaces. Kalea begins with a careful
                    selection of high-quality wood, followed by sketching the initial design. Using
                    various tips and techniques, the design is then burned onto the wood, creating a
                    permanent and lasting piece of art. The final step includes sealing and
                    finishing the artwork to enhance its durability and beauty.
                </p>

                <h2 className="about-section-title">Get in Touch</h2>
                <p className="about-text">
                    If you are interested in commissioning a custom piece or learning more about
                    woodburning art, please don't hesitate to contact us. Follow Kalea on
                    social media to stay updated on the latest creations and upcoming exhibitions.
                </p>

                <div className="about-button-container">
                    <Link to="/in-app-messaging">
                        <button className="about-contact-button" data-aos="fade-up">
                            Contact Us
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default About;
