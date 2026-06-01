import { TenantStatus } from '@prisma/client';

export type TenantAccessMode = 
  | 'STOREFRONT_FULL' 
  | 'STOREFRONT_READONLY' 
  | 'BLOCKED' 
  | 'MARKETING_SITE' 
  | 'NOT_FOUND';

export interface ResolvedTenant {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  status: TenantStatus;
}

export interface TenantResolveResult {
  status: 'SUCCESS' | 'NOT_FOUND' | 'BLOCKED' | 'MARKETING_SITE';
  accessMode: TenantAccessMode;
  tenant: ResolvedTenant | null;
  error: string | null;
}
