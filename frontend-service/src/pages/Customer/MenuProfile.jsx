import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/MenuProfile.css";
import Footer from "../../components/Footer";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

const MenuProfile = () => {
  const { restaurantID } = useParams();
  const { menuItemID } = useParams();

  const [menuItem, setMenuItem] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const { auth } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5021/api/cart/${restaurantID}/menu/${menuItemID}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body:JSON.stringify({quantity:quantity,customer:auth?.user?.id,restaurant:restaurantID})
        
        }
      );

      const result = await response.json();

      if(response.ok){
        toast.success("Order added to the cart.")
      }else{
        toast.error("Error to added to cart.")
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(
          `http://localhost:5011/api/menu/get-menu/${restaurantID}/${menuItemID}`,
          {
            method: "GET",
          }
        );

        const result = await response.json();

        if (response.ok) {
          setMenuItem(result.data);
        } else {
          console.error("error");
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchMenu();
  }, [restaurantID, menuItemID]);
  return (
    <div>
      <div className="menu-item-page">
        <div className="menu-content">
          <div className="menu-item-card">
            <img
              src={`http://localhost:5011${menuItem.image}`}
              alt={menuItem.name}
              className="menu-item-image"
            />
            <div className="menu-item-details">
              <h2 className="menu-item-name">{menuItem.name}</h2>
              <p className="menu-item-category">{menuItem.category}</p>
              <p className="menu-item-description">{menuItem.description}</p>
              <p className="menu-item-price">Rs.{menuItem.price}/=</p>

              <div className="menu-quantity-control">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  −
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button className="menu-add-btn" onClick={handleAddToCart}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MenuProfile;
