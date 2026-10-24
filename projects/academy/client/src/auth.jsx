import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, tokenStore } from "./api/index.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Restore the session from the saved token
  useEffect(() => {
    if (!tokenStore.get()) { setReady(true); return; }
    api("/auth/me")
      .then(({ user }) => setUser(user))
      .catch(() => tokenStore.set(null))
      .finally(() => setReady(true));
  }, []);

  const signIn = useCallback(async (path, body) => {
    const { token, user } = await api(path, { method: "POST", body });
    tokenStore.set(token);
    setUser(user);
    return user;
  }, []);

  const value = useMemo(() => ({
    user,
    ready,
    login: (email, password) => signIn("/auth/login", { email, password }),
    register: (name, email, password) => signIn("/auth/register", { name, email, password }),
    logout: () => { tokenStore.set(null); setUser(null); },
  }), [user, ready, signIn]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// Where each kind of account lands after signing in
export const homeFor = (user) => (user?.role === "teacher" ? "/teacher" : "/learning");
