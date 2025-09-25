import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUser } = useAuth();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      // Fetch user profile with token
      fetchUser().then(() => {
        navigate("/dashboard");
      });
    } else {
      navigate("/login");
    }
  }, []);

  return <div>Logging in...</div>;
};

export default LoginSuccess;
