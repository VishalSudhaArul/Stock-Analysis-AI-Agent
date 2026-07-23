import { createContext, useContext, useState, useEffect } from "react";
import { signupApi, loginApi, getMeApi } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyUser() {
      if (token) {
        try {
          const data = await getMeApi();
          if (data.success) {
            setUser(data.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    }
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    if (data.success) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const signup = async (email, password) => {
    const data = await signupApi(email, password);
    if (data.success) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
