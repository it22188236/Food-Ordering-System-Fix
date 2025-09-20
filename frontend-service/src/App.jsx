//import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./contexts/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import CustomerRegisterForm from "./pages/RegisterForms/CustomerRegisterForm";
import DeliveryPersonRegisterForm from "./pages/RegisterForms/DeliveryPersonRegisterForm";
import RestaurantAdminRegisterForm from "./pages/RegisterForms/RestaurantAdminRegisterForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RestaurantDashboard from "./pages/Dashboards/RestaurantDashboard";
import DeliveryDashboard from "./pages/Dashboards/DeliveryDashboard";
import CreateRestaurant from "./pages/Restaurant/CreateRestaurant";
import CreateMenu from "./pages/Restaurant/CreateMenu";
import GetMenuItems from "./pages/Restaurant/GetMenuItems";
import MenuManagement from "./pages/Restaurant/MenuManagement";
import RestaurantProfile from "./pages/Restaurant/RestaurantProfile";
import AllRestaurants from "./pages/Customer/AllRestaurants";
import RestaurantMenu from "./pages/Customer/RestaurantMenu";
import MenuProfile from "./pages/Customer/MenuProfile";
import Cart from "./pages/Customer/Cart";
import PaymentSuccess from "./pages/Customer/PaymentSuccess";
import PaymentFail from "./pages/Customer/PaymentFail";
import AllMenuRestaurant from "./pages/Customer/AllMenuRestaurant";
import AllOrders from "./pages/Customer/AllOrders";
import PaymentPage from "./pages/Customer/PaymentPage";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<CustomerRegisterForm />} />
          <Route
            path="/delivery-register"
            element={<DeliveryPersonRegisterForm />}
          />
          <Route
            path="/restaurant-register"
            element={<RestaurantAdminRegisterForm />}
          />

          <Route path="/restaurants" element={<AllRestaurants />} />
          <Route
            path="/restaurant/:restaurantID"
            element={<RestaurantMenu />}
          />
          <Route
            path="/restaurant/menu-details/:restaurantID/:menuItemID"
            element={<MenuProfile />}
          />
          <Route path="/menu" element={<AllMenuRestaurant />} />

          <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<AllOrders />} />
          </Route>

          <Route
            element={<ProtectedRoute allowedRoles={["restaurantAdmin"]} />}
          >
            <Route
              path="/restaurant-dashboard/:restaurantID"
              element={<RestaurantDashboard />}
            />
            <Route path="/create-restaurant" element={<CreateRestaurant />} />
            <Route path="/get-menu/:restaurantID" element={<GetMenuItems />} />
            <Route path="/create-menu/:restaurantID" element={<CreateMenu />} />
            <Route
              path="/menu-details/:restaurantID/:menuItemID"
              element={<MenuManagement />}
            />
            <Route
              path="/restaurant-profile/:restaurantID"
              element={<RestaurantProfile />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["deliveryPerson"]} />}>
            <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
          </Route>

          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentFail />} />
          <Route path="/pay/:orderID" element={<PaymentPage />} />

          <Route path="/unauthorized" element={<div>Access Denied</div>} />

          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
