import React, { useState, useEffect } from 'react';
import { userApi } from '../config/axios';
import Settings from './Settings';
import '../Pagecss/Profile.css'
const UserDashboard = () => {
  const [userData, setUserData] = useState('');
  const [userOrders,setUserOrders] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      try {

        //fetch user data
        const response = await userApi.get('/api/user-dash', {
          header: {Authorization: 'Bearer ${token}' },
        });
        setUserData(response.data.user);

          //fetch user orders
        const ordersResponse = await userApi.get('/user/orders/${response.data.user.id}', {
          header: {Authorization: 'Bearer ${token}'},
        });
        setUserOrders(orders.response.data.orders);
      } catch (error) {
        console.error('Error fetching user data or orders', error);
      }
    };

    fetchUserData();
  }, []);

  

  return (
    <div style={{marginTop:'10%', color:'white'}} >
      <h2>User Dashboard</h2>
      <p>Welcome, {userData.username}</p>
      

      <h3>Orders</h3>
      <div>
        <h4>Active Orders</h4>
        {userOrders.filter(order => order.order_status === 'active').length > 0 ? (
          userOrders.filter(order => order.order_status === 'active').map(order => (
            <div key={order.id}>
              <p>Order #{order.id} - Total: ${order.order_total}</p>
              <p>Tracking Number: {order.tracking_number || 'N/A'}</p>
            </div>
          ))
        ) : (
          <p>No active orders</p>
        )}
      </div>

      <div>
        <h3>Completed Orders</h3>
        {userOrders.filter(order => order.order_status === 'completed').length > 0 ? (
          userOrder.filter(order => order.order_status === 'completed').map(order => (
            <div key={order.id}>
              <p>Order #{order.id} - Total: ${order.order_total}</p>
              <p>Tracking Number: {order.tracking_number || 'N/A'}</p>
            </div>
          ))
        ) : (
          <p>No Completed orders</p>
        )}
      </div>
      <Settings />
    </div>

  )
}

export default UserDashboard;