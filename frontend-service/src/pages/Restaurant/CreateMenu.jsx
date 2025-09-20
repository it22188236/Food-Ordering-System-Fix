import React, { useState } from "react";
import "../../styles/CreateMenu.css";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CreateMenu = () => {
  const { restaurantID } = useParams();
  const [item, setItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    availability: true,
  });
  const [file, setFile] = useState(null);

  const navigate = useNavigate();

  // const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setItem((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    // Object.entries(item).forEach(([key, value]) => {
    //   formData.append(key, value);
    // });

    data.append("image", file);
    data.append("name", item.name);
    data.append("description", item.description);
    data.append("price", item.price);
    data.append("category", item.category);
    data.append("availability", item.availability);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5011/api/menu/create-menu/${restaurantID}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // "Content-Type": "multipart/form-data",
          },
          body: data,
        }
      );

      if (response.ok) {
        toast.success("Item added successfully!");
        navigate(`/get-menu/${restaurantID}`);
      } else {
        toast.error("Error uploading item.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Error occurred while uploading.");
    }
  };

  return (
    <div className="menu-form">
      <h2>Add Menu Item</h2>
      <form onSubmit={handleSubmit}>
        <label>Item Name:</label>
        <input
          type="text"
          name="name"
          value={item.name}
          onChange={handleChange}
          required
        />

        <label>Description:</label>
        <textarea
          name="description"
          value={item.description}
          onChange={handleChange}
          rows={3}
          required
        />

        <label>Price (LKR):</label>
        <input
          type="number"
          name="price"
          value={item.price}
          onChange={handleChange}
          min="0"
          required
        />

        <label>Category:</label>
        <input
          type="text"
          name="category"
          value={item.category}
          onChange={handleChange}
          required
        />

        <div className="availability-toggle">
          <label>Available:</label>
          <input
            type="checkbox"
            name="availability"
            checked={item.availability}
            onChange={handleChange}
          />
        </div>

        <label>Upload Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />

        <button type="submit">Add Item</button>
      </form>
    </div>
  );
};

export default CreateMenu;
