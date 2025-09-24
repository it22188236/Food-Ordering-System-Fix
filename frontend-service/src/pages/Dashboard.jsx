// import React from 'react'
// import NavBar from '../components/NavBar';
// import Footer from '../components/Footer';

// const Dashboard = () => {
//   return (
//     <div>
//         <NavBar/>

//         <h1>Dashboard</h1>

//         <Footer/>
      
//     </div>
//   )
// }

// export default Dashboard

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import '../styles/Dashboard.css'; // Separate CSS file
import { FaUtensils, FaHistory, FaUser, FaBell, FaMapMarkerAlt } from 'react-icons/fa';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await axios.get('http://localhost:5001/api/auth/me');
        setUserData(userResponse.data);
        
        // Fetch orders
        const ordersResponse = await axios.get(`http://localhost:5021/api/order/all-orders`,{headers:{
          Authorization:`Bearer ${token}`
        }});
        setOrders(ordersResponse.data.data);
        console.log(ordersResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const currentOrders = orders.filter(order => 
    ['pending', 'accepted', 'preparing', 'ready', 'on the way'].includes(order.status)
  );

  const pastOrders = orders.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'preparing': return 'status-preparing';
      case 'ready': return 'status-ready';
      case 'on the way': return 'status-ontheway';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <NavBar />
        <div className="loading-spinner"></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <NavBar />
      
      <div className="dashboard-header">
        <div className="user-greeting">
          <h1>Welcome back, {userData?.name || 'Customer'}!</h1>
          <p>Track your food orders and manage your account</p>
        </div>
        <div className="user-avatar">
          <FaUser className="avatar-icon" />
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <div 
            className={`sidebar-item ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            <FaUtensils className="sidebar-icon" />
            <span>Current Orders</span>
            {currentOrders.length > 0 && (
              <span className="notification-badge">{currentOrders.length}</span>
            )}
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <FaHistory className="sidebar-icon" />
            <span>Order History</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FaBell className="sidebar-icon" />
            <span>Notifications</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <FaMapMarkerAlt className="sidebar-icon" />
            <span>My Addresses</span>
          </div>
        </div>

        <div className="dashboard-main">
          {activeTab === 'current' && (
            <div className="orders-section">
              <h2>Current Orders</h2>
              {currentOrders.length === 0 ? (
                <div className="no-orders">
                  <p>You don't have any active orders</p>
                  <button 
                    className="order-now-btn"
                    onClick={() => navigate('/restaurants')}
                  >
                    Order Now
                  </button>
                </div>
              ) : (
                <div className="orders-grid">
                  {currentOrders.map(order => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <h3>Order #{order.orderNumber}</h3>
                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="order-details">
                        <div className="restaurant-info">
                          <img 
                            src={order.restaurant.image || '/images/default-restaurant.jpg'} 
                            alt={order.restaurant.name}
                          />
                          <h4>{order.restaurant.name}</h4>
                        </div>
                        <div className="order-summary">
                          <p>{order.items.length} items</p>
                          <p>Total: Rs.{order.totalPrice.toFixed(2)}/=</p>
                          <p>Placed on: {formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <button 
                        className="track-order-btn"
                        onClick={() => navigate(`/orders/${order._id}`)}
                      >
                        Track Order
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="orders-section">
              <h2>Order History</h2>
              {pastOrders.length === 0 ? (
                <div className="no-orders">
                  <p>Your order history is empty</p>
                </div>
              ) : (
                <div className="orders-grid">
                  {pastOrders.map(order => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <h3>Order #{order.orderNumber}</h3>
                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="order-details">
                        <div className="restaurant-info">
                          <img 
                            src={order.restaurant.image || '/images/default-restaurant.jpg'} 
                            alt={order.restaurant.name}
                          />
                          <h4>{order.restaurant.name}</h4>
                        </div>
                        <div className="order-summary">
                          <p>{order.items.length} items</p>
                          <p>Total: ${order.totalAmount.toFixed(2)}</p>
                          <p>Delivered on: {formatDate(order.updatedAt)}</p>
                        </div>
                      </div>
                      <div className="order-actions">
                        <button 
                          className="reorder-btn"
                          onClick={() => navigate(`/restaurants/${order.restaurant._id}`)}
                        >
                          Reorder
                        </button>
                        <button 
                          className="rate-btn"
                          onClick={() => navigate(`/orders/${order._id}/review`)}
                        >
                          Rate Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Other tabs would be implemented similarly */}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
