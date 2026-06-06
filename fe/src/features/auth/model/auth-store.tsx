"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearAuthSessionMarker,
  hasAuthSessionMarker,
} from "@/shared/auth/session-marker";
import { clearAccessToken } from "@/shared/auth/token-storage";
import {
  getMe,
  googleLogin as googleLoginApi,
  login as loginApi,
  logoutFromApi,
  refreshAccessTokenFromApi,
  register as registerApi,
} from "../api/auth.api";
import type {
  GoogleLoginResult,
  LoginInput,
  LoginResult,
  RegisterInput,
  RegisterResult,
  User,
} from "../api/auth.schema";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<LoginResult>;
  loginWithGoogle: (idToken: string) => Promise<GoogleLoginResult>;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  loadMe: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

let loadMeInFlight: Promise<User | null> | null = null;

async function requestCurrentUser(): Promise<User | null> {
  if (!hasAuthSessionMarker()) {
    clearAccessToken();
    return null;
  }

  try {
    const refreshResult = await refreshAccessTokenFromApi();

    if (refreshResult.user) {
      return refreshResult.user;
    }

    return await getMe();
  } catch {
    clearAccessToken();
    clearAuthSessionMarker();
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMe = useCallback(async (): Promise<User | null> => {
    if (!hasAuthSessionMarker()) {
      clearAccessToken();
      setUser(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);

    try {
      if (!loadMeInFlight) {
        loadMeInFlight = requestCurrentUser().finally(() => {
          loadMeInFlight = null;
        });
      }

      const currentUser = await loadMeInFlight;
      setUser(currentUser);
      return currentUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadMe();
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadMe]);

  const login = useCallback(async (input: LoginInput) => {
    const result = await loginApi(input);
    setUser(result.user);
    return result;
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const result = await googleLoginApi({ idToken });
    setUser(result.user);
    return result;
  }, []);

  const register = useCallback((input: RegisterInput) => {
    return registerApi(input);
  }, []);

  const logout = useCallback(async () => {
    await logoutFromApi();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      loginWithGoogle,
      register,
      logout,
      loadMe,
    }),
    [isLoading, loadMe, login, loginWithGoogle, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
