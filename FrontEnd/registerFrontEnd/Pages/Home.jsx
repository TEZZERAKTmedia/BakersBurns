import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../PagesCss/Home.css';
import { Link } from 'react-router-dom'; 
import { registerApi } from '../config/axios';
import moment from 'moment';

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

      {/* About Section */}
      <motion.section 
        className="about-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <div className="about-content">
          <motion.h1 
            className="about-title"
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



      {/* Contact Section */}
      <motion.section 
  className="contact-section"
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.2 }}
  variants={fadeIn}
>
  <h2 className="contact-title">Get In Touch</h2>
  <p className="contact-description">
    For commissions, inquiries, or collaborations, feel free to contact me. Let's create something beautiful together!
  </p>
  <a 
    href="mailto:bakersburns@gmail.com?subject=Inquiry from Website&body=Hello BakersBurns," 
    className="contact-btn"
  >
    Contact Me
  </a>
</motion.section>
    </div>
  );
};

export default Home;
