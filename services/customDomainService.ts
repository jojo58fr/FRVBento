import type { CustomDomain } from '../types';

interface CustomDomainInstructions {
  txtHost: string;
  txtValue: string;
  cnameHost: string;
  cnameTarget: string;
}

interface CustomDomainResponse {
  record: CustomDomain;
  instructions: CustomDomainInstructions;
}

const fetchJson = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const res = await fetch(input, init);
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(errorText || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
};

export const listCustomDomains = async (bentoId?: string): Promise<CustomDomain[]> => {
  const query = bentoId ? `?bentoId=${encodeURIComponent(bentoId)}` : '';
  const data = await fetchJson<{ ok: boolean; items: CustomDomain[] }>(`/api/custom-domains${query}`);
  return Array.isArray(data.items) ? data.items : [];
};

export const createCustomDomain = async (
  domain: string,
  bentoId: string
): Promise<CustomDomainResponse> => {
  const data = await fetchJson<{ ok: boolean; record: CustomDomain; instructions: CustomDomainInstructions }>(
    '/api/custom-domains',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, bentoId }),
    }
  );
  return { record: data.record, instructions: data.instructions };
};

export const verifyCustomDomain = async (id: number): Promise<CustomDomainResponse & { checks: any }> => {
  const data = await fetchJson<{
    ok: boolean;
    record: CustomDomain & { checks: { cname: boolean; txt: boolean } };
    instructions: CustomDomainInstructions;
  }>('/api/custom-domains/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return { record: data.record, instructions: data.instructions, checks: data.record.checks };
};

export const deleteCustomDomain = async (id: number): Promise<void> => {
  await fetchJson(`/api/custom-domains/${id}`, { method: 'DELETE' });
};
