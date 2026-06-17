import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/auth';
import { tokenStore } from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

// read the payload out of the jwt just for the UI (role/org). the server is the
// one that actually verifies it.
function decodeToken(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);

  // on first load, if there's a token confirm it still works
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    setClaims(decodeToken(token));
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => {
        tokenStore.clear();
        setClaims(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const applyToken = useCallback(async (token, immediateUser) => {
    tokenStore.set(token);
    setClaims(decodeToken(token));
    if (immediateUser) setUser(immediateUser);
    try {
      const { user } = await authApi.me(); // gets the populated org name
      setUser(user);
    } catch {
      /* keep immediateUser */
    }
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await authApi.login(credentials);
      await applyToken(data.token, data.user);
      return data.user;
    },
    [applyToken]
  );

  const register = useCallback(
    async (payload) => {
      const data = await authApi.register(payload);
      await applyToken(data.token, data.user);
      return data.user;
    },
    [applyToken]
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setClaims(null);
  }, []);

  const organization =
    user?.organizationId && typeof user.organizationId === 'object' ? user.organizationId : null;

  const value = {
    user,
    claims,
    organization,
    role: claims?.role || user?.role || 'member',
    isAdmin: (claims?.role || user?.role) === 'admin',
    isAuthenticated: !!claims,
    loading,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
