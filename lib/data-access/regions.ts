import { prisma } from '@/lib/prisma';

export async function getProvinces() {
  return prisma.province.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getRegencies(provinceId: string) {
  if (!provinceId) {
    return [];
  }

  return prisma.regency.findMany({
    where: {
      provinceId,
    },
    select: {
      id: true,
      name: true,
      type: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getDistricts(regencyId: string) {
  if (!regencyId) {
    return [];
  }

  return prisma.district.findMany({
    where: {
      regencyId,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}
