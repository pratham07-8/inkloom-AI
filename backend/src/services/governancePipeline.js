import { dataStore } from './dataStore.js';
import { extractContent } from './extractor.js';
import { evaluateRules } from './rulesEngine.js';
import { retrieveCandidates } from './rag/retriever.js';
import { reciprocalRankFusion } from './rag/rrf.js';
import { rerankCandidates } from './rag/reranker.js';
import { maximalMarginalRelevance } from './rag/mmr.js';
import { calculateJevScore } from './jevEngine.js';
import { verifyClaims } from './claimVerifier.js';
import { generateLlmExplanation } from './llmExplainer.js';

export async function runGovernancePipeline({
  companyId,
  userId,
  title,
  contentType,
  textContent = '',
  fileBuffer = null,
  sourceType = 'human'
}) {
  // 1. Content Extraction
  const extractionResult = await extractContent({
    contentType,
    textContent,
    fileBuffer
  });

  if (!extractionResult.success && extractionResult.error) {
    throw new Error(extractionResult.error);
  }

  const normalizedText = extractionResult.text;

  // 2. Load Active Brand Guideline
  const activeGuideline = await dataStore.getActiveGuideline(companyId);
  if (!activeGuideline) {
    throw new Error('No active brand guideline found for this company.');
  }
  const guidelineConfig = activeGuideline.configuration || {};

  // 3. Deterministic Rules Evaluation
  const ruleFindings = evaluateRules({
    title,
    textContent: normalizedText,
    guidelineConfig
  });

  // 4. Hybrid RAG Pipeline: Query Construction -> Retrieval -> RRF -> Reranker -> MMR
  const ragQuery = `${title} ${normalizedText.slice(0, 300)}`;

  // A. Dual retrieval
  const { lexicalResults, vectorResults, totalChunksAvailable } = await retrieveCandidates(
    companyId,
    ragQuery,
    { topLexical: 10, topVector: 10 }
  );

  // B. Reciprocal Rank Fusion (RRF)
  const fusedCandidates = reciprocalRankFusion({
    lexicalResults,
    vectorResults,
    k: 60
  });

  // C. Cross-Encoder Reranking
  const { reranked: rerankedCandidates, status: rerankerStatus, model: rerankerModel } = await rerankCandidates(
    ragQuery,
    fusedCandidates.slice(0, 10),
    8
  );

  // D. Maximal Marginal Relevance (MMR)
  const selectedEvidence = maximalMarginalRelevance({
    candidates: rerankedCandidates,
    lambda: 0.65,
    targetCount: 4
  });

  // 5. Claim Verification
  const claimResult = await verifyClaims({
    textContent: normalizedText,
    evidenceChunks: selectedEvidence
  });

  // 6. Jev Decision-Support & Risk Scoring
  const jevResult = calculateJevScore({
    findings: ruleFindings,
    guidelineConfig,
    claimVerificationResult: claimResult
  });

  // 7. LLM Explanations & Suggestions
  const llmResult = await generateLlmExplanation({
    title,
    textContent: normalizedText,
    findings: ruleFindings,
    evidenceChunks: selectedEvidence
  });

  // 8. Prepare Metadata
  const retrievalMetadata = {
    retrievalChannel: 'hybrid',
    totalCompanyChunks: totalChunksAvailable,
    candidatesLexicalCount: lexicalResults.length,
    candidatesVectorCount: vectorResults.length,
    fusedRRFCount: fusedCandidates.length,
    rerankerStatus,
    rerankerModel,
    mmrLambda: 0.65,
    selectedEvidenceChunks: selectedEvidence.map(e => ({
      id: e.chunk.id,
      documentId: e.chunk.document_id,
      docTitle: e.chunk.metadata?.docTitle || 'Reference Document',
      section: e.chunk.metadata?.section || 'General',
      pageNumber: e.chunk.page_number || 1,
      snippet: e.chunk.content.slice(0, 180) + '...',
      mmrScore: e.mmrScore,
      fusedRank: e.fusedRank,
      channels: e.channels
    }))
  };

  const modelMetadata = {
    claimVerification: claimResult,
    llm: llmResult,
    jev: {
      explanation: jevResult.explanation,
      severityBreakdown: jevResult.severityBreakdown,
      confidence: jevResult.confidence,
      routing: jevResult.routing,
      routingReason: jevResult.routingReason
    },
    extraction: {
      source_kind: extractionResult.source_kind,
      confidence: extractionResult.confidence || 1.0,
      pageReferences: extractionResult.pageReferences || null
    }
  };

  // 9. Persist Submission & Revision & Analysis Run
  const { submission, revision } = await dataStore.createSubmission(companyId, {
    submittedBy: userId,
    title,
    contentType,
    sourceType,
    textContent: normalizedText,
    storagePath: null
  });

  const analysisRun = await dataStore.recordAnalysisRun(companyId, {
    submissionId: submission.id,
    revisionId: revision.id,
    riskScore: jevResult.riskScore,
    riskLevel: jevResult.riskLevel,
    findings: ruleFindings,
    retrievalMetadata,
    modelMetadata,
    recommendedStatus: jevResult.recommendedStatus
  });

  return {
    submission: {
      ...submission,
      status: jevResult.recommendedStatus,
      risk_score: jevResult.riskScore,
      risk_level: jevResult.riskLevel
    },
    revision,
    analysisRun,
    findings: ruleFindings,
    jev: jevResult,
    claimResult,
    selectedEvidence,
    llmResult,
    retrievalMetadata
  };
}
