// import { pipeline, env } from '@xenova/transformers';

/*
// Configuración para compatibilidad con Vercel Serverless Functions
// Esto evita el error de libonnxruntime.so al usar el backend de WASM
env.backends.onnx.wasm.numThreads = 1;
env.allowLocalModels = false;
env.useBrowserCache = false;
env.cacheDir = '/tmp/transformers-cache';
*/

import { prisma } from './prisma';

let extractor: any = null;

async function getExtractor() {
  /*
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
  */
  return null;
}

export async function getEmbedding(text: string): Promise<number[]> {
  /*
  const extract = await getExtractor();
  const output = await extract(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
  */
  return new Array(384).fill(0); // Mock embedding
}

export async function searchSimilarChunks(query: string, limit: number = 5) {
  const embedding = await getEmbedding(query);
  const vectorStr = `[${embedding.join(',')}]`;

  // Búsqueda vectorial usando SQL raw porque Prisma no soporta búsqueda vectorial nativa aún
  const chunks = await prisma.$queryRawUnsafe(`
    SELECT id, content, source, "sourceId", (embedding <=> '${vectorStr}'::vector) as distance
    FROM "DocumentChunk"
    ORDER BY distance ASC
    LIMIT ${limit}
  `);

  return chunks as any[];
}
