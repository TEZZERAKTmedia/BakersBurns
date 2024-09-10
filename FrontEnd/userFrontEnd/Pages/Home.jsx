import React from 'react';
import '../Pagecss/Home.css'; // Import the CSS file for styling
import { Link } from 'react-router-dom'; 
import ScrollVideoBackground from '../Components/Background';

const Home = () => {
  return (
    <div className="home-container">
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">BakersBurns</h1>
          <p className="hero-description">Unique Wood Burning Art by [Artist Name]</p>
          <Link to="/store" className="hero-btn">Shop Now</Link>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-content">
          <h2>About The Artist</h2>
          <p>
            Kalea is a passionate wood-burning artist specializing in creating intricate and one-of-a-kind designs. Each piece is made with dedication, precision, and a love for wood and fire. Explore our gallery to discover unique products that blend nature and craftsmanship.
          </p>
          <Link to="/about" className="about-btn">Learn More</Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products-section">
        <h2 className="featured-products-title">Featured Products</h2>
        <div className="products-gallery">
          <div className="product-card">
            <img src="path/to/product1.jpg" alt="Product 1" />
            <h3>Product Name 1</h3>
            <p>$50.00</p>
            <Link to="/product/1" className="product-btn">View Product</Link>
          </div>
          <div className="product-card">
            <img src="path/to/product2.jpg" alt="Product 2" />
            <h3>Product Name 2</h3>
            <p>$75.00</p>
            <Link to="/product/2" className="product-btn">View Product</Link>
          </div>
          <div className="product-card">
            <img src="path/to/product3.jpg" alt="Product 3" />
            <h3>Product Name 3</h3>
            <p>$100.00</p>
            <Link to="/product/3" className="product-btn">View Product</Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <h2>Get In Touch</h2>
        <p>
          For commissions, inquiries, or collaborations, feel free to contact me. Let's create something beautiful together!
        </p>
        <Link to="/contact" className="contact-btn">Contact Me</Link>
      </section>
    </div>
  );
};

export default Home;
