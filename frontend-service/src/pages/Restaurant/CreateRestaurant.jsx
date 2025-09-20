import React, { useState } from "react";
import "../../styles/CreateRestaurant.css";
import Footer from "../../components/Footer";
import { toast } from "react-toastify";

const defaultHours = {
  Sunday: { open: "", close: "" },
  Monday: { open: "", close: "" },
  Tuesday: { open: "", close: "" },
  Wednesday: { open: "", close: "" },
  Thuesday: { open: "", close: "" },
  Friday: { open: "", close: "" },
  Saturday: { open: "", close: "" },
};

const CreateRestaurant = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    openingHours: defaultHours,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHoursChange = (day, timeType, value) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [timeType]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5011/api/restaurant/create-restaurant", {
        method: "POST",
        headers: {
          Authorization:`Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(`${result.message}`);
      } else {
        toast.error(`${res.message}`);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div>
      <div className="restaurant-form">
        <h2>Add Restaurant</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Phone:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <h3>Opening Hours:</h3>
          <div className="opening-hours-section">
            {Object.keys(defaultHours).map((day) => (
              <div key={day} className="opening-hours-row">
                <strong>{day}:</strong>
                <input
                  type="number"
                  placeholder="Open"
                  value={formData.openingHours[day].open}
                  onChange={(e) =>
                    handleHoursChange(day, "open", e.target.value)
                  }
                  min={0}
                  max={23}
                  required
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Close"
                  value={formData.openingHours[day].close}
                  onChange={(e) =>
                    handleHoursChange(day, "close", e.target.value)
                  }
                  min={0}
                  max={23}
                  required
                />
              </div>
            ))}
          </div>

          <button type="submit">Save Restaurant</button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateRestaurant;
