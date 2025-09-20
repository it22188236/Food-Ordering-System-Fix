import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AllMenuRestaurant = () => {
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    const getMenuData = async () => {
      try {
        const response = await fetch(`http://localhost:5011/api/menu/`, {
          method: "GET",
        });

        const result = await response.json();

        if (response.ok) {
          setMenus(result.data);
          console.log(result);
        }
      } catch (error) {
        toast.error("Error to fetching data", error);
      }
    };

    getMenuData();
  }, []);
  return <div></div>;
};

export default AllMenuRestaurant;
