import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const MenuManagement = () => {
  const { menuItemID } = useParams();
  const { restaurantID } = useParams();
  const token = localStorage.getItem("token");
  const [menuItems, setMenuItems] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    availability: true,
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setMenuItems((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const updateMenuItem = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(menuItems).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch(
        `http://localhost:5011/api/menu/update-menu/${restaurantID}/${menuItemID}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        toast.success("Item Updated successfully!");
        console.log(result);
      } else {
        toast.error("Error uploading item.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Error occurred while uploading.");
    }
  };

  const deleteMenuItem = async () => {
    try {
      const response = await fetch(
        `http://localhost:5011/api/menu/delete-menu/${restaurantID}/${menuItemID}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("Menu Item deleted.");
        console.log(result);
      } else {
        toast.error("Fail for deletion");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getMenuData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5011/api/menu/get-menu/${restaurantID}/${menuItemID}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (response.ok) {
          setMenuItems(result.data);
          console.log(result);
        } else {
          console.log("error");
        }
      } catch (error) {
        console.log(error);
      }
    };

    getMenuData();
  }, [restaurantID, menuItemID, token]);

  return (
    <div>
      <div className="menu-form">
        <h2>Menu Item</h2>
        <form onSubmit={updateMenuItem}>
          <label>Item Name:</label>
          <input
            type="text"
            name="name"
            value={menuItems.name}
            onChange={handleChange}
            required
          />

          <label>Description:</label>
          <textarea
            name="description"
            value={menuItems.description}
            onChange={handleChange}
            rows={3}
            required
          />

          <label>Price (LKR):</label>
          <input
            type="number"
            name="price"
            value={menuItems.price}
            onChange={handleChange}
            min="0"
            required
          />

          <label>Category:</label>
          <input
            type="text"
            name="category"
            value={menuItems.category}
            onChange={handleChange}
            required
          />

          <div className="availability-toggle">
            <label>Available:</label>
            <input
              type="checkbox"
              name="availability"
              checked={menuItems.availability}
              onChange={handleChange}
            />
          </div>

          <label>Upload Image:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />

          <button type="submit">Update Item</button>
        </form>
        <button type="submit" onClick={deleteMenuItem} style={{backgroundColor:"red"}}>
          Delete Item
        </button>
      </div>
    </div>
  );
};

export default MenuManagement;
