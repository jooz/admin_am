import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        let config = await prisma.chatConfig.findFirst();
        if (!config) {
            config = await prisma.chatConfig.create({
                data: {
                    botName: "Asistente Virtual",
                    welcomeMessage: "¡Hola! Soy el asistente inteligente de la Alcaldía de Miranda. ¿En qué puedo ayudarte hoy?"
                }
            });
        }

        const response = NextResponse.json(config);
        
        // CORS Headers
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

        return response;
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, botName, welcomeMessage, enabled } = body;

        const updatedConfig = await prisma.chatConfig.update({
            where: { id },
            data: { botName, welcomeMessage, enabled }
        });

        const response = NextResponse.json(updatedConfig);
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
    }
}

export async function OPTIONS() {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
}
