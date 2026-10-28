import { config } from '../../config/index.js';

const DIMENSION = 384;

/**
 * Deterministic local dense vector projection fallback
 * Used when Hugging Face API key is not configured or in offline mode
 */
function localDenseEmbed(text) {
  const vec = new Float64Array(DIMENSION).fill(0);
  if (!text) return Array.from(vec);

  const clean = text.toLowerCase();
  const tokens = clean.split(/\W+/).filter(Boolean);

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = ((hash << 5) - hash + word.charCodeAt(c)) | 0;
    }
    const idx = Math.abs(hash) % DIMENSION;
    vec[idx] += 1.0;

    // Sub-word n-grams for semantic robustness
    if (word.length >= 4) {
      for (let j = 0; j < word.length - 2; j++) {
        const sub = word.slice(j, j + 3);
        let subHash = 0;
        for (let sc = 0; sc < sub.length; sc++) {
          subHash = ((subHash << 5) - subHash + sub.charCodeAt(sc)) | 0;
        }
        const subIdx = Math.abs(subHash) % DIMENSION;
        vec[subIdx] += 0.4;
      }
    }
  }

  // L2 Normalize
  let norm = 0;
  for (let i = 0; i < DIMENSION; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < DIMENSION; i++) {
      vec[i] /= norm;
    }
  }

  return Array.from(vec);
}

/**
 * Generate 384-dimensional dense vector embeddings
 */
export async function generateEmbedding(text) {
  const apiKey = config.huggingface.apiKey;
  const model = config.huggingface.embeddingModel;

  if (!apiKey) {
    return {
      embedding: localDenseEmbed(text),
      dimension: DIMENSION,
      status: 'LOCAL_FALLBACK',
      model: `${model} (deterministic local fallback)`
    };
  }

  try {
    const res = await fetch(`https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: text, options: { wait_for_model: true } })
    });

    if (!res.ok) {
      throw new Error(`HF API error: ${res.statusText}`);
    }

    const data = await res.json();
    // Some models return 2D array [1, 384], flatten if necessary
    const flat = Array.isArray(data[0]) ? data[0] : data;

    return {
      embedding: flat,
      dimension: flat.length,
      status: 'LIVE_HF',
      model
    };
  } catch (err) {
    return {
      embedding: localDenseEmbed(text),
      dimension: DIMENSION,
      status: 'LOCAL_FALLBACK_ON_ERROR',
      model: `${model} (fallback on error: ${err.message})`
    };
  }
}

export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
