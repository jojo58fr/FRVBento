import { randomBytes } from 'crypto';
import { promises as dns } from 'dns';
import { promises as fs } from 'fs';
import path from 'path';
import type { SavedBento } from '../../types';
import { prisma } from './prisma';

export interface CustomDomainRecord {
  id: number;
  domain: string;
  status: string;
  verificationToken: string;
  bentoId: string;
  ownerId: string | null;
  verifiedAt: number | null;
  lastCheckedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

const normalizeDomain = (input: string): string | null => {
  const raw = input.trim().toLowerCase();
  if (!raw) return null;
  let host = raw;
  if (host.startsWith('http://') || host.startsWith('https://')) {
    try {
      host = new URL(host).hostname.toLowerCase();
    } catch {
      return null;
    }
  }
  host = host.replace(/\/.*$/, '');
  host = host.replace(/:\d+$/, '');
  host = host.replace(/\.$/, '');
  if (!/^[a-z0-9.-]+$/.test(host)) return null;
  if (host.includes('..')) return null;
  return host;
};

const mapRecord = (record: {
  id: number;
  domain: string;
  status: string;
  verificationToken: string;
  bentoId: string;
  ownerId: string | null;
  verifiedAt: Date | null;
  lastCheckedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): CustomDomainRecord => ({
  id: record.id,
  domain: record.domain,
  status: record.status,
  verificationToken: record.verificationToken,
  bentoId: record.bentoId,
  ownerId: record.ownerId,
  verifiedAt: record.verifiedAt ? record.verifiedAt.getTime() : null,
  lastCheckedAt: record.lastCheckedAt ? record.lastCheckedAt.getTime() : null,
  createdAt: record.createdAt.getTime(),
  updatedAt: record.updatedAt.getTime(),
});

export const listCustomDomainsForOwner = async (
  ownerId: string,
  bentoId?: string
): Promise<CustomDomainRecord[]> => {
  const records = await prisma.customDomain.findMany({
    where: { ownerId, ...(bentoId ? { bentoId } : {}) },
    orderBy: { createdAt: 'desc' },
  });
  return records.map(mapRecord);
};

export const createCustomDomainForOwner = async (
  ownerId: string,
  bentoId: string,
  domainInput: string
): Promise<CustomDomainRecord> => {
  const domain = normalizeDomain(domainInput);
  if (!domain) {
    throw new Error('Invalid domain');
  }

  const existing = await prisma.customDomain.findUnique({ where: { domain } });
  if (existing) {
    if (existing.ownerId !== ownerId) {
      throw new Error('Domain already in use');
    }
    if (existing.bentoId !== bentoId) {
      throw new Error('Domain already assigned to another bento');
    }
    return mapRecord(existing);
  }

  const token = randomBytes(12).toString('hex');
  const created = await prisma.customDomain.create({
    data: {
      domain,
      status: 'pending',
      verificationToken: token,
      bentoId,
      ownerId,
    },
  });
  await writeTraefikCustomDomains();
  return mapRecord(created);
};

const normalizeDnsValue = (value: string): string => value.trim().toLowerCase().replace(/\.$/, '');

const TRAEFIK_CUSTOM_DOMAINS_PATH = path.join(
  process.cwd(),
  '_traefik',
  'custom-domains.yml'
);

const buildTraefikRouterName = (domain: string): string =>
  `bento-domain-${domain.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase()}`;

const writeTraefikCustomDomains = async (): Promise<void> => {
  const records = await prisma.customDomain.findMany({
    select: { domain: true },
    orderBy: { domain: 'asc' },
  });
  const domains = records.map((record) => record.domain);

  const lines: string[] = [];
  lines.push('http:');
  lines.push('  routers:');

  for (const domain of domains) {
    const routerName = buildTraefikRouterName(domain);
    lines.push(`    ${routerName}:`);
    lines.push(`      rule: "Host(\`${domain}\`)"`);
    lines.push('      entryPoints: ["websecure"]');
    lines.push('      tls:');
    lines.push('        certResolver: mytlschallenge');
    lines.push('      service: bento-web-svc');
  }

  const content = lines.join('\n') + '\n';
  await fs.mkdir(path.dirname(TRAEFIK_CUSTOM_DOMAINS_PATH), { recursive: true });
  await fs.writeFile(TRAEFIK_CUSTOM_DOMAINS_PATH, content, 'utf8');
};

export const verifyCustomDomainForOwner = async (
  ownerId: string,
  id: number
): Promise<CustomDomainRecord & { checks: { cname: boolean; txt: boolean } }> => {
  const record = await prisma.customDomain.findUnique({ where: { id } });
  if (!record || record.ownerId !== ownerId) {
    throw new Error('Custom domain not found');
  }

  const cnameTarget = normalizeDnsValue(
    process.env.CUSTOM_DOMAIN_CNAME_TARGET?.trim() || 'cname.frvtubers.com'
  );
  const domain = normalizeDnsValue(record.domain);
  const txtHost = `_frvbento.${domain}`;

  let cnameOk = false;
  let txtOk = false;

  try {
    const cnameRecords = await dns.resolveCname(domain);
    cnameOk = cnameRecords.some((entry) => normalizeDnsValue(entry) === cnameTarget);
  } catch {
    cnameOk = false;
  }

  try {
    const txtRecords = await dns.resolveTxt(txtHost);
    const flattened = txtRecords.flat().map((entry) => entry.trim());
    txtOk = flattened.includes(record.verificationToken);
  } catch {
    txtOk = false;
  }

  const nextStatus = cnameOk && txtOk ? 'verified' : 'pending';
  const updated = await prisma.customDomain.update({
    where: { id },
    data: {
      status: nextStatus,
      verifiedAt: cnameOk && txtOk ? new Date() : null,
      lastCheckedAt: new Date(),
    },
  });
  await writeTraefikCustomDomains();

  return {
    ...mapRecord(updated),
    checks: { cname: cnameOk, txt: txtOk },
  };
};

export const deleteCustomDomainForOwner = async (ownerId: string, id: number): Promise<void> => {
  const existing = await prisma.customDomain.findUnique({ where: { id } });
  if (!existing || existing.ownerId !== ownerId) {
    throw new Error('Custom domain not found');
  }
  await prisma.customDomain.delete({ where: { id } });
  await writeTraefikCustomDomains();
};

export const getBentoByCustomDomain = async (
  domainInput: string
): Promise<{ domain: string; bento: SavedBento } | null> => {
  const domain = normalizeDomain(domainInput);
  if (!domain) return null;
  const record = await prisma.customDomain.findUnique({
    where: { domain },
    include: { bento: true },
  });
  if (!record || record.status !== 'verified' || !record.bento) return null;
  return {
    domain: record.domain,
    bento: record.bento.data as unknown as SavedBento,
  };
};

export const getCustomDomainInstructions = (domainInput: string, token: string) => {
  const domain = normalizeDomain(domainInput) || domainInput.trim().toLowerCase();
  const cnameTarget = normalizeDnsValue(
    process.env.CUSTOM_DOMAIN_CNAME_TARGET?.trim() || 'cname.frvtubers.com'
  );
  return {
    txtHost: `_frvbento.${domain}`,
    txtValue: token,
    cnameHost: domain,
    cnameTarget,
  };
};
