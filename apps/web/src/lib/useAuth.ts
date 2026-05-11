'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';

export interface AuthUser {
  id: string;
  githubId: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

/**
 * Checks /api/auth/me on mount. If `redirectOnFail` is true (default for
 * protected pages), bounces to the landing page when unauthenticated.
 */
export function useAuth(redirectOnFail = true): AuthState {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api<{ user: AuthUser }>('/api/auth/me')
      .then((res) => {
        if (cancelled) return;
        setUser(res.user);
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        if (redirectOnFail) router.replace('/');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router, redirectOnFail]);

  return { user, loading };
}
