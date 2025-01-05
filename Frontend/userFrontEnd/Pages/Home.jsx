import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../Pagecss/Home.css';
import { Link } from 'react-router-dom'; 
import { userApi } from '../config/axios';
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
    fetchUpcomingEvent();
  }, []);
  useEffect(() => {
    window.scrollTo(0,0)
  })

  const fetchFeaturedProducts = async () => {
    try {
      const response = await userApi.get('/store/get-featured-products');
      console.log("featured product api response:",response.data)
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  };

  const fetchUpcomingEvent = async () => {
    try {
      const response = await userApi.get('/user-event/upcoming'); // Adjust URL if necessary
      console.log("Fetched upcoming event:", response.data); // Log the returned data
      setUpcomingEvent(response.data);
    } catch (error) {
      console.error('Error fetching upcoming event:', error);
      setUpcomingEvent(null);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <div className="home-container" >
      <motion.h1 
            className='hero-title'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            BakersBurns
          </motion.h1>
      
      {/* Hero Section */}
      <motion.section 
        className="hero-section"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="hero-content">
          
          <p className="hero-description">Unique Wood Burning Art by Kalea Baker</p>
          <Link to="/store" className="hero-btn">Shop Now</Link>
        </div>
      </motion.section>

      {/* Upcoming Event Section */}
      {upcomingEvent && (
        <motion.section 
          className="upcoming-event-section"
          style={{
            backgroundColor: '#000',
            color: '#fff',
            padding: '2.5rem',
            borderRadius: '1.2rem',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            transition: 'transform 0.3s ease',
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeIn}
        >
          <motion.h2 style={{
              fontFamily: '"Dancing Script", cursive',
              fontSize: '2.5rem',
              color: '#ffeb3b',
              
            }}
          >
            Upcoming Event
          </motion.h2>
          <h3 style={{
            fontFamily: '"Dancing Script", cursive',
            fontSize: '2rem',
            margin: '1rem 0',
          }}>
            {upcomingEvent.name}
          </h3>
          <p style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: '1.2rem',
            color: '#e0e0e0',
            margin: '0.8rem 0',
          }}>
            {moment(upcomingEvent.date).format('MMMM Do, YYYY')} 
            {upcomingEvent.startTime && ` at ${moment(upcomingEvent.startTime, 'HH:mm').format('h:mm A')}`}
          </p>
          <p style={{
            fontFamily: '"Dancing Script", cursive',
            fontSize: '1.1rem',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '1rem auto',
          }}>
            {upcomingEvent.description}
          </p>
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
            style={{
              fontFamily: '"Dancing Script", cursive',
              fontSize: '3rem',
              color: 'Black',
              
            }}
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

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
  <motion.section 
    className="featured-products-section"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    variants={fadeIn}
  >
    <motion.h1 
      style={{
        fontFamily: '"Dancing Script", cursive',
        fontSize: '4rem',
        color: 'Black',
        
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1 }}
    >
      Featured Products
    </motion.h1>
    <motion.div 
      className="products-gallery"
      initial="hidden"
      whileInView="visible"
      variants={{ visible: { opacity: 1, transition: { staggerChildren: 0.3 } } }}
    >
      {featuredProducts.map((product) => (
        <motion.div 
          key={product.id} 
          className="product-card"
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        >
          {product.thumbnail ? (
            <img
              className="product-image"
              src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${product.thumbnail}`}
              alt={product.name}
            />
          ) : (
            <p>No image</p>
          )}
          <h3>{product.name}</h3>
          <p>${product.price.toFixed(2)}</p>
          <Link to={`/product/${product.id}`} className="product-btn">View Product</Link>
        </motion.div>
      ))}
    </motion.div>
  </motion.section>
)}

      {/* Contact Section */}
      <motion.section 
        className="contact-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <h2 style={{
            fontFamily: '"Dancing Script", cursive',
            fontSize: '2.5rem',
            color: 'black',
            
          }}>Get In Touch</h2>
        <p style={{ color: 'black'}}>
          For commissions, inquiries, or collaborations, feel free to contact me. Let's create something beautiful together!
        </p>
        <Link to="/in-app-messaging" className="contact-btn">Contact Me</Link>
      </motion.section>
    </div>
  );
};

export default Home;
