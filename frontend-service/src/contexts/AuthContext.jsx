// import { createContext, useContext, useState, useEffect } from "react";
// import axios from "axios";

// const AuthContext = createContext();

// // export const AuthProvider = ({ children }) => {
// //   const [auth, setAuth] = useState(() => {

// //     const token = localStorage.getItem("token");
// //     const user = JSON.parse(localStorage.getItem("user"));
// //     return { token, user };

// //   });

// export const AuthProvider = ({ children }) => {
//   const [auth, setAuth] = useState({
//     token: localStorage.getItem("token") || null,
//     user: JSON.parse(localStorage.getItem("user")) || null,
//   });
//   const [loading, setLoading] = useState(true);

//   const fetchUser = async () => {
//     try {
//       const res = await axios.get("http://localhost:5001/api/auth/me", {
//         withCredentials: true, // needed for Google/Facebook OAuth cookies
//       });
//       setAuth({ token: localStorage.getItem("token"), user: res.data.user });
//       localStorage.setItem("user", JSON.stringify(res.data.user));
//     } catch (err) {
//       console.log("Error fetching user:", err);
//       setAuth({ token: null, user: null });
//       localStorage.removeItem("user");
//       localStorage.removeItem("token");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUser();
//   }, []);

//   const loginWithEmail = async (email, password) => {
//     const res = await axios.post("http://localhost:5001/api/auth/login", {
//       email,
//       password,
//     });
//     localStorage.setItem("token", res.data.token);
//     localStorage.setItem("user", JSON.stringify(res.data.user));
//     setAuth({ token: res.data.token, user: res.data.user });
//   };

//   // Google login (redirect or popup handled by backend)
//   const loginWithGoogle = () => {
//     window.location.href = "http://localhost:5001/api/auth/google";
//   };

//   // Facebook login
//   const loginWithFacebook = () => {
//     window.location.href = "http://localhost:5001/api/auth/facebook";
//   };

//   // Logout
//   const logout = async () => {
//     await axios.post("http://localhost:5001/api/auth/logout", {}, { withCredentials: true });
//     setAuth({ token: null, user: null });
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//   };


//   // const login = (token, user) => {
//   //   localStorage.setItem("token", token);
//   //   localStorage.setItem("user", JSON.stringify(user));
//   //   setAuth({ token, user });
//   // };

//   // const logout = () => {
//   //   localStorage.removeItem("token");
//   //   localStorage.removeItem("user");
//   //   setAuth({ token: null, user: null });
//   // };

//   return (
//     <AuthContext.Provider value={{ auth, loading, loginWithEmail, loginWithFacebook, loginWithGoogle, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
  });
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user (works for all login methods if backend handles session/cookie)
  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/auth/me", {
        withCredentials: true, // needed for Google/Facebook OAuth cookies
      });
      setAuth({ token: localStorage.getItem("token"), user: res.data.user });
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      console.log("Error fetching user:", err);
      setAuth({ token: null, user: null });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // ---- Login Methods ----

  // Email/Password login
  const loginWithEmail = async (email, password) => {
    const res = await axios.post("http://localhost:5001/api/auth/login", {
      email,
      password,
    });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setAuth({ token: res.data.token, user: res.data.user });
  };

  // Google login (redirect or popup handled by backend)
  const loginWithGoogle = () => {
    window.location.href = "http://localhost:5001/api/auth/google";
  };

  // Facebook login
  const loginWithFacebook = () => {
    window.location.href = "http://localhost:5001/api/auth/facebook";
  };

  // Logout
  const logout = async () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        loading,
        loginWithEmail,
        loginWithGoogle,
        loginWithFacebook,
        logout,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

