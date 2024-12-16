// OrderDetails.jsx
import React from 'react';

const OrderDetails = ({ order, onBack }) => {
  if (!order) return null;

  return (
    <div className="order-details">
      <button onClick={onBack}>Back to Orders</button>
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> {order.id}</p>
      <p><strong>User:</strong> {order.username}</p>
      <p><strong>Total:</strong> ${order.total}</p>
      <h3>Items Ordered</h3>
      <ul>
        {order.items.map(item => (
          <li key={item.id}>
            <p>{item.name}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Price: ${item.price}</p>
          </li>
        ))}
      </ul>
      <button onClick={() => alert(`Contact user: ${order.username}`)}>Contact User</button>
    </div>
  );
};

export default OrderDetails;
