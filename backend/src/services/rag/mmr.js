import { cosineSimilarity } from './embedder.js';

/**
 * Maximal Marginal Relevance (MMR)
 * Selects evidence balancing relevance to query and diversity from already chosen chunks
 * MMR = λ × relevance − (1 − λ) × max(similarity(candidate, selected))
 */
export function maximalMarginalRelevance({
  candidates = [],
  lambda = 0.65,
  targetCount = 4
}) {
  if (!candidates || candidates.length === 0) return [];
  if (candidates.length <= targetCount) return candidates;

  const selected = [];
  const remaining = [...candidates];

  // 1. Pick the candidate with the highest initial relevance score
  const first = remaining.shift();
  selected.push({
    ...first,
    mmrScore: first.rerankScore || first.rrfScore || 1.0,
    selectionOrder: 1
  });

  // 2. Iteratively select remaining candidates maximizing MMR objective
  while (selected.length < targetCount && remaining.length > 0) {
    let bestIdx = -1;
    let bestMmrScore = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const relScore = candidate.rerankScore ?? candidate.rrfScore ?? 0.5;

      // Calculate maximum similarity to any currently selected chunk
      let maxSimToSelected = 0;
      for (const sel of selected) {
        let sim = 0;
        if (candidate.chunk.embedding && sel.chunk.embedding) {
          sim = cosineSimilarity(candidate.chunk.embedding, sel.chunk.embedding);
        } else {
          // Token Jaccard overlap fallback if embeddings are unavailable
          const cWords = new Set((candidate.chunk.content || '').toLowerCase().split(/\W+/));
          const sWords = new Set((sel.chunk.content || '').toLowerCase().split(/\W+/));
          let intersection = 0;
          for (const w of cWords) {
            if (sWords.has(w)) intersection++;
          }
          const union = cWords.size + sWords.size - intersection;
          sim = union > 0 ? intersection / union : 0;
        }

        if (sim > maxSimToSelected) {
          maxSimToSelected = sim;
        }
      }

      const mmr = lambda * relScore - (1.0 - lambda) * maxSimToSelected;

      if (mmr > bestMmrScore) {
        bestMmrScore = mmr;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0) {
      const chosen = remaining.splice(bestIdx, 1)[0];
      selected.push({
        ...chosen,
        mmrScore: bestMmrScore,
        selectionOrder: selected.length + 1
      });
    } else {
      break;
    }
  }

  return selected;
}
