// OrdersList.jsx
import React, { useState, useEffect } from 'react';
import { adminApi } from '../config/axios'; // Make sure to import your API instance

const OrdersList = ({ onSelectOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the list of orders when the component loads
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await adminApi.get('/orders'); // Adjust the API route accordingly
        setOrders(response.data); 
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="orders-list">
      <h2>Active Orders</h2>
      <ul>
        {orders.map(order => (
          <li key={order.id} className="order-item">
            <p>Order ID: {order.id}</p>
            <p>User: {order.username}</p>
            <p>Total: ${order.total}</p>
            <button onClick={() => onSelectOrder(order)}>View Details</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersList;
