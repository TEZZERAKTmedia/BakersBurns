import React from 'react';
import '../Componentcss/store.css'; // Import the CSS file

const Store = () => {
  return (
    
    <div className="store-container">
      <div className="cover-up">
        <p className="note">This is a preveiw if you want to purchase any products please log in or sign up</p>
      </div>
      <h2>Store</h2>
      <iframe
        src="http://localhost:4001/store" // Change this to the appropriate URL
        style={{ top:'0', left:'0', width: '100vw', height: '100vh', border: 'none', position:'fixed' }}
        title="Store"
      ></iframe>
      
    </div>
  );
};

export default Store;
