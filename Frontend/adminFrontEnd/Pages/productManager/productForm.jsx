import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import MediaUploader from "../../Components/desktopMediaUploader";
import { useProductContext } from "./ProductsContext";
import { motion, AnimatePresence } from "framer-motion";
import LoadingPage from "../../Components/loading";
import imageCompression from "browser-image-compression";

const ProductForm = ({ product = {}, onClose }) => {
  const { fetchProducts, addProductWithMedia, fetchProductTypes, productTypes } = useProductContext();
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [missingFields, setMissingFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Updated inputRefs to include dimensions & weight
  const inputRefs = {
    name: useRef(null),
    description: useRef(null),
    price: useRef(null),
    quantity: useRef(null),
    type: useRef(null),
    newType: useRef(null),
    thumbnail: useRef(null),
    length: useRef(null),
    width: useRef(null),
    height: useRef(null),
    weight: useRef(null),
  };

  // Initialize newProduct with defaults (for numeric fields, default to 0 or 1 as appropriate)
  const [newProduct, setNewProduct] = useState({
    name: product.name || "",
    description: product.description || "",
    price: product.price || 0,
    type: product.type || "",
    newType: "",
    quantity: product.quantity || 1,
    length: product.length || 0,
    width: product.width || 0,
    height: product.height || 0,
    weight: product.weight || 0,
    unit: product.unit || "standard",
    thumbnail: null,
  });

  const [mediaPreviews, setMediaPreviews] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchProductTypes();
  }, []);

  const validateFields = () => {
    const missing = [];
    if (!newProduct.name.trim()) missing.push("name");
    if (!newProduct.description.trim()) missing.push("description");
    if (!newProduct.price || newProduct.price <= 0) missing.push("price");
    if (!newProduct.quantity || newProduct.quantity <= 0) missing.push("quantity");
    if (!newProduct.thumbnail) missing.push("thumbnail");
    if (!newProduct.length || newProduct.length <= 0) missing.push("length");
    if (!newProduct.width || newProduct.width <= 0) missing.push("width");
    if (!newProduct.height || newProduct.height <= 0) missing.push("height");
    if (!newProduct.weight || newProduct.weight <= 0) missing.push("weight");

    if (isAddingNewType) {
      if (!newProduct.newType.trim()) {
        missing.push("newType");
      } else {
        setNewProduct((prev) => ({ ...prev, type: prev.newType.trim() }));
      }
    } else if (!newProduct.type.trim()) {
      missing.push("type");
    }
    return missing;
  };

  const handleSave = async () => {
    const missing = validateFields();
    if (missing.length > 0) {
      setMissingFields(missing);
      const firstMissingField = missing[0];
      if (inputRefs[firstMissingField]?.current) {
        inputRefs[firstMissingField].current.scrollIntoView({ behavior: "smooth", block: "center" });
        inputRefs[firstMissingField].current.focus();
      }
      return;
    }

    setIsLoading(true);
    try {
      const productData = {
        ...newProduct,
        type: isAddingNewType ? newProduct.newType.trim() : newProduct.type.trim(),
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

  // Utility functions for mobile-friendly number inputs
  const handleNumberFocus = (field) => {
    if (newProduct[field] === 0) {
      setNewProduct((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleNumberBlur = (field, defaultValue = 0) => (e) => {
    if (e.target.value === "") {
      setNewProduct((prev) => ({ ...prev, [field]: defaultValue }));
    }
  };

  const handleNumberChange = (field, parser = parseFloat) => (e) => {
    const val = parser(e.target.value);
    setNewProduct((prev) => ({ ...prev, [field]: val }));
  };

  /**
   * Handle thumbnail change with compression to WebP
   */
  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 1, // maximum file size in MB
          maxWidthOrHeight: 1920, // maximum dimension
          useWebWorker: true,
          fileType: "image/webp", // convert to WebP
        };
        const compressedFile = await imageCompression(file, options);
        const newFile = new File([compressedFile], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" });
        setNewProduct((prev) => ({ ...prev, thumbnail: newFile }));
      } catch (error) {
        console.error("Thumbnail compression failed:", error);
        setNewProduct((prev) => ({ ...prev, thumbnail: file }));
      }
    }
  };

  return (
    <div className="form-section">
      {isLoading ? (
        <LoadingPage />
      ) : (
        <>
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

          <label>
            Price:
            <input
              ref={inputRefs.price}
              type="number"
              inputMode="decimal"
              placeholder="Enter price"
              value={newProduct.price === 0 ? "" : newProduct.price}
              onFocus={() => handleNumberFocus("price")}
              onBlur={handleNumberBlur("price", 0)}
              onChange={handleNumberChange("price", parseFloat)}
              style={{ border: missingFields.includes("price") ? "2px solid red" : "" }}
            />
          </label>

          <label>
            Quantity:
            <input
              ref={inputRefs.quantity}
              type="number"
              inputMode="numeric"
              placeholder="Enter quantity"
              value={newProduct.quantity === 0 ? "" : newProduct.quantity}
              onFocus={() => handleNumberFocus("quantity")}
              onBlur={handleNumberBlur("quantity", 1)}
              onChange={handleNumberChange("quantity", parseInt)}
              style={{ border: missingFields.includes("quantity") ? "2px solid red" : "" }}
            />
          </label>

          {/* Dimensions & Weight Section */}
          <div className="form-section">
            <label>Dimensions (inches/cm):</label>
            <div className="dimensions-inputs" style={{ display: "flex", gap: "10px" }}>
              <input
                type="number"
                placeholder="Length"
                ref={inputRefs.length}
                inputMode="numeric"
                value={newProduct.length === 0 ? "" : newProduct.length}
                onFocus={() => handleNumberFocus("length")}
                onBlur={handleNumberBlur("length", 0)}
                onChange={handleNumberChange("length", parseFloat)}
                style={{ border: missingFields.includes("length") ? "2px solid red" : "" }}
              />
              <input
                type="number"
                placeholder="Width"
                ref={inputRefs.width}
                inputMode="numeric"
                value={newProduct.width === 0 ? "" : newProduct.width}
                onFocus={() => handleNumberFocus("width")}
                onBlur={handleNumberBlur("width", 0)}
                onChange={handleNumberChange("width", parseFloat)}
                style={{ border: missingFields.includes("width") ? "2px solid red" : "" }}
              />
              <input
                type="number"
                placeholder="Height"
                ref={inputRefs.height}
                inputMode="numeric"
                value={newProduct.height === 0 ? "" : newProduct.height}
                onFocus={() => handleNumberFocus("height")}
                onBlur={handleNumberBlur("height", 0)}
                onChange={handleNumberChange("height", parseFloat)}
                style={{ border: missingFields.includes("height") ? "2px solid red" : "" }}
              />
            </div>

            <label>Weight (lbs/kg):</label>
            <input
              type="number"
              placeholder="Enter weight"
              ref={inputRefs.weight}
              inputMode="numeric"
              value={newProduct.weight === 0 ? "" : newProduct.weight}
              onFocus={() => handleNumberFocus("weight")}
              onBlur={handleNumberBlur("weight", 0)}
              onChange={handleNumberChange("weight", parseFloat)}
              style={{ border: missingFields.includes("weight") ? "2px solid red" : "" }}
            />

            <label>Measurement Unit:</label>
            <select
              value={newProduct.unit}
              onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
            >
              <option value="standard">Standard</option>
              <option value="metric">Metric</option>
            </select>
          </div>

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
              {productTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
              <option value="new">Enter New Type</option>
            </select>
          </label>

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

          <div className="form-section" style={{ border: missingFields.includes("thumbnail") ? "2px solid red" : "" }}>
            <label>
              Thumbnail:
              <p style={{ color: "black" }}>JPEG, PNG, and GIF</p>
              {/* Use handleThumbnailChange to compress/convert the thumbnail */}
              <input
                ref={inputRefs.thumbnail}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
            </label>
          </div>

          <div className="form-section">
            <h1 className="title">Media Uploader</h1>
            <p style={{ color: "black" }}>Accepted formats: JPEG, PNG, JPG, MP4, MOV, and AVI</p>
            <MediaUploader mode="add" maxMedia={10} initialMedia={mediaPreviews} onMediaChange={setMediaPreviews} />
          </div>

          <div
            className="form-section"
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              gap: "10px"
            }}
          >
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn" onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

ProductForm.propTypes = {
  product: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ProductForm;
