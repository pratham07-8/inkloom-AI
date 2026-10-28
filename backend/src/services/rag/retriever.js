import { dataStore } from '../dataStore.js';
import { generateEmbedding, cosineSimilarity } from './embedder.js';

/**
 * Tokenizes text into normalized words
 */
function tokenize(text) {
  return (text || '').toLowerCase().split(/\W+/).filter(w => w.length > 2);
}

/**
 * Lexical Retrieval (BM25-style term frequency with exact matching bonus)
 */
export function lexicalSearch(chunks, query, topK = 10) {
  const queryTokens = tokenize(query);
  const queryLower = query.toLowerCase();

  const scored = chunks.map(chunk => {
    const contentLower = chunk.content.toLowerCase();
    const chunkTokens = tokenize(chunk.content);

    let score = 0;
    // Frequency matching
    for (const token of queryTokens) {
      const occurrences = chunkTokens.filter(t => t === token).length;
      if (occurrences > 0) {
        score += 1 + Math.log(occurrences);
      }
    }

    // Exact query phrase boost
    if (contentLower.includes(queryLower)) {
      score += 5.0;
    }

    return {
      chunk,
      score,
      channel: 'lexical'
    };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
}

/**
 * Semantic Vector Retrieval
 */
export async function vectorSearch(chunks, query, topK = 10) {
  const { embedding: queryEmbedding } = await generateEmbedding(query);

  const scored = await Promise.all(
    chunks.map(async chunk => {
      // If chunk embedding is missing, generate on the fly
      if (!chunk.embedding) {
        const res = await generateEmbedding(chunk.content);
        chunk.embedding = res.embedding;
      }
      const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
      return {
        chunk,
        score: similarity,
        channel: 'vector'
      };
    })
  );

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
}

/**
 * Combined Dual Candidate Retrieval
 */
export async function retrieveCandidates(companyId, query, { topLexical = 10, topVector = 10 } = {}) {
  const allChunks = await dataStore.getKnowledgeChunks(companyId);

  const [lexicalResults, vectorResults] = await Promise.all([
    lexicalSearch(allChunks, query, topLexical),
    vectorSearch(allChunks, query, topVector)
  ]);

  return {
    lexicalResults,
    vectorResults,
    totalChunksAvailable: allChunks.length
  };
}
