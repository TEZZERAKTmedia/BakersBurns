import axios from 'axios';

const addToCart = async (userId, productId, quantity) => {
  try {
    const response = await axios.post('http://localhost3011/api/cart', {
      userId,
      productId,
      quantity
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
};

export default addToCart;