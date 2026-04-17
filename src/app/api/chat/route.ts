import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchSimilarChunks } from '@/lib/embeddings';
import Groq from 'groq-sdk';

export const dynamic = 'force-dynamic';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();
        const userQuery = messages[messages.length - 1]?.content || "";

        // 1. Obtener contexto semántico del RAG (pgvector)
        const relevantChunks = await searchSimilarChunks(userQuery, 5);
        
        // 2. Obtener contexto: Base de conocimientos activa (manual)
        const knowledgeBase = await prisma.knowledgeBase.findMany({
            where: { active: true },
            select: { question: true, answer: true }
        });

        // 3. Obtener configuración del chatbot
        let config = await prisma.chatConfig.findFirst();
        if (!config) {
            config = await prisma.chatConfig.create({
                data: {
                    botName: "Asistente Virtual",
                    welcomeMessage: "¡Hola! Soy el asistente inteligente de la Alcaldía de Miranda. ¿En qué puedo ayudarte hoy?"
                }
            });
        }

        if (!config.enabled) {
            return NextResponse.json({ error: 'Chat is currently disabled' }, { status: 503 });
        }

        // Construir contexto para el LLM
        const ragContext = relevantChunks.map(c => `[Fuente: ${c.source}] ${c.content}`).join('\n---\n');
        const knowledgeContext = knowledgeBase.map(kb => `P: ${kb.question}\nR: ${kb.answer}`).join('\n\n');

        const systemPrompt = `
        Eres el ${config.botName}, el asistente oficial de la Alcaldía del Municipio Miranda (Coro, Falcón, Venezuela).
        
        Tus capacidades están ESTRICTAMENTE LIMITADAS a temas relacionados con el municipio Miranda:
        - Noticias locales y eventos de la alcaldía.
        - Trámites municipales (patentes, impuestos, gacetas, ordenanzas).
        - Servicios públicos (aseo, alumbrado, vialidad).
        - Turismo en Coro y el municipio Miranda.
        - Atención social y programas de la alcaldía.
        - Autoridades: Alcalde Dr. Henry Hernández y sus directivos.
        
        REGLAS CRÍTICAS:
        1. Si el usuario pregunta algo NO relacionado con el municipio Miranda (ej: política nacional, deportes internacionales, ciencia general, otros países/municipios), debes responder amablemente: "Lo siento, mis capacidades están limitadas a temas relacionados con el Municipio Miranda y la gestión de la Alcaldía. ¿Puedo ayudarte con algún trámite o información local?"
        2. Usa el contexto proporcionado abajo para responder. Si no sabes la respuesta basándote en el contexto, indica que pueden acudir a la sede de la alcaldía o revisar la web oficial.
        3. Sé amable, servicial y profesional.
        4. Responde en español de Venezuela de forma natural pero institucional.
        
        CONTEXTO DE INFORMACIÓN RELEVANTE (MUNICIPALIDAD):
        ${ragContext}
        
        CONTEXTO DE PREGUNTAS FRECUENTES:
        ${knowledgeContext}
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            model: 'llama-3.3-70b-versatile',
        });

        const reply = completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu solicitud.';

        const response = NextResponse.json({ reply });

        // CORS Headers (Allowing web_am)
        response.headers.set('Access-Control-Allow-Origin', '*'); 
        response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

        return response;

    } catch (error: any) {
        console.error('Groq Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function OPTIONS() {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
}
