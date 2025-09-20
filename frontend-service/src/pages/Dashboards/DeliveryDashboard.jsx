import React, { useEffect, useState } from "react";
import DeliverNavbar from "../../components/DeliverNavbar";
import Footer from "../../components/Footer";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/DeliveryDashboard.css";

const DeliveryDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const deliveries = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:5031/api/delivery/deliveries`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setDeliveries(data.data);
          console.log(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    deliveries();
  }, []);

  useEffect(() => {
    const newSocket = io("http://localhost:5031", {
      transports: ["websocket"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to websocket server");
      newSocket.emit("join-delivery-room");
    });

    newSocket.on("new-delivery", (data) => {
      console.log("📦 New delivery received!", data);

      if (!data) {
        console.error("❌ No data received!");
        return;
      }

      toast.success(`🛵 New Delivery ${data.deliveryID} Received!`);

      setDeliveries((prevOrders) => [
        ...prevOrders,
        {
          _id: data.deliveryID,
          restaurantID: data.restaurantID,
          customerID: data.customerID,
          address: data.address,
          status: data.status,
          totalPrice: data.totalPrice,
        },
      ]);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from websocket server");
    });

    setSocket(newSocket); // Save it to state so we can disconnect later

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleAccept = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5031/api/delivery/${orderId}/assign`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("Delivery person assigned.");
        console.log(result);
        setDeliveries((prev) =>
          prev.map((d) =>
            d._id === result.data._id ? { ...d, status: "Assigned" } : d
          )
        );
      } else {
        toast.error(`${result.message}`);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="delivery-dashboard">
      <DeliverNavbar />

      <h1>Delivery Dashboard</h1>

      <ul className="delivery-list">
        {deliveries.map((d, i) => (
          <li className="delivery-item" key={i}>
            <span>
              <strong>Delivery ID:</strong> {d._id}
            </span>
            <span>
              <strong>Order ID:</strong> {d.orderID}
            </span>
            <span>
              <strong>Status:</strong> {d.status}
            </span>
            <span>
              <strong>Address:</strong> {d.deliveryAddress}
            </span>
            {d.status !== "Assigned" && (
              <button
                className="accept-button"
                onClick={() => handleAccept(d.orderID, "Assigned")}
              >
                Accept
              </button>
            )}
          </li>
        ))}
      </ul>

      <Footer />
    </div>
  );
};

export default DeliveryDashboard;
