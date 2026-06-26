import { TenantStatus } from '@prisma/client';

export type TenantAccessMode = 
  | 'STOREFRONT_FULL' 
  | 'STOREFRONT_READONLY' 
  | 'SUSPENDED'
  | 'RESERVED'
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
  status: 'SUCCESS' | 'NOT_FOUND' | 'BLOCKED' | 'MARKETING_SITE' | 'RESERVED' | 'SUSPENDED';
  accessMode: TenantAccessMode;
  tenant: ResolvedTenant | null;
  suspended: boolean;
  error: string | null;
}
