import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "../../styles/AllRestaurants.css";
import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

const AllRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const getRestaurants = async () => {
      try {
        const response = await fetch(
          `http://localhost:5011/api/restaurant/get-restaurants`,
          {
            method: "GET",
          }
        );

        const result = await response.json();

        if (response.ok) {
          setRestaurants(result.data);
          console.log(result);
        } else {
          toast.error("Errors occurs in fetching data.");
        }
      } catch (error) {
        console.error(error);
      }
    };

    getRestaurants();
  }, []);
  return (
    <div>
      <NavBar />

      {restaurants.map((res) => (
        <div key={res._id} className="restaurant-name-container">
          <Link to={`/restaurant/${res._id}`}>
            <input
              type="text"
              value={res.name}
              readOnly
              className="restaurant-name-input"
            />
          </Link>
        </div>
      ))}

      <Footer />
    </div>
  );
};

export default AllRestaurants;
