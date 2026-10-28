import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { reciprocalRankFusion } from '../services/rag/rrf.js';
import { maximalMarginalRelevance } from '../services/rag/mmr.js';

describe('RAG Pipeline Algorithms', () => {
  it('should correctly fuse dual-channel rankings with RRF formula', () => {
    const chunkA = { id: 'chunk-1', content: 'SLA policy document' };
    const chunkB = { id: 'chunk-2', content: 'Latency benchmarks' };
    const chunkC = { id: 'chunk-3', content: 'General information' };

    const lexicalResults = [
      { chunk: chunkA, rank: 1, score: 5.0 },
      { chunk: chunkB, rank: 2, score: 3.0 }
    ];

    const vectorResults = [
      { chunk: chunkB, rank: 1, score: 0.95 },
      { chunk: chunkC, rank: 2, score: 0.80 }
    ];

    const fused = reciprocalRankFusion({ lexicalResults, vectorResults, k: 60 });

    assert.equal(fused.length, 3, 'Should combine unique chunks from both channels');

    // chunkB appears in both channels: 1/(60+2) + 1/(60+1) ≈ 0.0161 + 0.01639 = 0.0325
    // chunkA appears only in lexical: 1/(60+1) ≈ 0.01639
    // chunkB should be ranked first because it has cross-channel support!
    assert.equal(fused[0].chunk.id, 'chunk-2', 'Cross-channel supported chunk should be rank #1');
    assert.ok(fused[0].channels.includes('lexical') && fused[0].channels.includes('vector'));
  });

  it('should diversify candidates using Maximal Marginal Relevance (MMR)', () => {
    const candidate1 = {
      chunk: { id: 'c1', content: 'Aetheris Neural Mesh enterprise SLA 99.99%' },
      rerankScore: 0.95,
      rrfScore: 0.03
    };
    // candidate2 is nearly identical to candidate1
    const candidate2 = {
      chunk: { id: 'c2', content: 'Aetheris Neural Mesh enterprise SLA 99.99% commitment' },
      rerankScore: 0.94,
      rrfScore: 0.029
    };
    // candidate3 is on a different relevant topic (Robotics safety)
    const candidate3 = {
      chunk: { id: 'c3', content: 'Robotics safety standards ISO 3691-4 certification' },
      rerankScore: 0.85,
      rrfScore: 0.025
    };

    const selected = maximalMarginalRelevance({
      candidates: [candidate1, candidate2, candidate3],
      lambda: 0.65,
      targetCount: 2
    });

    assert.equal(selected.length, 2);
    assert.equal(selected[0].chunk.id, 'c1', 'First selected should have highest relevance score');
    // MMR should choose candidate3 over the redundant candidate2
    assert.equal(selected[1].chunk.id, 'c3', 'Second selected should be diverse candidate3 rather than duplicate c2');
  });
});
