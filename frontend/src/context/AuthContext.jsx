import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "../api/client";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "taskflow-auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const savedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!savedSession) {
      setAuthLoading(false);
      return;
    }

    let storedToken = "";

    try {
      const parsedSession = JSON.parse(savedSession);
      storedToken = parsedSession?.token || "";
    } catch (_error) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthLoading(false);
      return;
    }

    if (!storedToken) {
      setAuthLoading(false);
      return;
    }

    authApi
      .me(storedToken)
      .then((data) => {
        setToken(storedToken);
        setUser(data.user);
      })
      .catch(() => {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  const saveSession = (sessionToken, nextUser) => {
    setToken(sessionToken);
    setUser(nextUser);
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: sessionToken })
    );
  };

  const login = async (payload) => {
    const data = await authApi.login(payload);
    saveSession(data.token, data.user);
    return data;
  };

  const signup = async (payload) => {
    const data = await authApi.signup(payload);
    saveSession(data.token, data.user);
    return data;
  };

  const logout = () => {
    setToken("");
    setUser(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      authLoading,
      login,
      signup,
      logout,
    }),
    [authLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
