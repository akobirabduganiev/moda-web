"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { TokenPair } from "./types";
import { __setAccessTokenGetter, refresh as apiRefresh } from "./api";

// LocalStorage keys
const LS_ACCESS = "mooda_access_token";
const LS_REFRESH = "mooda_refresh_token";

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
};

export type AuthContextValue = {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (pair: TokenPair | null) => void;
  logout: () => void;
  ensureAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadTokens(): AuthState {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem(LS_ACCESS),
    refreshToken: localStorage.getItem(LS_REFRESH),
  };
}

function saveTokens(pair: TokenPair | null) {
  if (typeof window === "undefined") return;
  if (pair) {
    localStorage.setItem(LS_ACCESS, pair.accessToken);
    localStorage.setItem(LS_REFRESH, pair.refreshToken);
  } else {
    localStorage.removeItem(LS_ACCESS);
    localStorage.removeItem(LS_REFRESH);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // initial load
  useEffect(() => {
    const { accessToken, refreshToken } = loadTokens();
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
  }, []);

  // Provide token getter to API layer
  useEffect(() => {
    __setAccessTokenGetter(() => accessToken);
  }, [accessToken]);

  const setTokens = (pair: TokenPair | null) => {
    if (pair) {
      setAccessToken(pair.accessToken);
      setRefreshToken(pair.refreshToken);
    } else {
      setAccessToken(null);
      setRefreshToken(null);
    }
    saveTokens(pair);
  };

  const logout = () => setTokens(null);

  const ensureAccessToken = async (): Promise<string | null> => {
    if (accessToken) return accessToken;
    if (refreshToken) {
      try {
        const pair = await apiRefresh(refreshToken);
        setTokens(pair);
        return pair.accessToken;
      } catch {
        logout();
        return null;
      }
    }
    return null;
  };

  const value: AuthContextValue = useMemo(
    () => ({ accessToken, refreshToken, setTokens, logout, ensureAccessToken }),
    [accessToken, refreshToken]
  );

  return React.createElement(AuthContext.Provider, { value }, children as any);
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}