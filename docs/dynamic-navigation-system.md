# Sistema de Navegación Dinámica

Este documento describe el sistema de navegación dinámica implementado en la aplicación administrativa, donde las opciones del menú son almacenadas en la base de datos y filtradas según los permisos específicos de cada usuario.

## Estructura de la Base de Datos

### Modelos Principales

#### User (Actualizado)
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  password      String?
  role          UserRole  @default(ADMIN)
  active        Boolean   @default(true)  // Nuevo campo
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  reports       Report[]
  socialRequests SocialAssistance[]
  menuPermissions UserMenuPermission[]  // Nueva relación
}
```

#### MenuItem (Nuevo)
```prisma
model MenuItem {
  id          String        @id @default(cuid())
  label       String        // Texto visible del menú
  icon        String?       // Icono opcional
  path        String        // Ruta/URL del enlace
  order       Int           @default(0)  // Orden de visualización
  active      Boolean       @default(true)  // Estado del menú
  
  // Relación de auto-referencia para submenús
  parentId    String?
  parent      MenuItem?     @relation("MenuItemParent", fields: [parentId], references: [id], onDelete: Cascade)
  children    MenuItem[]    @relation("MenuItemParent")
  
  // Relación con permisos de usuario
  userPermissions UserMenuPermission[]
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}
```

#### UserMenuPermission (Nuevo)
```prisma
model UserMenuPermission {
  id          String        @id @default(cuid())
  userId      String
  menuId      String
  canRead     Boolean       @default(true)
  canWrite    Boolean       @default(false)
  canDelete   Boolean       @default(false)
  
  // Relaciones
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  menuItem    MenuItem      @relation(fields: [menuId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  // Índice único para evitar duplicados
  @@unique([userId, menuId])
}
```

## Características del Sistema

### 1. Menús Jerárquicos
- Soporta menús anidados mediante la relación `parent/children`
- Los submenús heredan el orden y pueden tener diferentes permisos
- Eliminación en cascada: al eliminar un menú padre, se eliminan sus hijos

### 2. Permisos Granulares
- **canRead**: Permite ver el menú
- **canWrite**: Permite editar/crear contenido relacionado
- **canDelete**: Permite eliminar contenido relacionado
- Cada usuario puede tener diferentes permisos para cada menú

### 3. Escalabilidad
- El sistema está diseñado para futuras expansiones
- Fácil de agregar nuevos tipos de permisos
- Compatible con agrupación por roles en el futuro

## Uso del Sistema

### Crear un Nuevo Menú
```typescript
import { prisma } from '@/lib/prisma';

// Crear menú principal
const dashboardMenu = await prisma.menuItem.create({
  data: {
    label: 'Dashboard',
    icon: 'Dashboard',
    path: '/inicio',
    order: 1,
    active: true,
  },
});

// Crear submenú
const reportsMenu = await prisma.menuItem.create({
  data: {
    label: 'Reportes',
    icon: 'Report',
    path: '/inicio/reports',
    order: 1,
    parentId: dashboardMenu.id,
    active: true,
  },
});
```

### Asignar Permisos a Usuarios
```typescript
// Asignar permisos a un usuario específico
await prisma.userMenuPermission.create({
  data: {
    userId: 'user-id',
    menuId: 'menu-id',
    canRead: true,
    canWrite: true,
    canDelete: false,
  },
});

// Asignar múltiples permisos
await prisma.userMenuPermission.createMany({
  data: [
    {
      userId: 'user-id',
      menuId: 'menu1-id',
      canRead: true,
      canWrite: false,
      canDelete: false,
    },
    {
      userId: 'user-id',
      menuId: 'menu2-id',
      canRead: true,
      canWrite: true,
      canDelete: false,
    },
  ],
});
```

### Obtener Menús para un Usuario
```typescript
// Obtener menús activos con permisos para un usuario
const userMenus = await prisma.menuItem.findMany({
  where: {
    active: true,
    userPermissions: {
      some: {
        userId: 'user-id',
        canRead: true,
      },
    },
  },
  include: {
    parent: true,
    children: {
      where: {
        active: true,
        userPermissions: {
          some: {
            userId: 'user-id',
            canRead: true,
          },
        },
      },
    },
  },
  orderBy: {
    order: 'asc',
  },
});
```

### Verificar Permisos de un Usuario
```typescript
// Verificar si un usuario tiene permisos para un menú específico
const hasPermission = await prisma.userMenuPermission.findFirst({
  where: {
    userId: 'user-id',
    menuId: 'menu-id',
    canRead: true,
  },
});

// Verificar permisos específicos
const permissions = await prisma.userMenuPermission.findFirst({
  where: {
    userId: 'user-id',
    menuId: 'menu-id',
  },
});

if (permissions?.canWrite) {
  // Mostrar botón de edición
}
```

## Ejemplos de Implementación

### Componente de Menú en React
```typescript
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  order: number;
  parentId: string | null;
  children: MenuItem[];
}

export function DynamicMenu() {
  const { data: session } = useSession();
  const [menus, setMenus] = useState<MenuItem[]>([]);

  useEffect(() => {
    async function fetchUserMenus() {
      if (session?.user?.id) {
        const response = await fetch(`/api/user-menus/${session.user.id}`);
        const userMenus = await response.json();
        setMenus(userMenus);
      }
    }
    
    fetchUserMenus();
  }, [session]);

  return (
    <nav>
      {menus.map(menu => (
        <div key={menu.id}>
          <a href={menu.path}>
            {menu.icon && <span>{menu.icon}</span>}
            {menu.label}
          </a>
          {menu.children.length > 0 && (
            <ul>
              {menu.children.map(child => (
                <li key={child.id}>
                  <a href={child.path}>{child.label}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
}
```

### API Route para Obtener Menús
```typescript
// src/app/api/user-menus/[userId]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userMenus = await prisma.menuItem.findMany({
      where: {
        active: true,
        userPermissions: {
          some: {
            userId: params.userId,
            canRead: true,
          },
        },
      },
      include: {
        parent: true,
        children: {
          where: {
            active: true,
            userPermissions: {
              some: {
                userId: params.userId,
                canRead: true,
              },
            },
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Filtrar menús principales (sin padre)
    const mainMenus = userMenus.filter(menu => !menu.parentId);

    return NextResponse.json(mainMenus);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener menús' },
      { status: 500 }
    );
  }
}
```

## Comandos Útiles

### Generar Client de Prisma
```bash
npx prisma generate
```

### Validar Esquema
```bash
npx prisma validate
```

### Ejecutar Seed de Menús
```bash
npx tsx prisma/seed-menu.ts
```

## Mejores Prácticas

1. **Caching**: Implementar caché para los menús de usuario para mejorar el rendimiento
2. **Validación**: Siempre validar permisos en el backend, no solo en el frontend
3. **Ordenamiento**: Mantener un orden lógico en los menús para mejor UX
4. **Activación/Desactivación**: Usar el campo `active` para ocultar menús temporalmente sin eliminarlos
5. **Seguridad**: No exponer IDs de menús sensibles en el frontend

## Futuras Expansiones

- **Permisos por Rol**: Sistema de permisos basado en roles en lugar de usuarios individuales
- **Menús por Departamento**: Filtrar menús según el departamento del usuario
- **Internacionalización**: Soporte para múltiples idiomas en las etiquetas de menú
- **Auditoría**: Registro de cambios en permisos y menús