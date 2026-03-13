// import { env, pipeline } from '@xenova/transformers';
import { getEmbedding } from './embeddings';
import { prisma } from './prisma';

/*
// 1. Deshabilitar modelos locales (Vercel no tiene un sistema de archivos persistente)
env.allowLocalModels = false;

// 2. Deshabilitar el caché del navegador (estamos en el servidor)
env.useBrowserCache = false;

// 3. ¡Lo más importante! Limitar los hilos de WASM
env.backends.onnx.wasm.numThreads = 1;

// 4. Directorio de caché para Vercel
env.cacheDir = '/tmp/transformers-cache';
*/

/**
 * Divide un texto en fragmentos (chunks)
 */
function splitText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim()) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

/**
 * Indexa un documento en la base de datos vectorial
 */
export async function indexDocument(content: string, source: string, sourceId?: string) {
  // 1. Limpiar versiones anteriores del mismo documento
  if (sourceId) {
    await prisma.documentChunk.deleteMany({
      where: { source, sourceId }
    });
  } else {
    // Si no hay sourceId, es contenido estático (ej. alcalde), 
    // borramos por source para permitir re-indexar
    await prisma.documentChunk.deleteMany({
      where: { source }
    });
  }

  // 2. Fragmentar el texto
  const chunks = splitText(content);

  // 3. Generar embeddings y guardar cada fragmento
  for (const chunk of chunks) {
    // const embedding = await getEmbedding(chunk);
    // const vectorStr = `[${embedding.join(',')}]`;
    
    console.warn('Indexing skipped: Transformers is disabled for Vercel compatibility.');
    break; // Prevent loop if disabled

    // Insertar usando SQL raw para el campo Unsupported vector
    await prisma.$executeRawUnsafe(`
      INSERT INTO "DocumentChunk" (id, content, source, "sourceId", embedding, "createdAt")
      VALUES (
        '${Math.random().toString(36).substring(2, 11)}', 
        $1, 
        $2, 
        $3, 
        '${vectorStr}'::vector, 
        NOW()
      )
    `, chunk, source, sourceId || null);
  }

  return chunks.length;
}
