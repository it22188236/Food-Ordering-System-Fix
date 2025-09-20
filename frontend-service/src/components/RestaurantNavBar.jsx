import React,{useState} from "react";
import "../styles/NavBar.css";
import logo from "../assets/logo.png";
import profile from "../assets/account_pic.png";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const NavBar = ({ restaurantID }) => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

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
              <li className="nav-bar-component">
                <Link to={`/restaurant-dashboard/${restaurantID}`}>Dashboard</Link>
              </li>
              <li className="nav-bar-component">
                <Link to={`/get-menu/${restaurantID}`}>MenuItems</Link>
              </li>
              <li className="nav-bar-component">Orders</li>
              <li className="nav-bar-component">
                <Link to={`/create-menu/${restaurantID}`}>Add Items</Link>
              </li>

              <li className="nav-bar-component">
                <Link to={`/restaurant-profile/${restaurantID}`}>Profile</Link>
              </li>

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
                  {/* <div className="nav-bar-li-profile">
                    <div className="nav-bar-li-profile-pic-name">
                      <li>
                        <img src={profile} alt="profile" />
                      </li>
                      <li className="nav-bar-li-profile-name">
                        {" "}
                        Hello! {auth.user.name}
                      </li>
                    </div>

                    <li className="nav-bar-li-hover-area">
                      <button
                        onClick={logout}
                        className="nav-bar-li-profile-logout"
                      >
                        Logout
                      </button>
                      <button>
                        <Link to={`/create-restaurant`} className="nav-bar-li-create">Create Restaurant</Link>
                      </button>
                    </li>
                  </div> */}

<div className="nav-bar-li-profile">
      <div className="nav-bar-li-profile-pic-name" onClick={toggleMenu}>
        <li>
          <img src={profile} alt="profile" className="profile-pic" />
        </li>
        <li className="nav-bar-li-profile-name">
          Hello! {auth.user.name}
        </li>
      </div>

      {menuOpen && (
        <div className="nav-bar-li-dropdown">
          <button onClick={logout} className="nav-bar-li-profile-logout">
            Logout
          </button>
          <Link to="/create-restaurant" className="nav-bar-li-create">
            Create Restaurant
          </Link>
        </div>
      )}
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
