interface VerifyResult {
  ok: boolean;
  status: number;
  payload?: unknown;
  error?: string;
  skipped?: boolean;
}

const buildVerifyUrl = () => {
  const base = process.env.FRVTUBERS_API_BASE_URL?.trim();
  if (!base) return null;
  const path = process.env.FRVTUBERS_API_VERIFY_PATH?.trim() || '/auth/verify';
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
};

export const verifyFrvAccessToken = async (token: string): Promise<VerifyResult> => {
  const verifyUrl = buildVerifyUrl();
  if (!verifyUrl) {
    return { ok: true, status: 200, skipped: true };
  }

  try {
    const res = await fetch(verifyUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: 'FRVtubers auth verification failed',
        payload,
      };
    }
    return { ok: true, status: res.status, payload };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      error: error instanceof Error ? error.message : 'Auth verification failed',
    };
  }
};
