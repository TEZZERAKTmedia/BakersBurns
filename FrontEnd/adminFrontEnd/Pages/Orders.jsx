// OrdersPage.jsx
import React, { useState } from 'react';
import OrdersList from '../Components/orderList';
import OrderDetails from '../Components/orderDetails';

const OrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="orders-page">
      {selectedOrder ? (
        <OrderDetails order={selectedOrder} onBack={handleBackToOrders} />
      ) : (
        <OrdersList onSelectOrder={handleSelectOrder} />
      )}
    </div>
  );
};

export default OrdersPage;
