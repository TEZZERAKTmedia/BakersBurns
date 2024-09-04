import React from 'react';

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
                Welcome to the world of woodburning art by [Artist's Name]. With a passion for creating intricate and expressive pieces, [Artist's Name] has been mastering the craft of pyrography for over [number] years. Inspired by the natural beauty of wood and the endless possibilities of this unique medium, each piece tells a story and captures the essence of the artist's vision.
            </p>
            <h2 style={styles.subheading}>Our Work</h2>
            <p style={styles.text}>
                [Artist's Name] specializes in creating custom woodburned art, ranging from detailed portraits and landscapes to abstract designs and personalized gifts. Every piece is meticulously crafted, ensuring that no two artworks are the same. The natural grain and texture of the wood are embraced, adding depth and character to each creation.
            </p>
            <h2 style={styles.subheading}>Our Process</h2>
            <p style={styles.text}>
                The process of woodburning, also known as pyrography, involves using a heated tool to burn designs onto wood surfaces. [Artist's Name] begins with a careful selection of high-quality wood, followed by sketching the initial design. Using various tips and techniques, the design is then burned onto the wood, creating a permanent and lasting piece of art. The final step includes sealing and finishing the artwork to enhance its durability and beauty.
            </p>
            <h2 style={styles.subheading}>Get in Touch</h2>
            <p style={styles.text}>
                If you are interested in commissioning a custom piece or learning more about woodburning art, please don't hesitate to contact us. Follow [Artist's Name] on social media to stay updated on the latest creations and upcoming exhibitions.
            </p>
            <button style={styles.button} onClick={() => window.location = 'contact.html'}>
                Contact the Artist
            </button>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: 'auto',
        fontFamily: 'Arial, sans-serif',
    },
    heading: {
        fontSize: '2.5em',
        textAlign: 'center',
        marginBottom: '20px',
    },
    subheading: {
        fontSize: '1.5em',
        marginTop: '20px',
        marginBottom: '10px',
    },
    text: {
        fontSize: '1em',
        lineHeight: '1.6',
        color: '#333',
    },
    image: {
        display: 'block',
        maxWidth: '100%',
        height: 'auto',
        margin: 'auto',
        marginBottom: '20px',
    },
    button: {
        display: 'block',
        margin: '20px auto',
        padding: '10px 20px',
        fontSize: '1em',
        backgroundColor: '#333',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    }
};

export default About;
