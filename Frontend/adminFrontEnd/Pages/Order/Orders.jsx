import React, { useState, useEffect } from 'react';
import { adminApi } from '../../config/axios';
import AddOrderForm from './AddOrderForm';
import EditOrderForm from './EditOrder';
import StatusBanner from '../../Components/statusBanner';
import TrackingNumber from './tracking';
import OrderDetailsModal from './OrderDetailsModal';
import OrderSummary from './orderSummary';

import './order_management.css'; // <--- Import the new CSS file

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingOrder, setEditingOrder] = useState({});
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await adminApi.get('/orders/get');
      const fetchedOrders = response.data.orders;

      // Sort orders: 'processing' status first
      const sortedOrders = fetchedOrders.sort((a, b) => {
        if (a.status === 'processing' && b.status !== 'processing') return -1;
        if (a.status !== 'processing' && b.status === 'processing') return 1;
        return 0;
      });

      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const deleteOrder = async (orderId) => {
    try {
      await adminApi.delete(`/orders/delete/${orderId}`);
      fetchOrders();
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

  const handleViewDetails = (orderId) => {
    console.log('Clicked Order ID:', orderId); // Debugging log
    setSelectedOrderId(orderId);
    setIsOrderDetailsOpen(true);
  };

  return (
    <div className="om-container">
      {/* Title or heading */}
      <h1 className="om-title"></h1>

      {/* Add Order Button */}
      <button onClick={() => setDialogOpen(true)} className="om-add-button">
        Add Order
      </button>

      {/* Add Order Modal */}
      {dialogOpen && (
        <AddOrderForm onClose={() => setDialogOpen(false)} onOrderCreated={fetchOrders} />
      )}

      {/* Order Details Modal */}
      {isOrderDetailsOpen && selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setIsOrderDetailsOpen(false)}
        />
      )}

      <div className="om-orders-container">
        {orders.map((order) => (
          <div key={order.id} className="om-order-card">
            {/* Make status banner clickable for details */}
            <div
              className="om-clickable"
              onClick={() => {
                handleViewDetails(order.id);
              }}
            >
              <StatusBanner status={order.status} />
            </div>

            {editingOrderId === order.id ? (
              <EditOrderForm
                editingOrder={editingOrder}
                setEditingOrder={setEditingOrder}
                updateOrder={updateOrder}
                deleteOrder={deleteOrder}
                onCancel={() => setEditingOrderId(null)}
              />
            ) : (
              <div>
                <OrderSummary orderId={order.id} />

                <div className="om-order-section">
                  <strong>Order ID:</strong> {order.id}
                </div>

                <div className="om-order-section">
                  <strong>Status:</strong> {order.status}
                </div>

                <div className="om-order-section form-section">
                  <TrackingNumber
                    orderId={order.id}
                    initialTrackingNumber={order.trackingNumber}
                    initialCarrier={order.carrier}
                    onTrackingUpdated={(newTrackingNumber, newCarrier) => {
                      setOrders((prevOrders) =>
                        prevOrders.map((o) =>
                          o.id === order.id
                            ? {
                                ...o,
                                trackingNumber: newTrackingNumber,
                                carrier: newCarrier,
                              }
                            : o
                        )
                      );
                      fetchOrders();
                    }}
                  />
                </div>

                <button
                  className="om-edit-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the parent onClick from firing
                    setEditingOrderId(order.id);
                    setEditingOrder(order);
                  }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;
