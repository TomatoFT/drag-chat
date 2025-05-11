// In-memory store for demo purposes
// In a real application, you would use Upstash Vector
const memoryStore: { id: string; content: string; embedding: number[] }[] = []
let counter = 0

// Simple embedding function (in a real app, you'd use OpenAI or another embedding model)
function simpleEmbedding(text: string): number[] {
  // This is a very simplistic embedding for demo purposes
  // It just counts character frequencies and normalizes
  const charFreq = new Array(26).fill(0)
  const lowerText = text.toLowerCase()

  for (let i = 0; i < lowerText.length; i++) {
    const code = lowerText.charCodeAt(i) - 97 // 'a' is 97
    if (code >= 0 && code < 26) {
      charFreq[code]++
    }
  }

  // Normalize
  const sum = charFreq.reduce((a, b) => a + b, 0)
  return sum > 0 ? charFreq.map((f) => f / sum) : charFreq
}

// Simple cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  return normA && normB ? dotProduct / (normA * normB) : 0
}

// Add a resource to the vector store
export async function addResource(content: string): Promise<void> {
  // In a real application, you would use:
  // const index = new Index({
  //   url: process.env.UPSTASH_VECTOR_REST_URL!,
  //   token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  // });

  // Split content into sentences for better retrieval
  const sentences = content.split(/[.!?]/).filter((s) => s.trim().length > 0)

  for (const sentence of sentences) {
    const id = `resource-${counter++}`
    const embedding = simpleEmbedding(sentence)

    memoryStore.push({
      id,
      content: sentence.trim(),
      embedding,
    })

    // With Upstash Vector, you would do:
    // await index.upsert({
    //   id,
    //   vector: embedding,
    //   metadata: {
    //     content: sentence.trim()
    //   }
    // });
  }
}

// Query the vector store for relevant content
export async function queryResource(query: string): Promise<string[]> {
  // In a real application, you would use:
  // const index = new Index({
  //   url: process.env.UPSTASH_VECTOR_REST_URL!,
  //   token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  // });

  const queryEmbedding = simpleEmbedding(query)

  // Find the most similar items
  const results = memoryStore
    .map((item) => ({
      content: item.content,
      similarity: cosineSimilarity(queryEmbedding, item.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .filter((item) => item.similarity > 0.5) // Only return reasonably similar items
    .slice(0, 5) // Get top 5 results
    .map((item) => item.content)

  // With Upstash Vector, you would do:
  // const results = await index.query({
  //   vector: queryEmbedding,
  //   topK: 5,
  //   includeMetadata: true
  // });
  // return results.map(r => r.metadata.content);

  return results
}
