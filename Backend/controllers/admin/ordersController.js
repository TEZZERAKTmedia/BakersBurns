const Order = require('../../models/order');
const OrderItem = require('../../models/orderItem');
const User = require('../../models/user');
const Product = require('../../models/product');
const {sendEmailNotification } = require('../../utils/statusEmail');
const {decrypt} = require('../../utils/encrypt');


const sendStatusNotification = async (order, status) => {
    const user = await User.findByPk(order.userId);
    if (!user) {
      console.error(`User not found for order ID: ${order.id}`);
      return;
    }
  
    let emailStatus = status;
    if (status === 'Processing' && order.trackingNumber) {
      emailStatus = 'Tracking Added';
    }
  
    sendEmailNotification(user.email, order.trackingNumber || 'N/A', emailStatus);
  };
// Create a new order
const createOrder = async (req, res) => {
  const { username, shippingAddress, orderItems, trackingNumber, carrier, total } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: 'User not found. Please check the username and try again.' });
    }

    const initialStatus = trackingNumber ? 'Shipped' : 'Processing';

    const newOrder = await Order.create({
      userId: user.id,
      shippingAddress,
      trackingNumber,
      carrier,
      total,
      status: initialStatus,
    });

    const items = orderItems.map((item) => ({
      orderId: newOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      total: item.price * item.quantity, // Ensure item total is calculated
    }));

    await OrderItem.bulkCreate(items);

    const orderDetails = {
      shippingAddress,
      carrier,
      total,
      orderItems: orderItems.map((item) => ({
        name: item.name, // Ensure name is included in the frontend request
        quantity: item.quantity,
        price: item.price,
      })),
    };

    await sendEmailNotification(user.email, trackingNumber, initialStatus, orderDetails);

    res.status(201).json({ message: 'Order created successfully.', order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error });
  }
};



