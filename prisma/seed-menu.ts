import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMenu() {
    try {
        // Primero, crear los elementos del menú
        const menuItems = await prisma.$transaction([
            // Menú principal
            prisma.menuItem.create({
                data: {
                    label: 'Dashboard',
                    icon: 'Dashboard',
                    path: '/inicio',
                    order: 1,
                    active: true,
                },
            }),
            prisma.menuItem.create({
                data: {
                    label: 'Gestión de Usuarios',
                    icon: 'People',
                    path: '/inicio/users',
                    order: 2,
                    active: true,
                },
            }),
            prisma.menuItem.create({
                data: {
                    label: 'Reportes',
                    icon: 'Report',
                    path: '/inicio/reports',
                    order: 3,
                    active: true,
                },
            }),
            prisma.menuItem.create({
                data: {
                    label: 'Atención Social',
                    icon: 'Handshake',
                    path: '/inicio/social',
                    order: 4,
                    active: true,
                },
            }),
            // Submenú bajo Reportes
            prisma.menuItem.create({
                data: {
                    label: 'Reportes Pendientes',
                    icon: 'Pending',
                    path: '/inicio/reports/pending',
                    order: 1,
                    parentId: '', // Se llenará después
                    active: true,
                },
            }),
            prisma.menuItem.create({
                data: {
                    label: 'Reportes Completados',
                    icon: 'CheckCircle',
                    path: '/inicio/reports/completed',
                    order: 2,
                    parentId: '', // Se llenará después
                    active: true,
                },
            }),
        ]);

        // Actualizar los submenús con el ID del menú padre "Reportes"
        const reportsMenuItem = menuItems[2]; // El menú "Reportes" es el tercero en el array

        await prisma.$transaction([
            prisma.menuItem.update({
                where: { id: menuItems[4].id },
                data: { parentId: reportsMenuItem.id },
            }),
            prisma.menuItem.update({
                where: { id: menuItems[5].id },
                data: { parentId: reportsMenuItem.id },
            }),
        ]);

        console.log('Menú creado exitosamente');

        // Asignar permisos a usuarios (ejemplo)
        const users = await prisma.user.findMany();

        for (const user of users) {
            // Asignar todos los permisos básicos a todos los usuarios
            await prisma.userMenuPermission.createMany({
                data: menuItems.map(item => ({
                    userId: user.id,
                    menuId: item.id,
                    canRead: true,
                    canWrite: user.role === 'ADMIN' || user.role === 'OPERATOR',
                    canDelete: user.role === 'ADMIN',
                })),
            });
        }

        console.log('Permisos de menú asignados a usuarios');

    } catch (error) {
        console.error('Error al crear el menú:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedMenu();
