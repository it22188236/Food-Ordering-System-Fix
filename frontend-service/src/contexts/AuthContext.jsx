import { createContext, useContext, useState} from 'react';

const AuthContext = createContext();

export const AuthProvider = ({children})=>{
  const [auth,setAuth] = useState(()=>{
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    return {token, user};
  });

  const login = (token,user)=>{
    localStorage.setItem("token",token);
    localStorage.setItem("user",JSON.stringify(user));
    setAuth({token,user});
  };

  const logout = ()=>{
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({token:null, user:null})
  };

  return(
    <AuthContext.Provider value={{auth, login, logout}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);