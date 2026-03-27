import { useState } from "react";
import { AuthContext } from "./authContext";
import { authService } from "../services/api";

function getStoredUser() {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

function getStoredToken() {

  const token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") {
    localStorage.removeItem("token");
    return null;
  }
  return token;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());

  const loading = false;

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    return res.data;
  };

  const signup = async (name, email, password, role) => {
    const res = await authService.register(name, email, password, role);
    // Don't set token or user - just return the response
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
