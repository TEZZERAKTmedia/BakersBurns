import React from 'react';
import { Link } from 'react-router-dom';
import '../Pagecss/Home.css'; // Import the CSS file for styling

const Home = () => {
  return (
    <div className="home-container">
      <div className="background-image"></div>
      <div className="content">
        <h1 className="home-page-header">Admin Dashboard</h1>

        <ul className="home-app-tiles">
        
        <li className="home-tile">
            <Link  style={{textDecoration: 'none'}} to="/orders">
              <div className='tile-content'>
                <h3>Orders</h3>
                <p>Manage orders</p>
              </div>
            </Link>
          </li>

          <li className="home-tile">
            <Link style={{textDecoration: 'none'}} to="/product-manager">
              <div className="tile-content">
                <h3>Product Manager</h3>
                <p className='home-tile-description'>Manage products and inventory</p>
              </div>
            </Link>
          </li>
          
          <li className="home-tile">
            <Link  style={{textDecoration: 'none'}} to="/gallery">
              <div className="tile-content">
                <h3>Gallery</h3>
                <p className='home-tile-description'>Manage your gallery here</p>
              </div>
            </Link>
          </li>
          <li className="home-tile">
            <div  style={{textDecoration: 'none'}}>
            <a style={{textDecoration: 'none'}} href={import.meta.env.VITE_USER} target="_blank" rel="noopener noreferrer">
              <div className="tile-content">
                <h3>User App Preview</h3>
                <p className='home-tile-description'>Check out the user app here</p>
              </div>
              </a>
            </div>
          </li>


          <li className="home-tile">
            <Link style={{textDecoration: 'none'}} to="/messaging">
              <div className="tile-content">
                <h3>Messaging</h3>
                <p className='home-tile-description'>Contact users using in app messaging</p>
              </div>
            </Link>
          </li>
          <li className="home-tile">
            <Link style={{textDecoration: 'none'}} to="/email">
              <div className='tile-content'>
                <h3>Email</h3>
                <p className='home-tile-description'>Contact users using email. (Will only work with opted in users)</p>
              </div>
            </Link>
          </li>

        </ul>
      </div>
    </div>
  );
};

export default Home;
