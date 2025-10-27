import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { simpleHash } from '../utils/hash.js';

const USERS_KEY = 'casino401k_users';
const ACTIVE_USER_KEY = 'casino401k_active_user';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      const activeEmail = localStorage.getItem(ACTIVE_USER_KEY);
      setUsers(storedUsers);
      if (activeEmail && storedUsers[activeEmail]) {
        setCurrentUser({ email: activeEmail });
      }
    } catch (error) {
      console.error('Failed to load auth state', error);
      setUsers({});
      setCurrentUser(null);
    } finally {
      setIsReady(true);
    }
  }, []);

  const persistUsers = (nextUsers) => {
    setUsers(nextUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
  };

  const register = useCallback(async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (users[trimmedEmail]) {
      throw new Error('Email already registered.');
    }
    const passwordHash = await simpleHash(password);
    const nextUsers = {
      ...users,
      [trimmedEmail]: { passwordHash }
    };
    persistUsers(nextUsers);
    setCurrentUser({ email: trimmedEmail });
    localStorage.setItem(ACTIVE_USER_KEY, trimmedEmail);
    return trimmedEmail;
  }, [users]);

  const login = useCallback(async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const userRecord = users[trimmedEmail];
    if (!userRecord) {
      throw new Error('No account found for that email.');
    }
    const passwordHash = await simpleHash(password);
    if (passwordHash !== userRecord.passwordHash) {
      throw new Error('Incorrect password.');
    }
    setCurrentUser({ email: trimmedEmail });
    localStorage.setItem(ACTIVE_USER_KEY, trimmedEmail);
    return trimmedEmail;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(ACTIVE_USER_KEY);
  }, []);

  const value = useMemo(() => ({
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isReady,
    register,
    login,
    logout
  }), [currentUser, isReady, login, logout, register]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
