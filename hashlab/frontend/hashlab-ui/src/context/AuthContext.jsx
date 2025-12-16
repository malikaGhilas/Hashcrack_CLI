// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [email, setEmail] = useState(() => localStorage.getItem("email") || null);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;

  async function login(emailInput, password) {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: emailInput,
        password,
      });

      const jwt = res.data.token;

      setToken(jwt);
      setEmail(emailInput);

      localStorage.setItem("token", jwt);
      localStorage.setItem("email", emailInput);

      return { ok: true };
    } catch (err) {
      console.error(err);
      return {
        ok: false,
        error:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Erreur de connexion",
      };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken(null);
    setEmail(null);
    localStorage.removeItem("token");
    localStorage.removeItem("email");
  }

  const value = {
    token,
    email,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
