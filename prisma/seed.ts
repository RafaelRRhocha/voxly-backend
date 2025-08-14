import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEntity = await prisma.entity.create({
    data: {
      name: 'Admin',
    },
  });

  const ADMIN_PASSWORD = process.env.JWT_SECRET || 'admin123';
  const adminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrator',
      email: 'admin@voxly.com',
      password_hash: adminPassword,
      entity_id: adminEntity.id,
      role: UserRole.admin,
    },
  });

  console.log('Entity and user created:', {
    entity: adminEntity,
    user: { ...adminUser, password_hash: '[HIDDEN]' },
  });

  const demoEntity = await prisma.entity.create({
    data: {
      name: 'Demo Account',
    },
  });

  const demoPassword = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@voxly.com',
      password_hash: demoPassword,
      entity_id: demoEntity.id,
      role: UserRole.manager,
    },
  });

  console.log('Demo entity and user created:', {
    entity: demoEntity,
    user: { ...demoUser, password_hash: '[HIDDEN]' },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 