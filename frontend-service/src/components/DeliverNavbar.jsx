import React from "react";
import "../styles/NavBar.css";
import logo from "../assets/logo.png";
import profile from "../assets/account_pic.png";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const NavBar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const goToRegister = () => {
    navigate("/register");
  };

  const goToLogin = () => {
    navigate("/login");
  };
  return (
    <div>
      <div className="nav-bar-container">
        <div className="nav-bar-ul">
          <ul>
            <div className="nav-bar-li">
              <li>
                <img src={logo} alt="logo" />
              </li>
              {/* <li className="nav-bar-component"><Link to={"/dashboard"} className="nav-bar-components-link">Home</Link></li>
              <li className="nav-bar-component"><Link to={"/menu"} className="nav-bar-components-link">Foods</Link></li>
              <li className="nav-bar-component">
                <Link to={"/restaurants"} className="nav-bar-components-link">Restaurant</Link>
              </li>
              <li className="nav-bar-component">Deliver</li>
              <li className="nav-bar-component"><Link to={"/orders"} className="nav-bar-components-link">Orders</Link></li>

              <li className="nav-bar-component">
                <Link to={"/cart"} className="nav-bar-components-link">Cart</Link>
              </li> */}

              {!auth.user ? (
                <>
                  <div className="nav-bar-li-btn">
                    <li className="nav-bar-li-login">
                      <button
                        onClick={goToLogin}
                        className="nav-bar-li-login-btn"
                      >
                        Login
                      </button>
                    </li>

                    <li className="nav-bar-li-register">
                      <button
                        onClick={goToRegister}
                        className="nav-bar-li-register-btn"
                      >
                        Register
                      </button>
                    </li>
                  </div>
                </>
              ) : (
                <>
                  <div className="nav-bar-li-profile">
                    <div className="nav-bar-li-profile-pic-name">
                      <li>
                        <img src={profile} alt="profile" />
                      </li>
                      <li className="nav-bar-li-profile-name">
                        {" "}
                        Hello! {auth.user.first_name}
                      </li>
                    </div>

                    <li>
                      <button
                        onClick={logout}
                        className="nav-bar-li-profile-logout"
                      >
                        Logout
                      </button>
                    </li>
                  </div>
                </>
              )}
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
