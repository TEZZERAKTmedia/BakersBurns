import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom'; 
import moment from 'moment';
import './Home.css';
import { registerApi } from '../../config/axios';

// Import images
import img1 from '../../assets/img1.webp';
import img2 from '../../assets/img2.webp';
import img3 from '../../assets/img3.webp';
import img4 from '../../assets/img4.webp';
import img5 from '../../assets/img5.webp';
import img6 from '../../assets/img6.webp';

// Import other components
import SocialLinks from '../../Components/navbar/socialLinks';
import CollageOverlay from './CollageOverlay';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);                       
  const [upcomingEvent, setUpcomingEvent] = useState(null);

  useEffect(() => {
    const getFeaturedProducts = async () => {
      const products = await fetchFeaturedProducts();
      setFeaturedProducts(products);
    };

    const getUpcomingEvent = async () => {
      const event = await fetchUpcomingEvent();
      setUpcomingEvent(event);
    };

    getFeaturedProducts();
    getUpcomingEvent();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await registerApi.get('/register-store/get-featured-products');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  };

  const fetchUpcomingEvent = async () => {
    try {
      const response = await registerApi.get('/event/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming event:', error);
      return null;
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  // Define collage items with custom positions, z-index, and parallax factors.
  const collageItems = [
    { src: img1, top: '10%', left: '5%', zIndex: 3, parallaxFactor: 0.5 },
    { src: img2, top: '20%', left: '40%', zIndex: 2, parallaxFactor: 1.3 },
    { src: img3, top: '50%', left: '10%', zIndex: 1, parallaxFactor: 1.6 },
    { src: img4, top: '60%', left: '60%', zIndex: 3, parallaxFactor: 1.9 },
    { src: img5, top: '30%', left: '80%', zIndex: 2, parallaxFactor: 2.2 },
    { src: img6, top: '70%', left: '30%', zIndex: 1, parallaxFactor: 2.5 },
  ];

  return (
    <div className="home-container">
      
      {/* Hero Section */}
      <motion.section 
        className="hero-section"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="hero-content">
          <motion.h1 
            className="hero-title"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            BakersBurns
          </motion.h1>
          <p className="hero-description">Unique Wood Burning Art by Kalea Baker</p>
          <Link to="/store" className="hero-btn">Shop Now</Link>
        </div>
      </motion.section>

      {/* Collage Overlay */}
      <CollageOverlay items={collageItems} />

      {/* Upcoming Event Section */}
      {upcomingEvent && (
        <motion.section 
          className="upcoming-event-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeIn}
        >
          <motion.h2 className="upcoming-event-title">Upcoming Event</motion.h2>
          <h3 className="upcoming-event-name">{upcomingEvent.name}</h3>
          <p className="upcoming-event-date">
            {moment(upcomingEvent.date).format('MMMM Do, YYYY')}
            {upcomingEvent.startTime && ` at ${moment(upcomingEvent.startTime, 'HH:mm').format('h:mm A')}`}
          </p>
          <p className="upcoming-event-description">{upcomingEvent.description}</p>
          <Link to="/event" className="upcoming-event-btn">See All Events</Link>
        </motion.section>
      )}
         <motion.section 
        className="home-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
        style={{height:'80%'}}
      >
       
       
      </motion.section>

      {/* Get In Touch Section */}
      <motion.section 
        className="home-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <h2 className="home-title">Get In Touch</h2>
        <p className="contact-description">
          For commissions, inquiries, or collaborations, feel free to contact me. Let's create something beautiful together!
        </p>
        <SocialLinks />
      </motion.section>

      {/* About Section */}
      <motion.section 
        className="home-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <div className="about-content">
          <motion.h1 
            className="home-title"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            About the Artist
          </motion.h1>
          <p>
            Kalea is a passionate wood-burning artist specializing in creating intricate and one-of-a-kind designs. Each piece is made with dedication, precision, and a love for wood and fire. Explore our gallery to discover unique products that blend nature and craftsmanship.
          </p>
          <Link to="/about" className="about-btn">Learn More</Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
