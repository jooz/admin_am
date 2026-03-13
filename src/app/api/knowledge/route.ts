import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";

export async function GET() {
    try {
        const knowledge = await prisma.knowledgeBase.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(knowledge);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch knowledge' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { question, answer, category, tags, active } = body;

        const newEntry = await prisma.knowledgeBase.create({
            data: {
                question,
                answer,
                category,
                tags,
                active: active ?? true
            }
        });

        return NextResponse.json(newEntry, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create knowledge entry' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, question, answer, category, tags, active } = body;

        const updatedEntry = await prisma.knowledgeBase.update({
            where: { id },
            data: { question, answer, category, tags, active }
        });

        return NextResponse.json(updatedEntry);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update knowledge entry' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await prisma.knowledgeBase.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete knowledge entry' }, { status: 500 });
    }
}
