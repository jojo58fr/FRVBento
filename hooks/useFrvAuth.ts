import { useCallback, useEffect, useState } from 'react';
type FrvSession = {
  user?: {
    id?: string | number;
    username?: string;
    name?: string;
    displayName?: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
    roles?: string[];
    hasVtuberRole?: boolean;
  } | null;
  accessToken?: string;
  token?: string;
  role?: string;
  roles?: string[];
  hasVtuberRole?: boolean;
};

const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_URL?.trim() || '';
const getAuthOrigin = () => process.env.NEXT_PUBLIC_FRVTUBERS_AUTH_ORIGIN?.trim() || '';
const getCallbackBaseUrl = () =>
  process.env.NEXT_PUBLIC_FRVSTREAM_CALLBACK_URL?.trim() || '';

export const useFrvAuth = () => {
  const authOrigin = getAuthOrigin();
  const apiBaseUrl = getApiBaseUrl();
  const enabled = !!authOrigin;
  const callbackBaseUrl = getCallbackBaseUrl();

  const [session, setSession] = useState<FrvSession | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const buildSyncUrl = useCallback(() => {
    if (!apiBaseUrl) return '/api/v1/auth/sync';
    return `${apiBaseUrl.replace(/\/$/, '')}/api/v1/auth/sync`;
  }, [apiBaseUrl]);

  const fetchSessionFromApi = useCallback(async () => {
    const url = buildSyncUrl();
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!data) return null;
    if (data.session) return data.session as FrvSession;
    if (data.user || data.accessToken || data.token) return data as FrvSession;
    return null;
  }, [buildSyncUrl]);

  const fetchSessionFromAuthOrigin = useCallback(async () => {
    if (!authOrigin) return null;
    const sameOrigin =
      typeof window !== 'undefined' && window.location.origin === authOrigin;
    if (!sameOrigin) return null;
    const res = await fetch(`${authOrigin.replace(/\/$/, '')}/api/auth/session`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!data) return null;
    return data as FrvSession;
  }, [authOrigin]);

  const syncSession = useCallback(async () => {
    if (!enabled) return null;
    setLoading(true);
    setError(null);
    try {
      const fromApi = await fetchSessionFromApi();
      if (fromApi) {
        setSession(fromApi);
        return fromApi;
      }
      const fromAuth = await fetchSessionFromAuthOrigin();
      if (fromAuth) {
        setSession(fromAuth);
        return fromAuth;
      }
      setSession(null);
      return null;
    } catch (err) {
      setSession(null);
      setError(err instanceof Error ? err.message : 'Failed to sync session');
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled, fetchSessionFromApi, fetchSessionFromAuthOrigin]);

  const login = useCallback(() => {
    if (!authOrigin) {
      setError('FRVtubers auth origin is not configured.');
      return;
    }
    const baseUrl = authOrigin.replace(/\/$/, '');
    const callbackUrl =
      callbackBaseUrl || (typeof window !== 'undefined' ? window.location.href : '');
    const url = `${baseUrl}/api/auth/signin/discord?callbackUrl=${encodeURIComponent(
      callbackUrl
    )}`;
    window.location.href = url;
  }, [authOrigin, callbackBaseUrl]);

  const logout = useCallback(async () => {
    if (!authOrigin) return;
    setLoading(true);
    setError(null);
    try {
      const baseUrl = authOrigin.replace(/\/$/, '');
      const callbackUrl =
        callbackBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
      const sameOrigin =
        typeof window !== 'undefined' && window.location.origin === authOrigin;

      // Cross-origin: avoid CORS by doing a full redirect to the auth origin
      if (!sameOrigin) {
        window.location.href = `${baseUrl}/api/auth/signout?callbackUrl=${encodeURIComponent(
          callbackUrl
        )}`;
        return;
      }

      const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const csrfData = await csrfRes.json().catch(() => null);
      const csrfToken = csrfData?.csrfToken;
      if (!csrfToken) {
        throw new Error('Failed to fetch CSRF token');
      }
      const body = new URLSearchParams();
      body.set('csrfToken', csrfToken);
      body.set('callbackUrl', callbackUrl);
      await fetch(`${baseUrl}/api/auth/signout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    } finally {
      setLoading(false);
    }
  }, [authOrigin, callbackBaseUrl]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void syncSession();
  }, [enabled, syncSession]);

  const user = session?.user || null;
  const isAuthenticated = !!user;
  const hasVtuberRole = (() => {
    if (!session || !isAuthenticated) return null;
    const boolFrom = (value: unknown): boolean | null => {
      if (value === true) return true;
      if (value === false) return false;
      if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
      }
      return null;
    };
    const direct =
      boolFrom(session.hasVtuberRole) ??
      boolFrom(session.user?.hasVtuberRole);
    if (direct !== null) return direct;
    const roles = [
      ...(Array.isArray(session.roles) ? session.roles : []),
      ...(Array.isArray(session.user?.roles) ? session.user?.roles : []),
    ].map((role) => String(role).toLowerCase());
    if (roles.includes('vtuberfr')) return true;
    if (typeof session.user?.role === 'string' && session.user.role.toLowerCase() === 'vtuberfr') {
      return true;
    }
    if (typeof session.role === 'string' && session.role.toLowerCase() === 'vtuberfr') {
      return true;
    }
    return false;
  })();

  return {
    enabled,
    loading,
    error,
    session,
    user,
    isAuthenticated,
    hasVtuberRole,
    syncSession,
    login,
    logout,
  };
};
