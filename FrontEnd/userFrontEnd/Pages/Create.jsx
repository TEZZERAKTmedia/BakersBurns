import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import '../Pagecss/create.css'; // Import your CSS file
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('your-stripe-publishable-key'); // Replace with your Stripe publishable key

const Create = () => {
  const [selectedProduct, setSelectedProduct] = useState('cutting-board');
  const [texture, setTexture] = useState(null);
  const [texturePosition, setTexturePosition] = useState({ x: 0, y: 0 });
  const [textureScale, setTextureScale] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const [customCanvasImage, setCustomCanvasImage] = useState(null);
  const [customOverlayImage, setCustomOverlayImage] = useState(null);
  const controlsRef = useRef();

  const handleProductChange = (event) => {
    setSelectedProduct(event.target.value);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.translate(canvas.width, canvas.height); // Move the canvas origin to the bottom right
        ctx.scale(-1, -1);
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
          imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = avg;
          imageData.data[i + 3] = 255 - avg;  // Set alpha based on the inverse of the average value
        }
        ctx.putImageData(imageData, 0, 0);

        // Create a preview of the black and white image
        setPreviewImage(canvas.toDataURL());

        // Create the texture
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.wrapS = THREE.ClampToEdgeWrapping; // Prevent horizontal repetition
        texture.wrapT = THREE.ClampToEdgeWrapping; // Prevent vertical repetition
        texture.minFilter = THREE.LinearFilter; // Improve texture scaling
        texture.magFilter = THREE.LinearFilter; // Improve texture scaling
        setTexture(texture);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCustomCanvasImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomCanvasImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCustomOverlayImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomOverlayImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const response = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product: selectedProduct,
        texturePosition,
        textureScale,
        textureData: texture ? texture.image.toDataURL() : null, // Convert texture canvas to data URL if available
        customCanvasImage,
        customOverlayImage, // Include the custom image data URL if available
      }),
    });

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error(result.error.message);
    }
  };

  const handleRecenter = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="create-page">
      <h1>Customize Your Product</h1>
      <label htmlFor="product-select">Choose a product:</label>
      <select id="product-select" onChange={handleProductChange}>
        <option value="cutting-board">Cutting Board</option>
        <option value="hat-men">Hat (Men)</option>
        <option value="hat-womens">Hat (Women)</option>
        <option value="wall-hanging">Wall Hanging</option>
        <option value="custom-canvas">Custom Canvas</option>
      </select>
      <input type="file" accept="image/*" onChange={selectedProduct === 'custom-canvas' ? handleCustomCanvasImageUpload : handleImageUpload} />
      {selectedProduct === 'custom-canvas' && (
        <input type="file" accept="image/*" onChange={handleCustomOverlayImageUpload} />
      )}
      {previewImage && selectedProduct !== 'custom-canvas' && (
        <div>
          <h2>Preview:</h2>
          <img className="create-image-preview" src={previewImage} alt="Preview" />
        </div>
      )}
      {selectedProduct === 'custom-canvas' && (
        <div>
          {customCanvasImage && (
            <div className="create-page-note-outer">
              <h2>Canvas:
                <div className="create-page-note">
                <p>Please make sure this is a picture of just the canvas</p>
                </div>
              </h2>
              <img src={customCanvasImage} alt="Custom Canvas" style={{ width: '400px', height: '300px' }} />
            </div>
          )}
          {customOverlayImage && (
            <div>
              <h2>Image:</h2>
              <img src={customOverlayImage} alt="Overlay" style={{ width: '400px', height: '300px' }} />
            </div>
          )}
        </div>
      )}
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={10} />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} />
        {selectedProduct !== 'custom-canvas' && (
          <Product type={selectedProduct} texture={texture} position={texturePosition} scale={textureScale} />
        )}
        <OrbitControls ref={controlsRef} />
      </Canvas>
      <p className="note">Note: This preview is for reference only. The final product's detail may vary depending on the medium used.</p>
      <div id="controls">
        {selectedProduct !== 'custom-canvas' && (
          <>
            <label>
              Texture X Position:
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={texturePosition.x}
                onChange={(e) => setTexturePosition({ ...texturePosition, x: parseFloat(e.target.value) })}
              />
            </label>
            <label>
              Texture Y Position:
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={texturePosition.y}
                onChange={(e) => setTexturePosition({ ...texturePosition, y: parseFloat(e.target.value) })}
              />
            </label>
            <label>
              Texture Scale:
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={textureScale}
                onChange={(e) => setTextureScale(parseFloat(e.target.value))}
              />
            </label>
          </>
        )}
      </div>
      <button onClick={handleRecenter}>Recenter</button>
      <button onClick={handleCheckout}>Checkout</button>
    </div>
  );
};

const Product = ({ type, texture, position, scale }) => {
  const groupRef = useRef();
  const { nodes } = useGLTF('../models/products.glb'); // Correct path to your GLB file

  useFrame(() => {
    if (groupRef.current && texture) {
      const obj = groupRef.current.getObjectByName(type);
      if (obj) {
        texture.offset.set(position.x, position.y);
        texture.repeat.set(scale, scale);
        obj.material.map = texture;
        obj.material.needsUpdate = true; // Ensure the material is updated
      }
    }
  });

  return (
    <group ref={groupRef}>
      {Object.keys(nodes).map((key) =>
        key === type ? <primitive key={key} object={nodes[key]} position={[0, 0, 0]} /> : null
      )}
    </group>
  );
};

export default Create;
