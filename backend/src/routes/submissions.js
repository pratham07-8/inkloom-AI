import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { runGovernancePipeline } from '../services/governancePipeline.js';
import { dataStore } from '../services/dataStore.js';
import { evaluateRules } from '../services/rulesEngine.js';
import { retrieveCandidates } from '../services/rag/retriever.js';
import { reciprocalRankFusion } from '../services/rag/rrf.js';
import { rerankCandidates } from '../services/rag/reranker.js';
import { maximalMarginalRelevance } from '../services/rag/mmr.js';
import { calculateJevScore } from '../services/jevEngine.js';
import { verifyClaims } from '../services/claimVerifier.js';
import { generateLlmExplanation } from '../services/llmExplainer.js';
import { config } from '../config/index.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024
  }
});

/**
 * POST /api/submissions
 * Create and synchronously evaluate a new submission
 */
router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    const title = req.body.title || 'Untitled Submission';
    const contentType = req.body.contentType || 'text';
    const textContent = req.body.textContent || '';
    const fileBuffer = req.file ? req.file.buffer : null;

    if (contentType === 'text' && !textContent.trim()) {
      return res.status(400).json({ error: 'Text content cannot be empty for text submissions.' });
    }

    if ((contentType === 'image' || contentType === 'pdf') && !fileBuffer) {
      return res.status(400).json({ error: `File upload required for content type "${contentType}".` });
    }

    const result = await runGovernancePipeline({
      companyId: req.user.companyId,
      userId: req.user.id,
      title,
      contentType,
      textContent,
      fileBuffer,
      sourceType: 'human'
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Governance pipeline execution failed.' });
  }
});

/**
 * GET /api/submissions
 * List submissions with role-based filtering (User sees own; Manager/Admin see company)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, riskLevel } = req.query;
    const submissions = await dataStore.listSubmissions(req.user.companyId, {
      userId: req.user.id,
      role: req.user.role,
      status: status || null,
      riskLevel: riskLevel || null
    });

    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/submissions/:id
 * Retrieve full submission evidence report
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const submission = await dataStore.getSubmission(req.params.id, req.user.companyId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found or access denied.' });
    }

    // Role check: USER can only view their own
    if (req.user.role === 'USER' && submission.submitted_by !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to view this submission.' });
    }

    res.json({ submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/submissions/:id/revisions
 * Submit an edited revision for an existing submission
 */
router.post('/:id/revisions', authenticate, async (req, res) => {
  try {
    const submission = await dataStore.getSubmission(req.params.id, req.user.companyId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    if (req.user.role === 'USER' && submission.submitted_by !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You cannot resubmit content for another user.' });
    }

    const { textContent } = req.body;
    if (!textContent || !textContent.trim()) {
      return res.status(400).json({ error: 'Revision text content cannot be empty.' });
    }

    // 1. Create immutable revision record
    const { revision } = await dataStore.createRevision(req.user.companyId, submission.id, {
      submittedBy: req.user.id,
      textContent
    });

    // 2. Re-run analysis on the updated content
    const activeGuideline = await dataStore.getActiveGuideline(req.user.companyId);
    const guidelineConfig = activeGuideline.configuration || {};

    const findings = evaluateRules({
      title: submission.title,
      textContent,
      guidelineConfig
    });

    const ragQuery = `${submission.title} ${textContent.slice(0, 300)}`;
    const { lexicalResults, vectorResults, totalChunksAvailable } = await retrieveCandidates(
      req.user.companyId,
      ragQuery
    );
    const fused = reciprocalRankFusion({ lexicalResults, vectorResults });
    const { reranked, status: rerankerStatus, model: rerankerModel } = await rerankCandidates(ragQuery, fused.slice(0, 8));
    const selectedEvidence = maximalMarginalRelevance({ candidates: reranked, targetCount: 4 });

    const claimResult = await verifyClaims({ textContent, evidenceChunks: selectedEvidence });
    const jevResult = calculateJevScore({ findings, guidelineConfig, claimVerificationResult: claimResult });
    const llmResult = await generateLlmExplanation({
      title: submission.title,
      textContent,
      findings,
      evidenceChunks: selectedEvidence
    });

    const retrievalMetadata = {
      retrievalChannel: 'hybrid',
      totalCompanyChunks: totalChunksAvailable,
      rerankerStatus,
      rerankerModel,
      selectedEvidenceChunks: selectedEvidence.map(e => ({
        id: e.chunk.id,
        docTitle: e.chunk.metadata?.docTitle || 'Reference Document',
        section: e.chunk.metadata?.section || 'General',
        snippet: e.chunk.content.slice(0, 180) + '...',
        mmrScore: e.mmrScore
      }))
    };

    const modelMetadata = {
      claimVerification: claimResult,
      llm: llmResult,
      jev: {
        explanation: jevResult.explanation,
        routing: jevResult.routing,
        routingReason: jevResult.routingReason
      }
    };

    await dataStore.recordAnalysisRun(req.user.companyId, {
      submissionId: submission.id,
      revisionId: revision.id,
      riskScore: jevResult.riskScore,
      riskLevel: jevResult.riskLevel,
      findings,
      retrievalMetadata,
      modelMetadata,
      recommendedStatus: jevResult.recommendedStatus
    });

    const updated = await dataStore.getSubmission(submission.id, req.user.companyId);
    res.status(201).json({ submission: updated, latestRevision: revision, findings, jev: jevResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
