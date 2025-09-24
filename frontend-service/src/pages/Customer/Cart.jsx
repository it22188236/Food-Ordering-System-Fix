import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "../../styles/Cart.css";
import { useNavigate } from "react-router-dom";
import PayPalButton from "../../components/PaypalButton";

const Cart = () => {
  const [carts, setCarts] = useState([]);
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(`http://localhost:5021/api/cart`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.ok) {
          setCarts([result.data]);
          console.log(result.data);
        } else {
          // toast.error("Error to fetching data");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchCart();
  }, [token]);

  // const total = carts
  //   .reduce((sum, item) => sum + item.price * item.quantity, 0)
  //   .toFixed(2);

  const removeItem = async (cartID) => {
    try {
      const response = await fetch(`http://localhost:5021/api/cart/${cartID}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Cart is deleted.");
        console.log(result);
      } else {
        toast.error("Error to delete cart");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmOrder = async () => {
    try {
      const response = await fetch("http://localhost:5021/api/order/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deliveryAddress }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Order result:", result);
        navigate(`/pay/${result.data._id}`);
      } else {
        toast.error("Checkout failed.");
      }
    } catch (err) {
      toast.error("Something went wrong.");
      console.error(err);
    }
  };

  return (
    <div>
      <div className="cart-container">
        <h2 className="cart-title">🛒 Your Cart</h2>

        {Array.isArray(carts) && carts.length > 0 ? (
          carts.map((item) => (
            <div className="cart-item" key={item._id}>
              <div className="cart-item-info">
                {Array.isArray(item.items) &&
                  item.items.map((i, idx) => (
                    <div key={idx}>
                      <h3>{i.menu}</h3>
                      <p>Quantity: {i.quantity}</p>
                    </div>
                  ))}
                <p>Price: Rs.{item.totalPrice}/=</p>
                <button
                  className="cart-remove-button"
                  onClick={() => removeItem(item._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}

        {/* {carts.length > 0 && (
          <div className="cart-total">
      
            <button className="checkout-button" onClick={checkOutOrder}>
              Proceed to Checkout
            </button>
          </div>
        )} */}

        {carts.length > 0 && (
          <div className="cart-total">
            {!showAddressInput ? (
              <button
                className="checkout-button"
                onClick={() => setShowAddressInput(true)}
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="address-input-section">
                <input
                  type="text"
                  placeholder="Enter delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="address-input"
                />
                <button
                  className="confirm-button"
                  // onClick={handleConfirmOrder}
                  onClick={<PayPalButton/>}
                  // disabled={!deliveryAddress.trim()}
                >
                  Confirm Order
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
