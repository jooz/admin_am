import { prisma } from './prisma';

export async function getEmbedding(text: string): Promise<number[]> {
  const hfToken = process.env.HUGGINGFACE_API_EMBEDDING;
  
  if (!hfToken) {
    console.error("HUGGINGFACE_API_EMBEDDING is not set");
    return new Array(384).fill(0);
  }

  const model = "sentence-transformers/all-MiniLM-L6-v2";

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        headers: { 
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: text, 
          options: { wait_for_model: true } 
        }),
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HF API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Si la respuesta es un array de arrays (típico de feature-extraction), tomamos el primero
    // result suele ser number[] para una sola cadena si el pipeline está configurado así, 
    // o number[][] si permite múltiples.
    return Array.isArray(result[0]) ? result[0] : result;
    
  } catch (error) {
    console.error("Error calling Hugging Face API:", error);
    return new Array(384).fill(0); // Fallback
  }
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
