import React, { useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../util/cropImage";
import { adminApi } from "../config/axios";
import "react-easy-crop/react-easy-crop.css";
import "../Componentcss/add_product_form.css"; // Import CSS for styling

const AddProduct = ({ onProductAdded }) => {
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
  const [orders, setOrders] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [users, setUsers] = useState([]); // State to hold the list of users
  const [selectedProducts, setSelectedProducts] = useState([]); // Products added to the order
  const [productOptions, setProductOptions] = useState([]); // Dropdown product list
  const [products, setProducts] = useState([]); // Ensure this is declared
  const addProductFormRef = useRef(null); // Ref for Add Product Form
  const productBoxRef = useRef(null); //
  const [showAddProductButton, setShowAddProductButton] = useState(false);
  const [newOrder, setNewOrder] = useState({
    username: '',
    shippingAddress: '',
    
    trackingNumber: '',
    carrier: '',
    total: '',
    orderItems: [
      { productId: '', quantity: '', price: '' }, // Initial item
    ],
  });
  
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingOrder, setEditingOrder] = useState({});

  const fetchOrders = async () => {
    try {
      const response = await adminApi.get('/orders/get');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {

    
    
  
    fetchProducts();
    fetchUsers();
    fetchOrders();
  }, []);
  const fetchProducts = async () => {
    try {
      const response = await adminApi.get('/api/products/');
      console.log('Fetched products:', response.data);

      setProductOptions(
        response.data.map((product) => ({
          id: product.id,
          name: product.name,
          image: product.image || null, // Ensure image field is set correctly or null
          price: product.price,
        }))
      );
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingOrder((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewOrder((prev) => ({ ...prev, [name]: value }));
    }
  };
    //ITEM MANAGEMT
    
    const handleSelectProduct = (product) => {
      setSelectedProducts((prev) => [...prev, product]);
      setProductOptions((prev) => prev.filter((item) => item.id !== product.id));
    };
  
    const handleRemoveProduct = (product) => {
      setProductOptions((prev) => [...prev, product]);
      setSelectedProducts((prev) => prev.filter((item) => item.id !== product.id));
    };
    

    const fetchUsers = async () => {
      try {
        const response = await adminApi.get('/orders/get-users');
        setUsers(response.data.users); // Store usernames in the state
      } catch (error) {
        console.error('Error fetching users:', error);
      } 
    };

    const createOrder = async () => {
      try {
        const orderData = {
          ...newOrder,
          orderItems: selectedProducts.map((product) => ({
            productId: product.id,
            quantity: newOrder.quantity,
          })),
        };
        await adminApi.post('/orders/create', orderData)
        fetchOrders();
        setDialogOpen(false);
        console.log('Order Created:', orderData);
      } catch (error) {
        console.error('Error creating order:', error);
      }
    };


  
    const handleProductAdded = async (newProduct) => {
      try {
        setProducts((prev) => [...prev, newProduct]); // Optimistic update
        await fetchProducts(); // Refresh product list
      } catch (error) {
        console.error('Error fetching updated product list:', error);
      }
    };
  
    useEffect(() => {
      fetchProducts();
    }, []);


  const deleteOrder = async (orderId) => {
    try {
      await adminApi.delete(`/orders/delete/${orderId}`);
      fetchOrders(); // Refresh the orders list after deletion
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const updateOrder = async (orderId) => {
    try {
      await adminApi.put(`/orders/update/${orderId}`, editingOrder);
      setEditingOrderId(null);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // Function to get the tracking URL based on the carrier and tracking number
  const getTrackingLink = (carrier, trackingNumber) => {
    switch (carrier) {
      case 'UPS':
        return `https://www.ups.com/track?tracknum=${trackingNumber}`;
      case 'FedEx':
        return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`;
      case 'USPS':
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
      case 'DHL':
        return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
      default:
        return null;
    }
  };
  const handleScroll = () => {
    if (productBoxRef.current) {
      const scrollTop = productBoxRef.current.scrollTop;
      setShowAddProductButton(scrollTop > 0); // Show button if scrolled down
    }
  };

  // Scroll to the Add Product form
  const scrollToAddProductForm = () => {
    if (addProductFormRef.current) {
      addProductFormRef.current.scrollIntoView({ behavior: "smooth" });
    }
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
    if (newProduct.quantity <= 0) missing.push("quantity");

    if (missing.length > 0) {
      setMissingFields(missing);
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

      onProductAdded(response.data); // Notify parent component
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
    }
  };

  return (
    <div className="scalable-wrapper">
      <div className="add-product-container">
        <h2>Add New Product</h2>
        {dialogOpen && (
                  <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                      <h2>Create New Order</h2>
                      <div style={styles.inputContainer}>
                        <div nstyle={styles.formSection}>
                        <label>Username:</label>
                        <select
                          name="username"
                          value={newOrder.username}
                          onChange={handleInputChange}
                          style={styles.select}
                        >
                          <option value="">Select a User</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.username}>
                                      {user.username}
                              </option>
                            ))}
                        </select>
                        </div>

                        <div style={styles.formSection}>
                        <label>Tracking Number:</label>
                        <input
                          type="text"
                          name="trackingNumber"
                          value={newOrder.trackingNumber}
                          onChange={handleInputChange}
                          style={styles.input}
                        />
                        </div >
                        <div >
                        <label>
                    Carrier 
                  </label>

                  <select
                    value={newOrder.carrier}
                    onChange={(e) =>
                      setNewProduct({ ...newOrder, carrier: e.target.value })
                    }
                  >
                    <option value="">Select a Carrier</option>
                    <option value="UPS">UPS</option>
                    <option value="FedEx">FedEx</option>
                    <option value="USPS">USPS</option>
                    <option value="DHL">DHL</option>
                  </select>
                    </div>
                        <div style={styles.formSection}>
                        <label>Shipping Address:</label>
                        <textarea
                          name="shippingAddress"
                          value={newOrder.shippingAddress}
                          onChange={handleInputChange}
                          style={styles.textarea}
                        />
                        </div>

                      </div>

                      <div style={styles.boxContainer}>
                      {showAddProductButton && (
                    <button
                      onClick={scrollToAddProductForm}
                      style={styles.floatingButton}
                    >
                      +
                    </button>
                  )}
              {/* Existing Products Box */}
              <div 
              style={styles.box}
              onScroll={handleScroll}
              ref={productBoxRef}
              >

                <h3 style={{fontSize:'5vw'}}>Existing Products</h3>
                <div style={styles.productList}>

                  {productOptions.map((product) => (
                    <div
                      key={product.id}
                      
                      style={styles.formSection}
                      onClick={() => handleSelectProduct(product)}
                    >
                      <img
                        src={`${import.meta.env.VITE_BACKEND}/uploads/${product.image}`}
                        alt={product.name}
                        style={styles.productImage}
                      />
                      <div style={styles.formSection}>
                      <p style={styles.productTileLabel}>Name</p>
                      <p >  {product.name}</p>
                      </div>
                      <div style={styles.formSection}>
                      <p style={styles.productTileLabel}>Price</p>
                      <p >${product.price}</p>
                      </div>
                    </div>
                  ))}
                </div >


              </div>
              

              {/* Selected Items Box */}
              <div style={styles.box}>
              <h3 style={{fontSize:'5vw'}}>Selected Items</h3>
              <div style={styles.productList}>
                {selectedProducts.map((product, index) => (
                  <div key={product.id} style={styles.productTile}>
                    <div
                      style={styles.closeButton}
                      onClick={() => handleRemoveProduct(product)}
                    >
                      &times;
                    </div>
                    <img
                      src={`${import.meta.env.VITE_BACKEND}/uploads/${product.image}`}
                      alt={product.name}
                      style={styles.productImage}
                    />
                    <p>{product.name}</p>
                    <p>${product.price}</p>
                    <div style={styles.quantitySelector}>
                      <button
                        onClick={() =>
                          setSelectedProducts((prev) =>
                            prev.map((p, i) =>
                              i === index
                                ? { ...p, quantity: Math.max((p.quantity || 1) - 1, 1) }
                                : p
                            )
                          )
                        }
                        style={styles.quantityButton}
                      >
                        -
                      </button>
                      <span>{product.quantity || 1}</span>
                      <button
                        onClick={() =>
                          setSelectedProducts((prev) =>
                            prev.map((p, i) =>
                              i === index
                                ? {
                                    ...p,
                                    quantity: Math.min(
                                      (p.quantity || 1) + 1,
                                      p.availableStock
                                    ),
                                  }
                                : p
                            )
                          )
                        }
                        style={styles.quantityButton}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>

            <div style={styles.buttonContainer}>
              <button onClick={() => setDialogOpen(false)} style={styles.closeButton}>
                Cancel
              </button>
              <button style={styles.createButton} onClick={createOrder}>
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
        <label>
          Product Name {missingFields.includes("name") && <span>*</span>}
        </label>
        <input
          type="text"
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
          value={newProduct.type}
          onChange={(e) =>
            setNewProduct({ ...newProduct, type: e.target.value })
          }
          placeholder="Product Type"
          className="add-product-form-input"
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
