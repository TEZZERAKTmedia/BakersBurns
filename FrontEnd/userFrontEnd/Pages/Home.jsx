import React, { useState, useEffect } from 'react';
import '../Pagecss/Home.css'; // Import the CSS file for styling
import { Link } from 'react-router-dom'; 
import { userApi } from '../config/axios';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // Fetch featured products on component mount
  useEffect(() => {
    const getFeaturedProducts = async () => {
      const products = await fetchFeaturedProducts();
      setFeaturedProducts(products);
    };
    getFeaturedProducts();
  }, []);

  // Function to fetch featured products
  const fetchFeaturedProducts = async () => {
    try {
      const response = await userApi.get('/store/get-featured-products');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  };

  return (
    <div className="home-container">
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">BakersBurns</h1>
          <p className="hero-description">Unique Wood Burning Art by Kalea Baker</p>
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

      {/* Featured Products Section */}
      <section className="featured-products-section">
        <h2 className="featured-products-title">Featured Products</h2>
        <div className="products-gallery">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <div key={product.id} className="product-card">
                {product.image ? (
                  <img
                    className="product-image"
                    src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${product.image}`}  // Use environment variable here
                    alt={product.name}
                  />
                ) : (
                  <p>No image</p>
                )}
                <h3>{product.name}</h3>
                <p>${product.price.toFixed(2)}</p>
                <Link to={`/product/${product.id}`} className="product-btn">View Product</Link>
              </div>
            ))
          ) : (
            <p>No featured products available</p>
          )}
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
