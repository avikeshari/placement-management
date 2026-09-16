import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (data) => {
    // The JWT is stored as an httpOnly cookie by the server. We only keep the
    // non-sensitive user object for the UI. Never store the token in localStorage.
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if the server request fails, clear the local session.
    }
    setUser(null);
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (!cancelled) setUser(parsed);
          } catch {
            // ignore malformed stored user
          }
        }

        // Validate the httpOnly session cookie against the server so deactivated
        // or deleted accounts are signed out on refresh.
        const response = await api.get("/auth/me");
        const freshUser = response.data.user;
        if (!cancelled && freshUser) {
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          localStorage.removeItem("user");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: Boolean(user),
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
