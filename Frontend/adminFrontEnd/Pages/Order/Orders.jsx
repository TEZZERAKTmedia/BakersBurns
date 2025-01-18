import React, { useState, useEffect } from 'react';
import { adminApi } from '../../config/axios';
import AddOrderForm from './AddOrderForm';
import EditOrderForm from './EditOrder';
import StatusBanner from '../../Components/statusBanner';
import TrackingNumber from './tracking';
import OrderDetailsModal from './OrderDetailsModal';
import OrderSummary from './orderSummary';

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
  
      // Sort orders: 'processing' status comes first
      const sortedOrders = fetchedOrders.sort((a, b) => {
        if (a.status === 'processing' && b.status !== 'processing') return -1;
        if (a.status !== 'processing' && b.status === 'processing') return 1;
        return 0; // Preserve relative order for other statuses
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
    <div style={styles.container}>
      <h1 style={{marginTop:'100px'}}></h1>
      <button onClick={() => setDialogOpen(true)} style={styles.addButton}>
        Add Order
      </button>

      {dialogOpen && <AddOrderForm onClose={() => setDialogOpen(false)} onOrderCreated={fetchOrders} />}

      {isOrderDetailsOpen && selectedOrderId && (
        <OrderDetailsModal orderId={selectedOrderId} onClose={() => setIsOrderDetailsOpen(false)} />
      )}

      <div style={styles.ordersContainer}>
        {orders.map((order) => (
          <div key={order.id} style={styles.orderCard}>
            <div
              onClick={() => {
                handleViewDetails(order.id); // Open details when clicked
              }}
              style={{ cursor: 'pointer' }} // Make it clear that this is clickable
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
                <div style={styles.orderSection}>
                  <strong>Order ID:</strong> {order.id}
                </div>
                <div style={styles.orderSection}>
                  <strong>Status:</strong> {order.status}
                </div>
                <div style={styles.orderSection} className='form-section'>
                  <TrackingNumber
                    orderId={order.id}
                    initialTrackingNumber={order.trackingNumber}
                    initialCarrier={order.carrier}
                    onTrackingUpdated={(newTrackingNumber, newCarrier) => {
                      // Update the state of orders locally (if needed)
                      setOrders((prevOrders) =>
                        prevOrders.map((o) =>
                          o.id === order.id
                            ? { ...o, trackingNumber: newTrackingNumber, carrier: newCarrier }
                            : o
                        )
                      );

                      // Refetch orders from the backend to ensure data consistency
                      fetchOrders();
                    }}
                  />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering `handleViewDetails`
                    setEditingOrderId(order.id);
                    setEditingOrder(order);
                  }}
                  style={styles.editButton}
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

const styles = {
  container: {
    padding: '20px',
  },
  addButton: {
    marginBottom: '20px',
  },
  ordersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxHeight: '70vh',
    overflowY: 'auto',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '10px',
    backgroundColor: 'black',
  },
  orderCard: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  orderSection: {
    marginBottom: '10px',
  },
  editButton: {
    marginTop: '10px',
    padding: '5px 10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default OrderManagement;
