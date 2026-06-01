import * as fs from 'fs';
import * as path from 'path';

// 1. Programmatic in-memory env loader
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found in workspace.');
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });

    // 2. Validate essential DB env variable securely without printing it
    if (!process.env.DATABASE_URL) {
      console.error('Error: DATABASE_URL is missing in environment configuration.');
      process.exit(1);
    }
  } catch (e: any) {
    console.error('Error: Failed to parse configuration file securely.');
    process.exit(1);
  }
}

// Execute env loading
loadEnvLocal();

// 3. Dynamic imports to ensure environment is fully loaded before Prisma client initialization
async function runVerification() {
  const { resolveTenantFromHost } = await import('../lib/tenant/resolve-tenant');
  const { getProductsByTenantId } = await import('../lib/data-access/products');
  const { prisma } = await import('../lib/prisma');

  async function testCase(hostname: string) {
    console.log(`\n----------------------------------------`);
    console.log(`Hostname: ${hostname}`);
    
    try {
      const result = await resolveTenantFromHost(hostname);
      console.log(`Status  : ${result.status}`);
      console.log(`Access  : ${result.accessMode}`);

      if (result.tenant) {
        console.log(`Tenant  : ${result.tenant.name} (${result.tenant.slug})`);
        
        // Fetch products using the tenant-scoped products helper
        const products = await getProductsByTenantId(result.tenant.id);
        console.log(`Products: ${products.length} active products`);
        
        if (products.length > 0) {
          products.forEach((p) => {
            console.log(`  - [${p.slug}] ${p.name} (Base Price: IDR ${p.basePrice})`);
          });
        }
      } else {
        console.log(`Tenant  : None (Marketing or Unresolved)`);
      }
      
      if (result.error) {
        console.log(`Message : ${result.error}`);
      }
    } catch (err: any) {
      console.error(`Error resolving hostname: ${err.message || err}`);
    }
  }

  console.log('Starting Tenant Resolver & Data Access Layer Verification...');
  
  await testCase('toyanusantara.daganta.store');
  await testCase('demostore.daganta.store');
  await testCase('unknown.daganta.store');
  await testCase('daganta.store');
  
  console.log(`\n========================================`);
  console.log('Verification completed successfully.');
  
  // Close database connection
  await prisma.$disconnect();
}

runVerification().catch((e) => {
  console.error('Failed to execute verification suite:', e.message || e);
  process.exit(1);
});
