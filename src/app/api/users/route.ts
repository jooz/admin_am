import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for user creation/update validation
const UserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    role: z.enum(['ADMIN', 'OPERATOR', 'CITIZEN'], {
        errorMap: () => ({ message: 'Invalid role' })
    }),
    active: z.boolean().default(true),
});

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                createdAt: true,
            }
        });

        return NextResponse.json({
            success: true,
            data: users
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch users'
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = UserSchema.parse(body);

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (existingUser) {
            return NextResponse.json({
                success: false,
                message: 'Email already exists'
            }, { status: 400 });
        }

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                role: validatedData.role,
                active: validatedData.active,
                password: 'default123' // Default password for new users
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                createdAt: true,
            }
        });

        return NextResponse.json({
            success: true,
            data: newUser,
            message: 'User created successfully'
        }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                message: 'Validation error',
                errors: error.issues
            }, { status: 400 });
        }

        console.error('Error creating user:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to create user'
        }, { status: 500 });
    }
}