import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
    useEffect(() => {
        // Scroll to the top of the page on load
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="body" style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', backgroundColor:'#ffffffbe'}}>
            <div>
                <h1 style={{ marginTop: '100px', textAlign: 'center', fontSize: '2rem' , fontFamily:'Dancing Script'}}>
                    About the Artist
                </h1>
                <img
                    src="path_to_artist_photo.jpg"
                    alt="Artist's portrait"
                    style={{
                        display: 'block',
                        margin: '1rem auto',
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '8px'
                    }}
                    data-aos="fade-up"
                />
                <p style={{ textAlign: 'justify', lineHeight: '1.6rem' }}>
                    Welcome to the world of woodburning art by Kalea. With a passion for
                    creating intricate and expressive pieces, Kalea Baker has been mastering the
                    craft of pyrography for over 3 years. Inspired by the natural beauty of wood and
                    the endless possibilities of this unique medium, each piece tells a story and
                    captures the essence of the artist's vision.
                </p>
                <h2 style={{ marginTop: '1.5rem', fontSize: '1.5rem' }}>Our Work</h2>
                <p style={{ textAlign: 'justify', lineHeight: '1.6rem' }}>
                    Kalea specializes in creating custom woodburned art, ranging from detailed
                    portraits and landscapes to abstract designs and personalized gifts. Every piece
                    is meticulously crafted, ensuring that no two artworks are the same. The natural
                    grain and texture of the wood are embraced, adding depth and character to each
                    creation.
                </p>
                <h2 style={{ marginTop: '1.5rem', fontSize: '1.5rem' }}>Our Process</h2>
                <p style={{ textAlign: 'justify', lineHeight: '1.6rem' }}>
                    The process of woodburning, also known as pyrography, involves using a heated
                    tool to burn designs onto wood surfaces. Kalea begins with a careful
                    selection of high-quality wood, followed by sketching the initial design. Using
                    various tips and techniques, the design is then burned onto the wood, creating a
                    permanent and lasting piece of art. The final step includes sealing and
                    finishing the artwork to enhance its durability and beauty.
                </p>
                <h2 style={{ marginTop: '1.5rem', fontSize: '1.5rem' }}>Get in Touch</h2>
                <p style={{ textAlign: 'justify', lineHeight: '1.6rem' }}>
                    If you are interested in commissioning a custom piece or learning more about
                    woodburning art, please don't hesitate to contact us. Follow Kalea on
                    social media to stay updated on the latest creations and upcoming exhibitions.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <Link to="/in-app-messaging">
                        <button
                            style={{
                                padding: '0.8rem 1.5rem',
                                fontSize: '1rem',
                                borderRadius: '5px',
                                backgroundColor: '#007BFF',
                                color: '#fff',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                            data-aos="fade-up"
                        >
                            Contact Us
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default About;
