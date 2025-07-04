"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children, marketplace }) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Mapping marketplace to its credentials
  const credentials = {
    foodmarketplace: {
      domainId: process.env.NEXT_PUBLIC_DOMAIN_ID,
      deviceId: process.env.NEXT_PUBLIC_DEVICE_ID,
      deviceToken: process.env.NEXT_PUBLIC_DEVICE_TOKEN,
    },
    electronicsmarketplace: {
      domainId: process.env.NEXT_PUBLIC_ELECDOMAIN_ID,
      deviceId: process.env.NEXT_PUBLIC_ELEDEVICE_ID,
      deviceToken: process.env.NEXT_PUBLIC_ELEDEVICE_TOKEN,
    },
  };

  const { domainId, deviceId, deviceToken } = credentials[marketplace] || {};

  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    token: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const guestLogin = async () => {
      try {
        if (!domainId || !deviceId || !deviceToken) {
          throw new Error(`Invalid credentials for marketplace: ${marketplace}`);
        }

        const response = await axios.post(`${BASE_URL}/user/auth/guest-login`, {
          domainId,
          deviceId,
          deviceToken,
        });

        const token = response?.data?.data?.token;

        // Store marketplace-specific tokens in localStorage with key prefix
        localStorage.setItem(`token`, token);
        localStorage.setItem(`domainId`, domainId);
        localStorage.setItem(`deviceId`, deviceId);
        localStorage.setItem(`deviceToken`, deviceToken);

        setAuthState({
          isAuthenticated: true,
          token,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Guest login failed:", error.response?.data || error.message);
        setAuthState({
          isAuthenticated: false,
          token: null,
          loading: false,
          error: error.message,
        });
      }
    };

    guestLogin();
  }, [marketplace]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
