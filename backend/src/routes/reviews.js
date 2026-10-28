import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';

const router = express.Router();

// All manager routes require MANAGER or ADMIN role
router.use(authenticate);
router.use(requireRole(['MANAGER', 'ADMIN']));

/**
 * GET /api/manager/reviews
 * List items in the manager review queue
 */
router.get('/', async (req, res) => {
  try {
    const { status, riskLevel } = req.query;
    const submissions = await dataStore.listSubmissions(req.user.companyId, {
      userId: req.user.id,
      role: req.user.role,
      status: status || null,
      riskLevel: riskLevel || null
    });

    res.json({ reviews: submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/manager/reviews/:id
 * Record manager review decision (APPROVED, REJECTED, CHANGES_REQUESTED)
 */
router.post('/:id', async (req, res) => {
  try {
    const submissionId = req.params.id;
    const { decision, comments } = req.body;

    const validDecisions = ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({
        error: `Invalid decision. Allowed values: ${validDecisions.join(', ')}`
      });
    }

    // Require comments when rejecting or requesting changes
    if ((decision === 'REJECTED' || decision === 'CHANGES_REQUESTED') && (!comments || comments.trim().length < 5)) {
      return res.status(400).json({
        error: 'Mandatory comment is required when rejecting or requesting changes (minimum 5 characters).'
      });
    }

    const submission = await dataStore.getSubmission(submissionId, req.user.companyId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found or does not belong to your company.' });
    }

    const latestRevision = submission.latestRevision;
    if (!latestRevision) {
      return res.status(400).json({ error: 'Cannot review a submission with no revisions.' });
    }

    const reviewRecord = await dataStore.recordReview(req.user.companyId, {
      submissionId,
      revisionId: latestRevision.id,
      managerId: req.user.id,
      decision,
      comments: comments || ''
    });

    const updated = await dataStore.getSubmission(submissionId, req.user.companyId);

    res.json({
      success: true,
      decision,
      review: reviewRecord,
      submission: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
