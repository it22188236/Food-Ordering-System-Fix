import React, { useState } from "react";
import "../../styles/RegisterForm.css";
import "../../styles/PasswordStrength.css";
import { toast } from "react-toastify";
import customer from "../../assets/customer-register.jpg";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";

const CustomerRegisterForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
    address: "",
  });

  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    number: false,
    symbol: false,
  });

  const [strengthScore, setStrengthScore] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "password") {
      evaluateStrength(value);
    }
  };

  const evaluateStrength = (password) => {
    const rules = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    };

    setPasswordRules(rules);

    const score = Object.values(rules).filter(Boolean).length;
    setStrengthScore(score);
  };

  const getStrengthLabel = () => {
    if (strengthScore <= 1) return "Weak";
    if (strengthScore === 2 || strengthScore === 3) return "Medium";
    if (strengthScore === 4) return "Strong";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Registering user:", form);
    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`${data.message}`);
        navigate("/login");
      } else {
        toast.error(`${data.message}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="register-page">
        <div className="register-image">
          <img src={customer} alt="image of delivery person" />
        </div>

        <div className="register-form-right">
          <h1>Order your food Today!!!</h1>

          <div className="register-form-container">
            <form className="register-form" onSubmit={handleSubmit}>
              <h2>Register</h2>

              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />

              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <div className="strength-container">
                <div className={`strength-bar strength-${strengthScore}`}></div>
                <span className="strength-label">{getStrengthLabel()}</span>
              </div>

              {/* Live Password Tips */}
              <ul className="password-tips">
                <li className={passwordRules.length ? "valid" : ""}>
                  ✔ At least 6 characters
                </li>
                <li className={passwordRules.uppercase ? "valid" : ""}>
                  ✔ 1 uppercase letter
                </li>
                <li className={passwordRules.number ? "valid" : ""}>
                  ✔ 1 number
                </li>
                <li className={passwordRules.symbol ? "valid" : ""}>
                  ✔ 1 special symbol
                </li>
              </ul>

              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
              />

              <button type="submit">Register</button>

              

              
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerRegisterForm;
