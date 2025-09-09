import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { StaffMember, Permission } from '../types';
import { MOCK_STAFF_MEMBERS } from '../constants';

interface AuthContextType {
  currentUser: StaffMember | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);

  const login = useCallback(async (username: string, password: string): Promise<void> => {
    // Simulate API call
    await new Promise(res => setTimeout(res, 500));
    
    const user = MOCK_STAFF_MEMBERS.find(
      member => member.username.toLowerCase() === username.toLowerCase() && member.password === password
    );

    if (user) {
      setCurrentUser(user);
    } else {
      throw new Error("Invalid username or password.");
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const userPermissions = useMemo(() => {
    return new Set(currentUser?.role?.permissions || []);
  }, [currentUser]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!currentUser) return false;
    return userPermissions.has(permission);
  }, [currentUser, userPermissions]);

  const value = useMemo(() => ({
    currentUser,
    login,
    logout,
    hasPermission
  }), [currentUser, login, logout, hasPermission]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};