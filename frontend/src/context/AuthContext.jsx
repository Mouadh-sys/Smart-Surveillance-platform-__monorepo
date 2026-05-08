import React from 'react';

const AuthContext = React.createContext(null);
const STORAGE_KEY = 'smart-surveillance-auth';

function readStoredUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedUser = window.localStorage.getItem(STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(() => readStoredUser());

  const login = React.useCallback((nextUser) => {
    const resolvedUser = {
      name: nextUser?.name || 'Operator',
      email: nextUser?.email || '',
    };

    setUser(resolvedUser);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resolvedUser));
    }

    return resolvedUser;
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;

