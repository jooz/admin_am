import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for user update validation
const UserUpdateSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    role: z.enum(['ADMIN', 'OPERATOR', 'CITIZEN']).optional(),
    active: z.boolean().optional(),
});

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                createdAt: true,
            }
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: user
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch user'
        }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const validatedData = UserUpdateSchema.parse(body);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }

        // Check if email is being updated and already exists for another user
        if (validatedData.email && validatedData.email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email: validatedData.email }
            });

            if (emailExists) {
                return NextResponse.json({
                    success: false,
                    message: 'Email already exists'
                }, { status: 400 });
            }
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data: validatedData,
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
            data: updatedUser,
            message: 'User updated successfully'
        }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                message: 'Validation error',
                errors: error.issues
            }, { status: 400 });
        }

        console.error('Error updating user:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update user'
        }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }

        // Delete user
        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        }, { status: 200 });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete user'
        }, { status: 500 });
    }
}