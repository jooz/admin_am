import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
// import { indexDocument } from '@/lib/indexDocument';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const title = formData.get('title') as string;
        const slug = formData.get('slug') as string;
        const content = formData.get('content') as string;
        const excerpt = formData.get('excerpt') as string;
        const published = formData.get('published') === 'true';
        const category = formData.get('category') as string;
        const imageFile = formData.get('image');

        if (!title || !slug || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let finalImageUrl = "";

        // Si se subió un archivo (File) lo enviamos a Vercel Blob
        if (imageFile && typeof imageFile !== 'string') {
            const file = imageFile as File;

            // Generamos un nombre limpio para el archivo
            const timestamp = Date.now();
            const filename = `${timestamp}-${file.name.replace(/\s+/g, '_')}`;

            // Subida a Vercel Blob
            const blob = await put(filename, file, {
                access: 'public',
                // El token se toma automáticamente de la variable BLOB_READ_WRITE_TOKEN
            });

            finalImageUrl = blob.url;

        } else if (typeof imageFile === 'string') {
            // Si es una URL provista directamente en el campo de texto
            finalImageUrl = imageFile;
        }

        const news = await prisma.news.create({
            data: {
                title,
                slug,
                content,
                excerpt,
                published,
                category,
                image: finalImageUrl,
            }
        });

        /* 
        // Indexar en el RAG si está publicada
        if (published) {
            const contentLine = `Noticia: ${title}. Contenido: ${content}`;
            // No esperamos a que termine para no bloquear la respuesta
            indexDocument(contentLine, 'noticia', news.id).catch(err => 
                console.error('Error indexing news:', err)
            );
        }
        */

        return NextResponse.json(news, { status: 201 });
    } catch (error: any) {
        console.error('Error creating news:', error);

        if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
            return NextResponse.json({
                error: 'Ya existe una noticia con ese slug o título similar. Por favor modifique el título.'
            }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const published = searchParams.get('published');
        const slug = searchParams.get('slug');

        const where: any = {};

        if (category) {
            where.category = category;
        }

        if (published !== null) {
            where.published = published === 'true';
        }

        if (slug) {
            where.slug = slug;
        }

        const news = await prisma.news.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(news);
    } catch (error: any) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}