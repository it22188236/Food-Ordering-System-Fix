// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import "../styles/Login.css";
import Footer from "../components/Footer";
import loginImage from "../assets/login-form.jpg";
import googleIcon from "../../public/images/google.png"

const Login = () => {
  const { login } = useAuth(); // 👈 use AuthContext here
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({
    email: "",
    password: "",
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

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(`${data.message}`);
      }

      // data: { token, user }
      login(data.data.token, data.data.existUser); // 👈 Call login from context
      navigate(from, { replace: true });
      toast.success(`${data.message}`);

      if (data.data.existUser.role === "customer") {
        navigate("/dashboard");
      } else if (data.data.existUser.role === "restaurantAdmin") {
        navigate(`/restaurant-dashboard/${data.data.response.restaurantID} `);
      } else if (data.data.existUser.role === "deliveryPerson") {
        navigate("/delivery-dashboard");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <div className="login-page">
        <div className="login-image">
          <img src={loginImage} alt="image of delivery person" />
        </div>

        <div className="login-form-right">
          <h1>Order your food Today!!!</h1>

          <div className="login-form-container">
            <form className="login-form" onSubmit={handleSubmit}>
              <h2>Login</h2>

              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
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

              <button type="submit">Login</button>
            </form>

            <a href="http://localhost:5001/api/auth/google">
              <button>
                Login with{" "}
                <img
                  src={googleIcon}
                  alt="googleIcon"
                  style={{ width: "1.2em" }}
                />
              </button>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
