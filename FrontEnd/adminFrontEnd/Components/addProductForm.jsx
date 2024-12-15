import React, { useState, useRef } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../util/cropImage";
import { adminApi } from "../config/axios";
import  {useNotification}  from "./notification/notification";
import "react-easy-crop/react-easy-crop.css";
import "../Componentcss/add_product_form.css";

const AddProduct = ({ onProductAdded }) => {
  const { showNotification } = useNotification();
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    image: null,
    type: "",
    quantity: 1,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [missingFields, setMissingFields] = useState([]);

  // Refs for each field
  const refs = {
    name: useRef(null),
    description: useRef(null),
    price: useRef(null),
    type: useRef(null),
    quantity: useRef(null),
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, image: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(imagePreview, croppedAreaPixels);
      const file = new File([croppedImage], newProduct.image.name, {
        type: "image/png",
      });
      setNewProduct({ ...newProduct, image: file });
      setCropping(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProduct = async () => {
    const missing = [];
    if (!newProduct.name) missing.push("name");
    if (!newProduct.description) missing.push("description");
    if (!newProduct.price || newProduct.price <= 0) missing.push("price");
    if (!newProduct.type) missing.push("type");
    
    // Allow quantity to be 0
    if (newProduct.quantity === null || newProduct.quantity === undefined) {
      missing.push("quantity");
    }
  
    if (missing.length > 0) {
      setMissingFields(missing);
      showNotification("Please fill out all required fields", "error");
  
      // Scroll to the first missing field
      const firstMissingField = refs[missing[0]];
      if (firstMissingField && firstMissingField.current) {
        firstMissingField.current.scrollIntoView({ behavior: "smooth" });
        firstMissingField.current.focus();
      }
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("price", newProduct.price);
      formData.append("type", newProduct.type);
      formData.append("image", newProduct.image);
      formData.append("quantity", newProduct.quantity);
  
      const response = await adminApi.post("/api/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      onProductAdded(response.data);
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        image: null,
        type: "",
        quantity: 1,
      });
      setImagePreview("");
    } catch (error) {
      console.error("Error adding product:", error);
      showNotification("Error adding product. Please try again.", "error");
    }
  };
  

  return (
    <div className="scalable-wrapper">
      <div className="add-product-container">
        <h2>Add New Product</h2>
        <label>
          Product Name {missingFields.includes("name") && <span>*</span>}
        </label>
        <input
          type="text"
          ref={refs.name}
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
          placeholder="Product Name"
        />

        <label>
          Product Description {missingFields.includes("description") && (
            <span>*</span>
          )}
        </label>
        <textarea
          ref={refs.description}
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
          placeholder="Product Description"
        />

        <label>
          Price {missingFields.includes("price") && <span>*</span>}
        </label>
        <input
          type="number"
          ref={refs.price}
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
          placeholder="Price"
        />

        <label>
          Quantity {missingFields.includes("quantity") && <span>*</span>}
        </label>
        <input
          type="number"
          ref={refs.quantity}
          value={newProduct.quantity}
          onChange={(e) =>
            setNewProduct({ ...newProduct, quantity: e.target.value })
          }
          placeholder="Quantity"
        />

        <label>
          Product Type {missingFields.includes("type") && <span>*</span>}
        </label>
        <input
          type="text"
          ref={refs.type}
          value={newProduct.type}
          onChange={(e) =>
            setNewProduct({ ...newProduct, type: e.target.value })
          }
          placeholder="Product Type"
        />

        <label>Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />

        {imagePreview && cropping && (
          <div className="cropper-container">
            <Cropper
              image={imagePreview}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={(_, croppedAreaPixels) =>
                setCroppedAreaPixels(croppedAreaPixels)
              }
              onZoomChange={setZoom}
            />
            <button onClick={handleCrop}>Crop</button>
          </div>
        )}

        <button onClick={handleAddProduct}>Add Product</button>
      </div>
    </div>
  );
};

export default AddProduct;
