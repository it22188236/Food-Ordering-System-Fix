// import React, { useEffect, useState } from "react";
// import NavBar from "../../components/RestaurantNavBar";
// import Footer from "../../components/Footer";
// import { io } from "socket.io-client";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "../../styles/RestaurantDashboard.css";
// import { useParams } from "react-router-dom";

// const RestaurantDashboard = () => {
//   const [restaurantInfo, setRestaurantInfo] = useState({});
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [socket, setSocket] = useState(null);
//   const { restaurantID } = useParams();
//   const [clickButton, setClickButton] = useState(null);
//   const [isClicked,setIsClicked] = useState(false);

//   useEffect(() => {
//     const getRestaurantData = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         const resData = await fetch(
//           "http://localhost:5011/api/restaurant/get-restaurant",
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         const restaurantData = await resData.json();

//         if (resData.ok) {
//           console.log(restaurantData.data);
//           setRestaurantInfo(restaurantData.data);
//         }
//       } catch (error) {
//         console.log(error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const restaurantOrder = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         const res = await fetch(
//           `http://localhost:5021/api/order/get-restaurant-order/${restaurantID}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         const data = await res.json();

//         if (res.ok) {
//           setOrders(data.data);
//           console.log(data);
//         }
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     getRestaurantData();
//     restaurantOrder();
//   }, [restaurantID]);

//   // useEffect(() => {
//   //   const newSocket = io("http://localhost:5011", {
//   //     transports: ["websocket"], // force websocket instead of polling
//   //     withCredentials: true, // important if using auth
//   //   });

//   //   setSocket(newSocket); // Save socket instance in state

//   //   newSocket.on("connect", () => {
//   //     console.log("✅ Connected to websocket server");
//   //     if (restaurantInfo._id) {
//   //       newSocket.emit("join-room", restaurantInfo._id);
//   //       console.log("Joined restaurant room:", restaurantInfo._id);
//   //     }
//   //   });

//   //   newSocket.on("new-order", (data) => {
//   //     console.log("📦 New order received!", data);

//   //   toast.success(`🍽️ New Order ${data.orderID} Received!`);
//   //     setOrders((prevOrders) => [...prevOrders, {
//   //       _id: data.orderID,
//   //       items: data.orderDetails, // assuming this is array
//   //       total: data.orderDetails.reduce((acc, item) => acc + (item.price * item.qty), 0),
//   //       status: 'Pending', // New orders usually start with Pending
//   //     }]);
//   //   });

//   //   newSocket.on("disconnect", () => {
//   //     console.log("❌ Disconnected from websocket server");
//   //   });

//   //   // Clean up socket when component unmounts
//   //   return () => {
//   //     newSocket.disconnect();
//   //   };
//   // }, [restaurantInfo._id]);

//   useEffect(() => {
//     if (!restaurantInfo._id) return; // 👈 Don't connect if no restaurant ID

//     const newSocket = io("http://localhost:5011", {
//       transports: ["websocket"],
//       withCredentials: true,
//     });

//     newSocket.on("connect", () => {
//       console.log("✅ Connected to websocket server");
//       newSocket.emit("join-room", restaurantInfo._id);
//       console.log("Joined restaurant room:", restaurantInfo._id);
//     });

//     newSocket.on("new-order", (data) => {
//       console.log("📦 New order received!", data);

//       if (!data) {
//         console.error("❌ No data received!");
//         return;
//       }

//       toast.success(`🍽️ New Order ${data.orderID} Received!`);

//       setOrders((prevOrders) => [
//         ...prevOrders,
//         {
//           _id: data.orderID,
//           items: data.orderDetails,
//           total: data.orderDetails.reduce(
//             (acc, item) => acc + item.price * item.qty,
//             0
//           ),
//           status: "Pending",
//         },
//       ]);
//     });

//     newSocket.on("disconnect", () => {
//       console.log("❌ Disconnected from websocket server");
//     });

//     setSocket(newSocket); // Save it to state so we can disconnect later

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [restaurantInfo._id]);

//   const handleOrderStatus = async (orderID, newStatus, type) => {
//     try {
//       const token = localStorage.getItem("token");
//       setClickButton(type);
//       setIsClicked(true);
//       const statusUpdate = await fetch(
//         `http://localhost:5021/api/order/update-order-status/${orderID}`,
//         {
//           method: "PATCH",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ status: newStatus }),
//         }
//       );

