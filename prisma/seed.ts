import { PrismaClient, UserRole, TenantStatus, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // ==========================================
  // 1. USER PROFILES
  // ==========================================
  const superAdminId = '00000000-0000-0000-0000-000000000001';
  const superAdmin = await prisma.userProfile.upsert({
    where: { email: 'admin@daganta.com' },
    update: {
      name: 'Super Admin Daganta',
      authUserId: null,
    },
    create: {
      id: superAdminId,
      email: 'admin@daganta.com',
      name: 'Super Admin Daganta',
      authUserId: null,
    },
  });
  console.log('Super Admin UserProfile seeded:', superAdmin.email);

  const toyaOwnerId = '00000000-0000-0000-0000-000000000002';
  const toyaOwner = await prisma.userProfile.upsert({
    where: { email: 'owner.toya@daganta.com' },
    update: {
      name: 'Arifin Toya Owner',
      authUserId: null,
    },
    create: {
      id: toyaOwnerId,
      email: 'owner.toya@daganta.com',
      name: 'Arifin Toya Owner',
      authUserId: null,
    },
  });
  console.log('Toya Owner UserProfile seeded:', toyaOwner.email);

  const demoOwnerId = '00000000-0000-0000-0000-000000000003';
  const demoOwner = await prisma.userProfile.upsert({
    where: { email: 'owner.demo@daganta.com' },
    update: {
      name: 'Demo Store Owner',
      authUserId: null,
    },
    create: {
      id: demoOwnerId,
      email: 'owner.demo@daganta.com',
      name: 'Demo Store Owner',
      authUserId: null,
    },
  });
  console.log('Demo Owner UserProfile seeded:', demoOwner.email);

  // ==========================================
  // 2. TENANTS
  // ==========================================
  const toyaTenantId = '10000000-0000-0000-0000-000000000001';
  const toyaTenant = await prisma.tenant.upsert({
    where: { slug: 'toya-nusantara' },
    update: {
      name: 'Toya Nusantara',
      subdomain: 'toyanusantara',
      ownerId: toyaOwnerId,
      status: TenantStatus.ACTIVE,
    },
    create: {
      id: toyaTenantId,
      name: 'Toya Nusantara',
      slug: 'toya-nusantara',
      subdomain: 'toyanusantara',
      ownerId: toyaOwnerId,
      status: TenantStatus.ACTIVE,
    },
  });
  console.log('Toya Nusantara Tenant seeded:', toyaTenant.slug);

  const demoTenantId = '10000000-0000-0000-0000-000000000002';
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-store' },
    update: {
      name: 'Demo Store',
      subdomain: 'demostore',
      ownerId: demoOwnerId,
      status: TenantStatus.ACTIVE,
    },
    create: {
      id: demoTenantId,
      name: 'Demo Store',
      slug: 'demo-store',
      subdomain: 'demostore',
      ownerId: demoOwnerId,
      status: TenantStatus.ACTIVE,
    },
  });
  console.log('Demo Store Tenant seeded:', demoTenant.slug);

  // ==========================================
  // 3. TENANT MEMBERS
  // ==========================================
  await prisma.tenantMember.upsert({
    where: {
      tenantId_userId: {
        tenantId: toyaTenantId,
        userId: toyaOwnerId,
      },
    },
    update: {
      role: UserRole.TENANT_OWNER,
    },
    create: {
      tenantId: toyaTenantId,
      userId: toyaOwnerId,
      role: UserRole.TENANT_OWNER,
    },
  });
  console.log('Toya Owner membership verified.');

  await prisma.tenantMember.upsert({
    where: {
      tenantId_userId: {
        tenantId: demoTenantId,
        userId: demoOwnerId,
      },
    },
    update: {
      role: UserRole.TENANT_OWNER,
    },
    create: {
      tenantId: demoTenantId,
      userId: demoOwnerId,
      role: UserRole.TENANT_OWNER,
    },
  });
  console.log('Demo Owner membership verified.');

  // ==========================================
  // 4. PRODUCT CATEGORIES (Toya Nusantara)
  // ==========================================
  const toyaRotanCategoryId = '20000000-0000-0000-0000-000000000001';
  const toyaRotanCategory = await prisma.productCategory.upsert({
    where: {
      tenantId_slug: {
        tenantId: toyaTenantId,
        slug: 'toya-rotan',
      },
    },
    update: {
      name: 'Toya Rotan',
      description: 'Katalog Toya Rotan berkualitas tinggi',
      sortOrder: 1,
      isActive: true,
    },
    create: {
      id: toyaRotanCategoryId,
      tenantId: toyaTenantId,
      name: 'Toya Rotan',
      slug: 'toya-rotan',
      description: 'Katalog Toya Rotan berkualitas tinggi',
      sortOrder: 1,
      isActive: true,
    },
  });
  console.log('Category Toya Rotan seeded:', toyaRotanCategory.name);

  const paketLatihanCategoryId = '20000000-0000-0000-0000-000000000002';
  const paketLatihanCategory = await prisma.productCategory.upsert({
    where: {
      tenantId_slug: {
        tenantId: toyaTenantId,
        slug: 'paket-latihan',
      },
    },
    update: {
      name: 'Paket Latihan',
      description: 'Paket latihan fisik dan beladiri lengkap',
      sortOrder: 2,
      isActive: true,
    },
    create: {
      id: paketLatihanCategoryId,
      tenantId: toyaTenantId,
      name: 'Paket Latihan',
      slug: 'paket-latihan',
      description: 'Paket latihan fisik dan beladiri lengkap',
      sortOrder: 2,
      isActive: true,
    },
  });
  console.log('Category Paket Latihan seeded:', paketLatihanCategory.name);

  // ==========================================
  // 5. PRODUCTS (Toya Nusantara)
  // ==========================================
  const product1Id = '30000000-0000-0000-0000-000000000001';
  const product1 = await prisma.product.upsert({
    where: {
      tenantId_slug: {
        tenantId: toyaTenantId,
        slug: 'toya-rotan-latihan-150-cm',
      },
    },
    update: {
      categoryId: toyaRotanCategoryId,
      name: 'Toya Rotan Latihan 150 cm',
      description: 'Toya rotan untuk latihan beladiri dengan panjang 150 cm, kuat dan fleksibel.',
      basePrice: '45000',
      isFeatured: true,
      status: ProductStatus.ACTIVE,
    },
    create: {
      id: product1Id,
      tenantId: toyaTenantId,
      categoryId: toyaRotanCategoryId,
      name: 'Toya Rotan Latihan 150 cm',
      slug: 'toya-rotan-latihan-150-cm',
      description: 'Toya rotan untuk latihan beladiri dengan panjang 150 cm, kuat dan fleksibel.',
      basePrice: '45000',
      isFeatured: true,
      status: ProductStatus.ACTIVE,
    },
  });
  console.log('Product 1 seeded:', product1.name);

  const product2Id = '30000000-0000-0000-0000-000000000002';
  const product2 = await prisma.product.upsert({
    where: {
      tenantId_slug: {
        tenantId: toyaTenantId,
        slug: 'toya-rotan-latihan-180-cm',
      },
    },
    update: {
      categoryId: toyaRotanCategoryId,
      name: 'Toya Rotan Latihan 180 cm',
      description: 'Toya rotan latihan ukuran standar 180 cm. Sangat cocok untuk praktisi beladiri tradisional.',
      basePrice: '55000',
      isFeatured: true,
      status: ProductStatus.ACTIVE,
    },
    create: {
      id: product2Id,
      tenantId: toyaTenantId,
      categoryId: toyaRotanCategoryId,
      name: 'Toya Rotan Latihan 180 cm',
      slug: 'toya-rotan-latihan-180-cm',
      description: 'Toya rotan latihan ukuran standar 180 cm. Sangat cocok untuk praktisi beladiri tradisional.',
      basePrice: '55000',
      isFeatured: true,
      status: ProductStatus.ACTIVE,
    },
  });
  console.log('Product 2 seeded:', product2.name);

  const product3Id = '30000000-0000-0000-0000-000000000003';
  const product3 = await prisma.product.upsert({
    where: {
      tenantId_slug: {
        tenantId: toyaTenantId,
        slug: 'toya-rotan-premium-perguruan',
      },
    },
    update: {
      categoryId: toyaRotanCategoryId,
      name: 'Toya Rotan Premium Perguruan',
      description: 'Toya rotan pilihan dengan kualitas premium. Lurus, halus, dan sangat kuat untuk kebutuhan perguruan beladiri.',
      basePrice: '95000',
      isFeatured: true,
      status: ProductStatus.ACTIVE,
    },
    create: {
      id: product3Id,
      tenantId: toyaTenantId,
      categoryId: toyaRotanCategoryId,
      name: 'Toya Rotan Premium Perguruan',
      slug: 'toya-rotan-premium-perguruan',
      description: 'Toya rotan pilihan dengan kualitas premium. Lurus, halus, dan sangat kuat untuk kebutuhan perguruan beladiri.',
      basePrice: '95000',
      isFeatured: true,
      status: ProductStatus.ACTIVE,
    },
  });
  console.log('Product 3 seeded:', product3.name);

  // ==========================================
  // 6. PRODUCT VARIANTS (Toya Nusantara)
  // ==========================================
  const variant1 = await prisma.productVariant.upsert({
    where: { id: '40000000-0000-0000-0000-000000000001' },
    update: {
      productId: product1Id,
      name: 'Standar',
      sku: 'TY-ROT-150-STD',
      price: '45000',
      stock: 100,
      weightGram: 500,
      isActive: true,
    },
    create: {
      id: '40000000-0000-0000-0000-000000000001',
      tenantId: toyaTenantId,
      productId: product1Id,
      name: 'Standar',
      sku: 'TY-ROT-150-STD',
      price: '45000',
      stock: 100,
      weightGram: 500,
      isActive: true,
    },
  });
  console.log('Variant for Product 1 seeded:', variant1.sku);

  const variant2 = await prisma.productVariant.upsert({
    where: { id: '40000000-0000-0000-0000-000000000002' },
    update: {
      productId: product2Id,
      name: 'Standar',
      sku: 'TY-ROT-180-STD',
      price: '55000',
      stock: 150,
      weightGram: 600,
      isActive: true,
    },
    create: {
      id: '40000000-0000-0000-0000-000000000002',
      tenantId: toyaTenantId,
      productId: product2Id,
      name: 'Standar',
      sku: 'TY-ROT-180-STD',
      price: '55000',
      stock: 150,
      weightGram: 600,
      isActive: true,
    },
  });
  console.log('Variant for Product 2 seeded:', variant2.sku);

  const variant3 = await prisma.productVariant.upsert({
    where: { id: '40000000-0000-0000-0000-000000000003' },
    update: {
      productId: product3Id,
      name: 'Premium A',
      sku: 'TY-ROT-PREM-A',
      price: '95000',
      stock: 50,
      weightGram: 700,
      isActive: true,
    },
    create: {
      id: '40000000-0000-0000-0000-000000000003',
      tenantId: toyaTenantId,
      productId: product3Id,
      name: 'Premium A',
      sku: 'TY-ROT-PREM-A',
      price: '95000',
      stock: 50,
      weightGram: 700,
      isActive: true,
    },
  });
  console.log('Variant for Product 3 seeded:', variant3.sku);

  // ==========================================
  // 7. MINIMAL LOGISTICS REGIONS
  // ==========================================
  const province = await prisma.province.upsert({
    where: { id: '32' },
    update: {
      name: 'Jawa Barat',
      normalizedName: 'jawa barat',
    },
    create: {
      id: '32',
      name: 'Jawa Barat',
      normalizedName: 'jawa barat',
    },
  });
  console.log('Province seeded:', province.name);

  const regency = await prisma.regency.upsert({
    where: { id: '3273' },
    update: {
      name: 'Kota Bandung',
      normalizedName: 'kota bandung',
      type: 'KOTA',
    },
    create: {
      id: '3273',
      provinceId: '32',
      name: 'Kota Bandung',
      normalizedName: 'kota bandung',
      type: 'KOTA',
    },
  });
  console.log('Regency seeded:', regency.name);

  const district = await prisma.district.upsert({
    where: { id: '327310' },
    update: {
      name: 'Coblong',
      normalizedName: 'coblong',
    },
    create: {
      id: '327310',
      regencyId: '3273',
      name: 'Coblong',
      normalizedName: 'coblong',
    },
  });
  console.log('District seeded:', district.name);

  // ==========================================
  // 8. ADDRESS (Toya Nusantara Default Address)
  // ==========================================
  const address = await prisma.address.upsert({
    where: { id: '50000000-0000-0000-0000-000000000001' },
    update: {
      name: 'Gudang Utama Toya',
      recipientName: 'Toya Nusantara Hub',
      phone: '081234567890',
      streetAddress: 'Jl. Dago No. 123',
      provinceId: '32',
      regencyId: '3273',
      districtId: '327310',
      postalCode: '40135',
      isDefault: true,
    },
    create: {
      id: '50000000-0000-0000-0000-000000000001',
      tenantId: toyaTenantId,
      name: 'Gudang Utama Toya',
      recipientName: 'Toya Nusantara Hub',
      phone: '081234567890',
      streetAddress: 'Jl. Dago No. 123',
      provinceId: '32',
      regencyId: '3273',
      districtId: '327310',
      postalCode: '40135',
      isDefault: true,
    },
  });
  console.log('Address seeded:', address.name);

  // ==========================================
  // 9. AUDIT LOG (Seeding Event)
  // ==========================================
  const auditLog = await prisma.auditLog.upsert({
    where: { id: '60000000-0000-0000-0000-000000000001' },
    update: {
      action: 'SEED_DEMO_DATA',
      entityType: 'System',
      entityId: 'system-seed',
      metadata: { stage: 'v0.1C', seededAt: '2026-06-01' },
    },
    create: {
      id: '60000000-0000-0000-0000-000000000001',
      tenantId: toyaTenantId,
      actorId: superAdminId,
      action: 'SEED_DEMO_DATA',
      entityType: 'System',
      entityId: 'system-seed',
      metadata: { stage: 'v0.1C', seededAt: '2026-06-01' },
    },
  });
  console.log('AuditLog seeded:', auditLog.action);

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
