import { config } from '../../config/index.js';

/**
 * Local Cross-Encoder emulation: Computes cross-token alignment & mutual coverage
 */
function localCrossScore(query, docText) {
  const qTokens = (query || '').toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const dTokens = (docText || '').toLowerCase().split(/\W+/).filter(w => w.length > 2);

  if (qTokens.length === 0 || dTokens.length === 0) return 0.1;

  let shared = 0;
  for (const qt of qTokens) {
    if (dTokens.includes(qt)) shared += 1;
  }

  const coverage = shared / qTokens.length;
  const docRatio = Math.min(1.0, shared / Math.max(1, dTokens.length));
  return 0.7 * coverage + 0.3 * docRatio;
}

/**
 * Cross-Encoder Reranker
 */
export async function rerankCandidates(query, candidates, topK = 10) {
  if (!candidates || candidates.length === 0) {
    return {
      reranked: [],
      status: 'EMPTY_INPUT',
      model: config.huggingface.rerankerModel
    };
  }

  const apiKey = config.huggingface.apiKey;
  const model = config.huggingface.rerankerModel;

  if (!apiKey) {
    // Local cross-token relevance reranking
    const scored = candidates.map(c => {
      const score = localCrossScore(query, c.chunk.content);
      return {
        ...c,
        rerankScore: score
      };
    });

    const sorted = scored.sort((a, b) => b.rerankScore - a.rerankScore).slice(0, topK);
    return {
      reranked: sorted,
      status: 'LOCAL_CROSS_TOKEN_RERANK',
      model: `${model} (local alignment estimator)`
    };
  }

  try {
    // Call HF Cross-Encoder
    const inputs = candidates.map(c => ({
      text: query,
      text_pair: c.chunk.content
    }));

    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs, options: { wait_for_model: true } })
    });

    if (!res.ok) {
      throw new Error(`HF Reranker error: ${res.statusText}`);
    }

    const scores = await res.json();
    const scored = candidates.map((c, idx) => ({
      ...c,
      rerankScore: typeof scores[idx] === 'number' ? scores[idx] : scores[idx]?.score || 0
    }));

    const sorted = scored.sort((a, b) => b.rerankScore - a.rerankScore).slice(0, topK);
    return {
      reranked: sorted,
      status: 'LIVE_HF_CROSS_ENCODER',
      model
    };
  } catch (err) {
    const scored = candidates.map(c => ({
      ...c,
      rerankScore: localCrossScore(query, c.chunk.content)
    }));
    const sorted = scored.sort((a, b) => b.rerankScore - a.rerankScore).slice(0, topK);
    return {
      reranked: sorted,
      status: 'FALLBACK_ON_ERROR',
      model: `${model} (fallback: ${err.message})`
    };
  }
}
