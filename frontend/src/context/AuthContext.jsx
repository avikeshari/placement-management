import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

const decodeToken = (token) => {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(window.atob(normalized))));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return false;
  return decoded.exp * 1000 <= Date.now();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      if (token && isTokenExpired(token)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return null;
      }
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [checkingAuth, setCheckingAuth] = useState(false);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && isTokenExpired(token)) {
      logout();
      return;
    }

    const storedUser = localStorage.getItem("user");

    if (storedUser && token) {
      // Validate the stored user against the server so stale/tampered data
      // cannot present a false authenticated state.
      setCheckingAuth(true);
      api
        .get("/profile/me")
        .then((response) => {
          const profile = response.data.profile;
          const profileUser = profile?.user;
          const freshUser = {
            id: profileUser?.id || profileUser?._id,
            name: profileUser?.name,
            email: profileUser?.email,
            role: profileUser?.role
          };
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setCheckingAuth(false));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: Boolean(user),
        checkingAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