const generateTrackingLink = (carrier, trackingNumber) => {
    let baseUrl;
    switch (carrier.toLowerCase()) {
        case 'ups':
            baseUrl = `https://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=${trackingNumber}`;
            break;
        case 'fedex':
            baseUrl = `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
            break;
        case 'usps':
            baseUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
            break;
        case 'dhl':
            baseUrl = `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}&brand=DHL`;
            break;
        default:
            throw new Error('Unsupported carrier');
    }
    return baseUrl;
};

const updateTracking = async (req, res) => {
  const { id } = req.params; // Order ID
  const { trackingNumber, carrier } = req.body;

  try {
    const order = await Order.findByPk(id, {
      include: [{ model: User, as: 'user' }],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const previousTrackingNumber = order.trackingNumber;
    const previousCarrier = order.carrier;
    const isNewTracking = trackingNumber && (trackingNumber !== previousTrackingNumber || carrier !== previousCarrier);

    // Update tracking details
    order.trackingNumber = trackingNumber || order.trackingNumber;
    order.carrier = carrier || order.carrier;
    if (trackingNumber && order.status !== 'Shipped') {
      order.status = 'Shipped';
    }

    await order.save();

    // Send tracking email
    if (trackingNumber) {
      sendEmailNotification(order.user.email, trackingNumber, 'Shipped', {
        shippingAddress: order.shippingAddress || 'N/A',
        carrier: carrier || 'N/A',
        total: order.total || 0,
        orderItems: [],
      });
    }

    // Register webhook for UPS tracking if a new tracking number is added
    if (isNewTracking && carrier.toLowerCase() === "ups") {
      try {
        await subscribeToUpsWebhook(trackingNumber);
        console.log(`Successfully subscribed to UPS webhook for ${trackingNumber}`);
      } catch (error) {
        console.error(`Failed to subscribe UPS webhook:`, error.message);
      }
    }

    res.status(200).json({
      message: 'Tracking information updated successfully.',
      order,
    });
  } catch (error) {
    console.error('Error updating tracking information:', error);
    res.status(500).json({ message: 'Error updating tracking information', error: error.message });
  }
};


// Get all orders
const getAllOrders = async (req, res) => {
    try {
      const orders = await Order.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username', 'email'],
          },
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['name', 'thumbnail', 'price'],
              },
            ],
          },
        ],
        attributes: [
          'id',
          'userId',
          'shippingAddress',
          'trackingNumber',
          'carrier',
          'total',
          'status',
          'createdAt',
          'updatedAt',
        ],
      });
  
      res.status(200).json({ message: 'Orders fetched successfully.', orders });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Error fetching orders', error });
    }
  };

// Get order by IDx
const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Generate tracking link if the order has tracking info
        let trackingLink = null;
        if (order.trackingNumber && order.carrier) {
            trackingLink = generateTrackingLink(order.carrier, order.trackingNumber);
        }

        res.status(200).json({ 
            message: 'Order fetched successfully', 
            order: { ...order.toJSON(), trackingLink: trackingLink || 'Tracking info not available' }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error });
    }
};




// Update an existing order
const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const { status, trackingNumber, carrier, shippingAddress } = req.body;

  try {
      const order = await Order.findByPk(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      // Determine if subscription is needed
      const shouldSubscribe = trackingNumber && (!order.trackingNumber || order.carrier !== carrier);

      // Update the order fields
      let newStatus = status || order.status;
      if (trackingNumber && !order.trackingNumber) {
          newStatus = 'Shipped'; // Automatically set status to "Shipped" when tracking is added
      }

      await order.update({
          trackingNumber,
          carrier,
          shippingAddress,
          status: newStatus,
      });

      // Send email notification if the status has changed
      if (newStatus !== order.status) {
          await sendStatusNotification(order, newStatus);
      }

      // Subscribe to carrier if a new tracking number or carrier is added
      if (shouldSubscribe) {
          try {
              await subscribeToCarrier({ carrier, trackingNumber });
              console.log(`Successfully subscribed to ${carrier} for tracking number: ${trackingNumber}`);
          } catch (error) {
              console.error(`Failed to subscribe to ${carrier}:`, error.message);
              // Optional: Notify admin or log the error for later handling
          }
      }

      res.status(200).json({
          message: 'Order updated successfully.',
          order: { ...order.toJSON() },
      });
  } catch (error) {
      console.error('Error updating order:', error.message);
      res.status(500).json({ message: 'Error updating order', error });
  }
};

// Delete an order
const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        await order.destroy();
        res.status(200).json({ message: 'Order deleted successfully', orderId });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order' });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['username'], // Only fetch the username field
            order: [['username', 'ASC']], // Sort alphabetically by username
        });
        res.status(200).json({ message: 'Users fetched successfully', users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error });
    }
};


const quickAddProduct = async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;

    // Validate required fields
    if (!name || !description || !price || quantity === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Extract the thumbnail file
    const thumbnailFile = req.files?.thumbnail?.[0]; // Access the thumbnail field from multer
    if (!thumbnailFile) {
      return res.status(400).json({ message: 'Thumbnail is required' });
    }

    // Parse and validate numeric values
    const parsedPrice = parseFloat(price);
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedPrice) || isNaN(parsedQuantity)) {
      return res.status(400).json({ message: 'Price and quantity must be valid numbers' });
    }

    // Create the product in the database
    const newProduct = await Product.create({
      name,
      description,
      price: parsedPrice,
      quantity: parsedQuantity,
      thumbnail: thumbnailFile.filename, // Save the filename of the uploaded thumbnail
    });

    // Respond with the created product
    res.status(201).json({
      message: 'Product added successfully',
      product: newProduct,
    });
  } catch (error) {
    console.error('Error in quickAddProduct:', error);
    res.status(500).json({ message: 'Error adding product', error });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'email'],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'price', 'thumbnail'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Log thumbnails explicitly
    order.items.forEach((item, index) => {
      if (item.product) {
        console.log(`Item ${index + 1} - Thumbnail:`, item.product.thumbnail);
      } else {
        console.log(`Item ${index + 1} - No product associated`);
      }
    });

    // Decrypt and parse the addresses
    let shippingAddress = 'N/A';
    let billingAddress = 'N/A';

    if (order.shippingAddress) {
      shippingAddress = JSON.parse(decrypt(order.shippingAddress));
    }
    if (order.billingAddress) {
      billingAddress = JSON.parse(decrypt(order.billingAddress));
    }

    // Generate tracking link if applicable
    let trackingLink = null;
    if (order.trackingNumber && order.carrier) {
      trackingLink = generateTrackingLink(order.carrier, order.trackingNumber);
    }

    res.status(200).json({
      message: 'Order fetched successfully',
      order: {
        ...order.toJSON(),
        shippingAddress,
        billingAddress,
        trackingLink: trackingLink || 'Tracking info not available',
      },
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order', error });
  }
};





module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    getUsers,
    generateTrackingLink,
    quickAddProduct,
    getOrderDetails,
    updateTracking
};
