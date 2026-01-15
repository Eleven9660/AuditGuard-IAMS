import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, fetchUserAttributes, signOut as amplifySignOut, fetchAuthSession } from 'aws-amplify/auth';

export type UserRole = 'ADMIN' | 'AUDITOR' | 'MANAGER' | 'VIEWER';

interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  groups: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (action: 'create' | 'read' | 'update' | 'delete', resource: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<UserRole, Record<string, string[]>> = {
  ADMIN: {
    audit: ['create', 'read', 'update', 'delete'],
    finding: ['create', 'read', 'update', 'delete'],
    action: ['create', 'read', 'update', 'delete'],
    user: ['create', 'read', 'update', 'delete'],
    template: ['create', 'read', 'update', 'delete'],
    report: ['create', 'read', 'update', 'delete'],
  },
  AUDITOR: {
    audit: ['create', 'read', 'update'],
    finding: ['create', 'read', 'update'],
    action: ['create', 'read', 'update'],
    user: ['read'],
    template: ['read'],
    report: ['read'],
  },
  MANAGER: {
    audit: ['read'],
    finding: ['read', 'update'],
    action: ['create', 'read', 'update'],
    user: ['read'],
    template: ['read'],
    report: ['read'],
  },
  VIEWER: {
    audit: ['read'],
    finding: ['read'],
    action: ['read'],
    user: ['read'],
    template: ['read'],
    report: ['read'],
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const session = await fetchAuthSession();

      // Get groups from the access token
      const groups = (session.tokens?.accessToken?.payload['cognito:groups'] as string[]) || [];

      // Determine role from groups
      let role: UserRole = 'VIEWER';
      if (groups.includes('Admins')) role = 'ADMIN';
      else if (groups.includes('Auditors')) role = 'AUDITOR';
      else if (groups.includes('Managers')) role = 'MANAGER';

      setUser({
        userId: currentUser.userId,
        email: attributes.email || '',
        name: attributes.preferred_username || attributes.email || '',
        role,
        groups,
      });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signOut = async () => {
    await amplifySignOut();
    setUser(null);
  };

  const refreshUser = async () => {
    setIsLoading(true);
    await fetchUser();
  };

  const hasPermission = (action: 'create' | 'read' | 'update' | 'delete', resource: string): boolean => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role][resource];
    return permissions?.includes(action) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signOut,
        refreshUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
