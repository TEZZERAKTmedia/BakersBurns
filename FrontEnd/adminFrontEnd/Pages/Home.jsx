import React from 'react';
import { Link } from 'react-router-dom';
import '../Pagecss/Home.css'; // Import the CSS file for styling

const Home = () => {
  return (
    <div className="home-container">
      <div className="background-image"></div>
      <div className="content">
        <h1>Admin Dashboard</h1>
        <p>Select a section to manage:</p>
        <ul className="home-app-tiles">
          <li className="home-tile">
            <Link to="/gallery">
              <div className="tile-content">
                <h3>Gallery</h3>
                <p>Manage your gallery here</p>
              </div>
            </Link>
          </li>
          <li className="home-tile">
            <Link to="/product-manager">
              <div className="tile-content">
                <h3>Product Manager</h3>
                <p>Manage products and inventory</p>
              </div>
            </Link>
          </li>
          <li className="home-tile">
            <Link to="/layout">
              <div className="tile-content">
                <h3>User Preview</h3>
                <p>Preview the user layout</p>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
