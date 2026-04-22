require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
    console.log('Creando tabla NewsImage...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS NewsImage (
        id VARCHAR(191) NOT NULL,
        url TEXT NOT NULL,
        newsId VARCHAR(191) NOT NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        CONSTRAINT NewsImage_newsId_fkey FOREIGN KEY (newsId) REFERENCES News(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    console.log('Tabla creada o ya existía.');
  } catch (error) {
    console.error('Error al crear la tabla:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
