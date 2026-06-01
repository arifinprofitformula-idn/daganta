import { TenantStatus } from '@prisma/client';
import { prisma } from '../prisma';
import { TenantResolveResult } from './types';

export async function resolveTenantFromHost(hostname: string): Promise<TenantResolveResult> {
  try {
    if (!hostname) {
      return {
        status: 'NOT_FOUND',
        accessMode: 'NOT_FOUND',
        tenant: null,
        error: 'Hostname is empty'
      };
    }

    // 1. Normalize hostname (remove port and convert to lowercase)
    const cleanHost = hostname.trim().split(':')[0].toLowerCase();

    // Get root domain from environment variables with fallback
    const rootDomain = (process.env.NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN || 'daganta.store').toLowerCase();

    // 2. Detect marketing/development root sites
    const marketingSites = new Set([
      rootDomain,
      'www.' + rootDomain,
      'localhost',
      'www.localhost',
      '127.0.0.1',
      'www.127.0.0.1'
    ]);

    if (marketingSites.has(cleanHost)) {
      return {
        status: 'MARKETING_SITE',
        accessMode: 'MARKETING_SITE',
        tenant: null,
        error: null
      };
    }

    // 3. Extract subdomain
    let subdomain = '';
    if (cleanHost.endsWith('.' + rootDomain)) {
      subdomain = cleanHost.slice(0, -(rootDomain.length + 1));
    } else if (cleanHost.endsWith('.localhost')) {
      subdomain = cleanHost.slice(0, -10); // '.localhost'.length = 10
    } else if (cleanHost.endsWith('.127.0.0.1')) {
      subdomain = cleanHost.slice(0, -10); // '.127.0.0.1'.length = 10
    } else {
      // Standalone hostname (e.g. "toyanusantara")
      subdomain = cleanHost;
    }

    // Strip leading 'www.' from subdomain if present
    if (subdomain.startsWith('www.')) {
      subdomain = subdomain.substring(4);
    }

    if (!subdomain) {
      return {
        status: 'NOT_FOUND',
        accessMode: 'NOT_FOUND',
        tenant: null,
        error: `Failed to extract subdomain from hostname: ${hostname}`
      };
    }

    // 4. Query Tenant in database
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain }
    });

    if (!tenant) {
      return {
        status: 'NOT_FOUND',
        accessMode: 'NOT_FOUND',
        tenant: null,
        error: `Tenant not found for subdomain: ${subdomain}`
      };
    }

    // 5. Map TenantStatus to TenantAccessMode
    let accessMode: TenantResolveResult['accessMode'];
    let status: TenantResolveResult['status'] = 'SUCCESS';

    switch (tenant.status) {
      case TenantStatus.ACTIVE:
      case TenantStatus.EXPIRING_SOON:
      case TenantStatus.GRACE_PERIOD:
        accessMode = 'STOREFRONT_FULL';
        break;
      case TenantStatus.LIMITED:
        accessMode = 'STOREFRONT_READONLY';
        break;
      case TenantStatus.SUSPENDED:
      case TenantStatus.ARCHIVED:
        accessMode = 'BLOCKED';
        status = 'BLOCKED';
        break;
      default:
        accessMode = 'NOT_FOUND';
        status = 'NOT_FOUND';
    }

    return {
      status,
      accessMode,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        subdomain: tenant.subdomain,
        status: tenant.status
      },
      error: null
    };
  } catch (e: any) {
    return {
      status: 'NOT_FOUND',
      accessMode: 'NOT_FOUND',
      tenant: null,
      error: e.message || 'Unknown error occurred during tenant resolution'
    };
  }
}
