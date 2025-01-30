import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import MediaUploader from "../../Components/desktopMediaUploader";
import { adminApi } from "../../config/axios";
import { useProductContext } from "./ProductsContext";
import { motion, AnimatePresence } from "framer-motion";

const ProductForm = ({ product = {}, onClose }) => {
  const { fetchProducts, addProductWithMedia } = useProductContext();
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [missingFields, setMissingFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🛑 Refs to store form inputs for scrolling
  const inputRefs = {
    name: useRef(null),
    description: useRef(null),
    price: useRef(null),
    type: useRef(null),
    quantity: useRef(null),
  };

  const [newProduct, setNewProduct] = useState({
    name: product.name || "",
    description: product.description || "",
    price: product.price || 0,
    type: product.type || "",
    newType: "", // Store new type input separately
    quantity: product.quantity || 1,
    length: product.length || 0,
    width: product.width || 0,
    height: product.height || 0,
    weight: product.weight || 0,
    unit: product.unit || "standard", // Default to "Standard"
    thumbnail: null,
  });


  const [mediaPreviews, setMediaPreviews] = useState([]);

  useEffect(() => {
    fetchProducts(); // Fetch products when component mounts
  }, []);

  const validateFields = () => {
    const missing = [];
    for (const field in inputRefs) {
      if (!newProduct[field] || newProduct[field] <= 0) {
        missing.push(field);
      }
    }

    if (isAddingNewType && !newProduct.newType) {
      missing.push("newType"); // Ensure new type is filled when selected
    } else if (!isAddingNewType && !newProduct.type) {
      missing.push("type"); // Ensure type is selected when not adding a new one
    }

    return missing;
  };

 const handleSave = async () => {
    const missing = validateFields();

    if (missing.length > 0) {
      setMissingFields(missing);

      // Scroll to the first missing field
      const firstMissingField = missing[0];
      if (inputRefs[firstMissingField]?.current) {
        inputRefs[firstMissingField].current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        inputRefs[firstMissingField].current.focus();
      }
      return;
    }

    setIsLoading(true);
    try {
      const productData = {
        ...newProduct,
        type: isAddingNewType ? newProduct.newType : newProduct.type, // 🔹 Ensure correct type is used
        unit: newProduct.unit || "unit",
      };
      await addProductWithMedia(productData, mediaPreviews);
      fetchProducts();

      setSuccessMessage("Product saved successfully!");
      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="product-form-section">
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "fixed",
              top: "40px",
              right: "20px",
              backgroundColor: "#28a745",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              zIndex: 9999,
            }}
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <h2>{product.id ? "Edit Product" : "Add Product"}</h2>

      {/* Name */}
      <label>
        Product Name:
        <input
          ref={inputRefs.name}
          type="text"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          style={{ border: missingFields.includes("name") ? "2px solid red" : "" }}
        />
      </label>

      {/* Description */}
      <label>
        Description:
        <input
          ref={inputRefs.description}
          type="text"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          style={{ border: missingFields.includes("description") ? "2px solid red" : "" }}
        />
      </label>

      {/* Price */}
      <label>
        Price:
        <input
          ref={inputRefs.price}
          type="number"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          style={{ border: missingFields.includes("price") ? "2px solid red" : "" }}
        />
      </label>

      {/* Quantity */}
      <label>
        Quantity:
        <input
          ref={inputRefs.quantity}
          type="number"
          value={newProduct.quantity}
          onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
          style={{ border: missingFields.includes("quantity") ? "2px solid red" : "" }}
        />
      </label>

      {/* Type Selection */}
      <label>
        Product Type:
        <select
          ref={inputRefs.type}
          value={isAddingNewType ? "new" : newProduct.type}
          onChange={(e) => {
            if (e.target.value === "new") {
              setIsAddingNewType(true);
              setNewProduct({ ...newProduct, type: "", newType: "" });
            } else {
              setIsAddingNewType(false);
              setNewProduct({ ...newProduct, type: e.target.value, newType: "" });
            }
          }}
          style={{ border: missingFields.includes("type") ? "2px solid red" : "" }}
        >
          <option value="">Select a Type</option>
          <option value="new">Enter New Type</option>
        </select>
      </label>

      {/* Input for New Type */}
      {isAddingNewType && (
        <label>
          New Type:
          <input
            ref={inputRefs.newType}
            type="text"
            value={newProduct.newType}
            onChange={(e) => setNewProduct({ ...newProduct, newType: e.target.value })}
            style={{ border: missingFields.includes("newType") ? "2px solid red" : "" }}
          />
        </label>
      )}
      {/* ✅ Dimensions & Weight */}
      <div className="form-section">
        <label>Dimensions (inches/cm):</label>
        <div className="dimensions-inputs">
          <input type="number" placeholder="Length" ref={inputRefs.length} />
          <input type="number" placeholder="Width" ref={inputRefs.width} />
          <input type="number" placeholder="Height" ref={inputRefs.height} />
        </div>

        <label>Weight (lbs/kg):</label>
        <input type="number" placeholder="Weight" ref={inputRefs.weight} />

        <label>Measurement Unit:</label>
        <select
          value={newProduct.unit}
          onChange={(e) =>
            setNewProduct({ ...newProduct, unit: e.target.value })
          }
        >
          <option value="standard">Standard</option>
          <option value="metric">Metric</option>
        </select>
      </div>

   

      {/* Thumbnail Upload */}
      <div className="form-section">
      <label>
        Thumbnail:
        <p style={{color:'black'}}>JPEG, PNG, and GIF</p>
        <input type="file" accept="image/*" onChange={(e) => setNewProduct({ ...newProduct, thumbnail: e.target.files[0] })} />
      </label>
      </div>

      {/* Media Uploader */}
      <div className="form-section">
        <h1>Media Uploader</h1>
        <p style={{color:'black'}}>Accepted formats: JPEG, PNG, JPG, MP4, MOV, and AVI</p>
      <MediaUploader mode="add" maxMedia={10} initialMedia={mediaPreviews} onMediaChange={setMediaPreviews} />
      </div>
      

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
      
    </div>
  );
};

ProductForm.propTypes = {
  product: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ProductForm;

