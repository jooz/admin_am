import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

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

        // Indexar en el RAG si está publicada
        // if (published) {
        //     const contentLine = `Noticia: ${title}. Contenido: ${content}`;
        //     indexDocument(contentLine, 'noticia', news.id).catch(err => 
        //         console.error('Error indexing news:', err)
        //     );
        // }

        return NextResponse.json(news, { status: 201 });
    } catch (error: any) {
        console.error('SERVER_ERROR [NEWS_POST]:', error);

        // Error de duplicado (Slug)
        if (error.code === 'P2002') {
            const target = error.meta?.target || '';
            if (typeof target === 'string' && target.includes('slug')) {
                return NextResponse.json({
                    error: 'Ya existe una noticia con ese slug o título similar. Por favor modifique el título.'
                }, { status: 409 });
            }
        }

        // Otros errores de Prisma
        if (error.code) {
            return NextResponse.json({ error: `Database error (${error.code}): ${error.message}` }, { status: 500 });
        }

        return NextResponse.json({ error: error.message || 'Failed to create news' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const published = searchParams.get('published');
        const slug = searchParams.get('slug');
        const search = searchParams.get('search');
        const date = searchParams.get('date');

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

        if (search || date) {
            where.AND = [];
            
            if (search) {
                where.AND.push({
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { content: { contains: search, mode: 'insensitive' } },
                        { excerpt: { contains: search, mode: 'insensitive' } },
                    ]
                });
            }

            if (date) {
                const startDate = new Date(date);
                const endDate = new Date(date);
                endDate.setDate(endDate.getDate() + 1);
                
                where.AND.push({
                    createdAt: {
                        gte: startDate,
                        lt: endDate
                    }
                });
            }
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

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

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

        const existingNews = await prisma.news.findUnique({
            where: { id }
        });

        if (!existingNews) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        let finalImageUrl = existingNews.image;

        if (imageFile && typeof imageFile !== 'string') {
            const file = imageFile as File;
            const timestamp = Date.now();
            const filename = `${timestamp}-${file.name.replace(/\s+/g, '_')}`;

            const blob = await put(filename, file, {
                access: 'public',
            });

            finalImageUrl = blob.url;
        } else if (typeof imageFile === 'string') {
            finalImageUrl = imageFile;
        }

        const news = await prisma.news.update({
            where: { id },
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

        // if (published) {
        //     const contentLine = `Noticia: ${title}. Contenido: ${content}`;
        //     indexDocument(contentLine, 'noticia', news.id).catch(err => 
        //         console.error('Error indexing news:', err)
        //     );
        // }

        return NextResponse.json(news);
    } catch (error: any) {
        console.error('Error updating news:', error);

        if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
            return NextResponse.json({
                error: 'Ya existe una noticia con ese slug o título similar. Por favor modifique el título.'
            }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const existingNews = await prisma.news.findUnique({
            where: { id }
        });

        if (!existingNews) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        await prisma.news.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'News deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting news:', error);
        return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
    }
}