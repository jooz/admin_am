import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const prismaClientSingleton = () => {
    const adapter = new PrismaMariaDb({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.USUARIO,
        password: process.env.CLAVE,
        database: process.env.DATABASE,
        port: Number(process.env.DATABASE_PORT) || 3306,
        connectionLimit: 5,
    })
    return new PrismaClient({ adapter })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
