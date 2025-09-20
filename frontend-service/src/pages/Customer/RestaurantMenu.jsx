import React, { useEffect, useState } from "react";
import "../../styles/GetMenuItems.css";
import { Link, useParams } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

export default function RestaurantMenu() {
  const { restaurantID } = useParams();
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const menuItemsData = async () => {
      try {
        const menuData = await fetch(
          `http://localhost:5011/api/menu/get-menu/${restaurantID}`,
          {
            method: "GET",
          }
        );

        const result = await menuData.json();

        if (menuData.ok) {
          setMenuItems(result.data);
          console.log(result);
        } else {
          console.log("error");
        }
      } catch (error) {
        console.error(error);
      }
    };

    menuItemsData();
  }, [restaurantID]);

  return (
    <div>
      <NavBar restaurantID={restaurantID} />
      <div className="menu-container">
        {menuItems.map((item) => (
          <div className="menu-card" key={item._id}>
            <Link
              to={`/restaurant/menu-details/${item.restaurantID}/${item._id}`}
            >
              {item.image && (
                <img
                  src={`http://localhost:5011${item.image}`}
                  alt={item.name}
                  className="menu-image"
                />
              )}
              <div className="menu-details">
                <h3 className="menu-name">{item.name}</h3>
                <p className="menu-description">{item.description}</p>
                <p className="menu-category">Category: {item.category}</p>
                <p className="menu-price">Rs. {item.price}</p>
                <p
                  className={`menu-availability ${
                    item.availability ? "available" : "not-available"
                  }`}
                >
                  {item.availability ? "Available" : "Not Available"}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
