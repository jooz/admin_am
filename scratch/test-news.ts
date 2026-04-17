import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import 'dotenv/config'

const prismaClientSingleton = () => {
    const adapter = new PrismaMariaDb({
        host: process.env.DATABASE_HOST || process.env.HOST || 'localhost',
        user: process.env.USUARIO,
        password: process.env.CLAVE,
        database: process.env.DATABASE,
        port: Number(process.env.DATABASE_PORT) || 3306,
        connectionLimit: 5,
    })
    
    return new PrismaClient({ 
        adapter,
        log: ['query', 'error', 'warn']
    })
}

const prisma = prismaClientSingleton()

async function main() {
  console.log('Testing news creation...')
  try {
    const news = await prisma.news.create({
      data: {
        title: 'Prueba de noticia de Antigravity',
        slug: 'prueba-noticia-antigravity-' + Date.now(),
        content: 'Este es un contenido de prueba para verificar la conexión con MySQL en cPanel.',
        published: true,
        category: 'Test'
      }
    })
    console.log('Success!', news)
  } catch (error) {
    console.error('Error during creation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
