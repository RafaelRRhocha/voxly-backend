import prisma from '../lib/prisma';

export async function getEntityById(id: number) {
  return prisma.entity.findUnique({
    where: { 
      id,
      deleted_at: null
    }
  });
}

export async function validateEntityExists(entityId: number): Promise<boolean> {
  const entity = await getEntityById(entityId);
  return !!entity;
} 