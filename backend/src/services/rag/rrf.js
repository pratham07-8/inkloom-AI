/**
 * INKLOOM AI - Reciprocal Rank Fusion (RRF)
 * Standard formula: RRF(d) = Σ 1 / (k + rank_i(d))
 * k = 60 by default (standard TREC / hybrid RAG constant)
 */

export function reciprocalRankFusion({ lexicalResults = [], vectorResults = [], k = 60 }) {
  const scoreMap = new Map();

  // Process Lexical Channel
  for (const item of lexicalResults) {
    const chunkId = item.chunk.id;
    const rrfScore = 1.0 / (k + item.rank);

    if (!scoreMap.has(chunkId)) {
      scoreMap.set(chunkId, {
        chunk: item.chunk,
        rrfScore: 0,
        lexicalRank: item.rank,
        lexicalScore: item.score,
        vectorRank: null,
        vectorScore: null,
        channels: ['lexical']
      });
    }
    const entry = scoreMap.get(chunkId);
    entry.rrfScore += rrfScore;
  }

  // Process Vector Channel
  for (const item of vectorResults) {
    const chunkId = item.chunk.id;
    const rrfScore = 1.0 / (k + item.rank);

    if (!scoreMap.has(chunkId)) {
      scoreMap.set(chunkId, {
        chunk: item.chunk,
        rrfScore: 0,
        lexicalRank: null,
        lexicalScore: null,
        vectorRank: item.rank,
        vectorScore: item.score,
        channels: ['vector']
      });
    } else {
      scoreMap.get(chunkId).channels.push('vector');
    }
    const entry = scoreMap.get(chunkId);
    entry.rrfScore += rrfScore;
    entry.vectorRank = item.rank;
    entry.vectorScore = item.score;
  }

  // Convert to sorted candidate list
  const fused = Array.from(scoreMap.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .map((candidate, idx) => ({
      ...candidate,
      fusedRank: idx + 1
    }));

  return fused;
}
