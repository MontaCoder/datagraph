"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface UserLimits {
  remainingMessages: number | null;
  resetTimestamp: number | null;
  loading: boolean;
  refetch: () => void;
}

const UserLimitsContext = createContext<UserLimits | undefined>(undefined);

export const UserLimitsProvider = ({ children }: { children: ReactNode }) => {
  const [remainingMessages, setRemainingMessages] = useState<number | null>(
    null
  );
  const [resetTimestamp, setResetTimestamp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  // bumped by refetch(); the effect owns the request, so every setState lands
  // in an async callback instead of the effect body
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/limits");
        const data = await res.json();
        if (cancelled) return;
        setRemainingMessages(data.remaining);
        setResetTimestamp(data.reset ?? null);
      } catch {
        if (cancelled) return;
        setRemainingMessages(null);
        setResetTimestamp(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  const refetch = () => {
    setLoading(true);
    setNonce((n) => n + 1);
  };

  return (
    <UserLimitsContext.Provider
      value={{ remainingMessages, resetTimestamp, loading, refetch }}
    >
      {children}
    </UserLimitsContext.Provider>
  );
};

export function useUserLimits(): UserLimits {
  const context = useContext(UserLimitsContext);
  if (context === undefined) {
    throw new Error("useUserLimits must be used within a UserLimitsProvider");
  }
  return context;
}
