import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>About the Artist</h1>
            <img
                src="path_to_artist_photo.jpg" 
                alt="Artist's portrait" 
                style={styles.image}
            />
            <p style={styles.text}>
                Welcome to the world of woodburning art by Kalea Baker. With a passion for creating intricate and expressive pieces, Kalea Baker has been mastering the craft of pyrography for over 3 years. Inspired by the natural beauty of wood and the endless possibilities of this unique medium, each piece tells a story and captures the essence of the artist's vision.
            </p>
            <h2 style={styles.subheading}>Our Work</h2>
            <p style={styles.text}>
                [Artist's Name] specializes in creating custom woodburned art, ranging from detailed portraits and landscapes to abstract designs and personalized gifts. Every piece is meticulously crafted, ensuring that no two artworks are the same. The natural grain and texture of the wood are embraced, adding depth and character to each creation.
            </p>
            <h2 style={styles.subheading}>Our Process</h2>
            <p style={styles.text}>
                The process of woodburning, also known as pyrography, involves using a heated tool to burn designs onto wood surfaces. Kalea Baker begins with a careful selection of high-quality wood, followed by sketching the initial design. Using various tips and techniques, the design is then burned onto the wood, creating a permanent and lasting piece of art. The final step includes sealing and finishing the artwork to enhance its durability and beauty.
            </p>
            <h2 style={styles.subheading}>Get in Touch</h2>
            <p style={styles.text}>
                If you are interested in commissioning a custom piece or learning more about woodburning art, please don't hesitate to contact us. Follow Kalea Baker on social media to stay updated on the latest creations and upcoming exhibitions.
            </p>
            <button style={styles.button} >
                <Link to="/login">
                Contact the Artist
                </Link>
            </button>
        </div>
    );
};

const styles = {
    container: {
        padding: '40px 20px',
        maxWidth: '800px',
        margin: 'auto',
        fontFamily: 'Arial, sans-serif',
        color: '#444',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    },
    heading: {
        fontSize: '2.8em',
        textAlign: 'center',
        fontWeight: '300',
        color: '#333',
        marginBottom: '25px',
    },
    subheading: {
        fontSize: '1.75em',
        marginTop: '30px',
        marginBottom: '15px',
        color: '#666',
        fontWeight: '400',
    },
    text: {
        fontSize: '1.1em',
        lineHeight: '1.8',
        color: '#555',
        marginBottom: '15px',
    },
    image: {
        display: 'block',
        maxWidth: '100%',
        height: 'auto',
        margin: 'auto',
        marginBottom: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    },
    button: {
        display: 'block',
        margin: '40px auto 0',
        padding: '12px 28px',
        fontSize: '1em',
        fontWeight: 'bold',
        backgroundColor: '#333',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s, transform 0.2s',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
    buttonHover: {
        backgroundColor: '#555',
        transform: 'translateY(-2px)',
    }
};

export default About;
