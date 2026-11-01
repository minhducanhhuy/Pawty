import { seedDatabase } from '../src/data/seed-db';

seedDatabase().catch((error) => {
  console.error('[Prisma Seed Error]:', error);
  process.exit(1);
});

