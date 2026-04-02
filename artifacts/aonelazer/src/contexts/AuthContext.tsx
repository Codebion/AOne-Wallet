import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  useGetMe,
  useLogin,
  useLogout,
  useRegister,
  LoginMutationBody,
  RegisterMutationBody,
  AuthUser,
} from "@workspace/api-client-react";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (data: LoginMutationBody) => Promise<void>;
  register: (data: RegisterMutationBody) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const { data: meData, error: meError, isLoading: meLoading } = useGetMe({
    query: {
      retry: false,
    }
  });

  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const registerMutation = useRegister();

  useEffect(() => {
    if (!meLoading) {
      if (meData) {
        setUser(meData);
      } else if (meError) {
        // If 401, they are just not logged in
        setUser(null);
      }
      setIsInitializing(false);
    }
  }, [meData, meError, meLoading]);

  const login = async (data: LoginMutationBody) => {
    return new Promise<void>((resolve, reject) => {
      loginMutation.mutate({ data }, {
        onSuccess: (userData) => { setUser(userData); resolve(); },
        onError: (err) => reject(err),
      });
    });
  };

  const register = async (data: RegisterMutationBody) => {
    return new Promise<void>((resolve, reject) => {
      registerMutation.mutate({ data }, {
        onSuccess: (userData) => { setUser(userData); resolve(); },
        onError: (err) => reject(err),
      });
    });
  };

  const logout = async () => {
    return new Promise<void>((resolve) => {
      logoutMutation.mutate(undefined, {
        onSettled: () => { setUser(null); resolve(); },
      });
    });
  };

  const updateUser = (newUser: AuthUser) => setUser(newUser);

  const isLoading = isInitializing || loginMutation.isPending || logoutMutation.isPending || registerMutation.isPending;

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