//       const result = await statusUpdate.json();

//       if (statusUpdate.ok) {
//         toast.success("Order confirmed.");
//       } else {
//         toast.error(`${result.message}`);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <div>
//       <NavBar restaurantID={restaurantInfo._id} />

//       <ToastContainer position="top-right" autoClose={5000} />

//       <main className="main-content">
//         <header className="dashboard-header">
//           <h1>Restaurant Admin Dashboard</h1>
//         </header>

//         <section className="dashboard-section">
//           <h2>Restaurant Info</h2>
//           <div className="info-box">
//             <p>
//               <strong>Name:</strong> {restaurantInfo.name}
//             </p>
//             <p>
//               <strong>Address:</strong> {restaurantInfo.address}
//             </p>
//             <p>
//               <strong>Phone:</strong> {restaurantInfo.phone}
//             </p>
//           </div>
//         </section>

//         {loading ? (
//           <p>Loading...</p>
//         ) : (
//           <>
//             {/* <section className="dashboard-section">
//               <h2>Recent Orders</h2>
//               <table className="orders-table">
//                 <thead>
//                   <tr>
//                     <th>Order ID</th>
//                     <th>Items</th>
//                     <th>Total</th>
//                     <th>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {orders.map((order) => (
//                     <tr key={order._id}>
//                       <td>{order._id}</td>
//                       <td>
//                         {order.items
//                           .map((item) => `${item.name} x${item.qty}`)
//                           .join(", ")}
//                       </td>
//                       <td>Rs. {order.total}</td>
//                       <td>{order.status}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </section> */}

//             <section className="dashboard-section">
//               <h2>Recent Orders</h2>
//               <table className="orders-table">
//                 <thead>
//                   <tr>
//                     <th>Order ID</th>
//                     <th>Items</th>
//                     <th>Total</th>
//                     <th>Status</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {orders.map((order) => (
//                     <tr key={order._id}>
//                       <td>{order._id}</td>
//                       <td>
//                         {order.items
//                           ?.map((item) => `${item.menuName} x${item.quantity}`)
//                           .join(", ")}
//                       </td>
//                       <td>Rs. {order.totalPrice}</td>
//                       <td>
//                         <span
//                           className={`status-badge ${
//                             order.status === "pending"
//                               ? "pending"
//                               : order.status === "preparing"
//                               ? "completed"
//                               : "cancelled"
//                           }`}
//                         >
//                           {order.status}
//                         </span>
//                       </td>
//                       <td>
//                         <div className="button-container">
//                         <input
//                           type="submit"
//                           name=""
//                           id=""
//                           value={"Accept"}
//                           onClick={() =>
//                             handleOrderStatus(order._id, "preparing", "accept")
//                           }
//                           className={`order-btn accept-btn ${
//                             clickButton && clickButton !== "accept"
//                               ? "disabled"
//                               : ""
//                           }`}
//                           disabled={clickButton && clickButton !== "accept" && isClicked}
//                         />
//                         <input
//                           type="submit"
//                           name=""
//                           id=""
//                           value={"Cancel"}
//                           onClick={() =>
//                             handleOrderStatus(order._id, "cancel", "cancel")
//                           }
//                           className={`order-btn cancel-btn ${
//                             clickButton && clickButton !== "cancel"
//                               ? "disabled"
//                               : ""
//                           }`}
//                           disabled={clickButton && clickButton !== "cancel" && isClicked}
//                         />

//                         </div>
                        
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </section>
//           </>
//         )}
//       </main>

//       {/* {orders.map((order) => (
//           <tr key={order._id}>
//             <td>{order._id}</td>
//             <td>
//               {order.items
//                 .map((item) => `${item.name} x${item.qty}`)
//                 .join(", ")}
//             </td>
//             <td>Rs. {order.total}</td>
//             <td>{order.status}</td>
//           </tr>
//         ))} */}

//       <Footer />
//     </div>
//   );
// };

// export default RestaurantDashboard;


import React, { useEffect, useState } from "react";
import NavBar from "../../components/RestaurantNavBar";
import Footer from "../../components/Footer";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/RestaurantDashboard.css";
import { useParams } from "react-router-dom";

const RestaurantDashboard = () => {
  const [restaurantInfo, setRestaurantInfo] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const { restaurantID } = useParams();
  const [clickButton, setClickButton] = useState(null);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const getRestaurantData = async () => {
      try {
        const token = localStorage.getItem("token");
        const resData = await fetch(
          "http://localhost:5011/api/restaurant/get-restaurant",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const restaurantData = await resData.json();
        if (resData.ok) {
          setRestaurantInfo(restaurantData.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const restaurantOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5021/api/order/get-restaurant-order/${restaurantID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setOrders(data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getRestaurantData();
    restaurantOrder();
  }, [restaurantID]);

  useEffect(() => {
    if (!restaurantInfo._id) return;

    const newSocket = io("http://localhost:5011", {
      transports: ["websocket"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to websocket server");
      newSocket.emit("join-room", restaurantInfo._id);
      console.log("Joined restaurant room:", restaurantInfo._id);
    });

    newSocket.on("new-order", (data) => {
      console.log("📦 New order received!", data);
      if (!data) {
        console.error("❌ No data received!");
        return;
      }
      toast.success(`🍽️ New Order ${data.orderID} Received!`);
      setOrders((prevOrders) => [
        ...prevOrders,
        {
          _id: data.orderID,
          items: data.orderDetails,
          total: data.orderDetails.reduce(
            (acc, item) => acc + item.price * item.qty,
            0
          ),
          status: "pending",
        },
      ]);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from websocket server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [restaurantInfo._id]);

  const handleOrderStatus = async (orderID, newStatus, type) => {
    try {
      const token = localStorage.getItem("token");
      setClickButton(type);
      setIsClicked(true);
      const statusUpdate = await fetch(
        `http://localhost:5021/api/order/update-order-status/${orderID}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const result = await statusUpdate.json();
      if (statusUpdate.ok) {
        toast.success("Order status updated successfully");
        setOrders(orders.map(order => 
          order._id === orderID ? { ...order, status: newStatus } : order
        ));
      } else {
        toast.error(`${result.message}`);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update order status");
    } finally {
      setClickButton(null);
      setIsClicked(false);
    }
  };

  return (
    <div className="restaurant-dashboard">
      <NavBar restaurantID={restaurantInfo._id} />
      <ToastContainer position="top-right" autoClose={5000} />

      <main className="main-content">
        <header className="dashboard-header">
          <h1>Restaurant Admin Dashboard</h1>
          <p>Manage your restaurant orders and settings</p>
        </header>

        <section className="dashboard-section">
          <h2>Restaurant Information</h2>
          <div className="info-box">
            <p>
              <strong>Name:</strong> {restaurantInfo.name}
            </p>
            <p>
              <strong>Address:</strong> {restaurantInfo.address}
            </p>
            <p>
              <strong>Phone:</strong> {restaurantInfo.phone}
            </p>
            <p>
              <strong>Cuisine:</strong> {restaurantInfo.cuisineType?.join(", ")}
            </p>
          </div>
        </section>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <section className="dashboard-section">
            <h2>Recent Orders</h2>
            {orders.length === 0 ? (
              <p>No orders found</p>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>{order._id.substring(0, 8)}...</td>
                      <td>
                        {order.items
                          ?.map((item) => `${item.menuName} x${item.quantity}`)
                          .join(", ")}
                      </td>
                      <td>Rs. {order.totalPrice?.toFixed(2)}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            order.status === "pending"
                              ? "pending"
                              : order.status === "preparing"
                              ? "completed"
                              : "cancelled"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="button-container">
                          <button
                            onClick={() =>
                              handleOrderStatus(order._id, "preparing", "accept")
                            }
                            className={`order-btn accept-btn ${
                              clickButton && clickButton !== "accept"
                                ? "disabled"
                                : ""
                            }`}
                            disabled={
                              clickButton && clickButton !== "accept" && isClicked
                            }
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleOrderStatus(order._id, "cancelled", "cancel")
                            }
                            className={`order-btn cancel-btn ${
                              clickButton && clickButton !== "cancel"
                                ? "disabled"
                                : ""
                            }`}
                            disabled={
                              clickButton && clickButton !== "cancel" && isClicked
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantDashboard;