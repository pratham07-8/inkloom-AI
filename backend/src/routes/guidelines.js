import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/admin/guidelines
 * List all guideline versions for the company
 */
router.get('/', async (req, res) => {
  try {
    const guidelines = await dataStore.listGuidelines(req.user.companyId);
    res.json({ guidelines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/guidelines/active
 * Get currently active guideline configuration
 */
router.get('/active', async (req, res) => {
  try {
    const active = await dataStore.getActiveGuideline(req.user.companyId);
    if (!active) {
      return res.status(404).json({ error: 'No active guideline found.' });
    }
    res.json({ guideline: active });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/guidelines
 * Create new version of brand guidelines (Admin only)
 */
router.post('/', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { configuration } = req.body;

    if (!configuration || typeof configuration !== 'object') {
      return res.status(400).json({ error: 'Valid guideline configuration object is required.' });
    }

    const created = await dataStore.createGuideline(
      req.user.companyId,
      configuration,
      req.user.id
    );

    res.status(201).json({ guideline: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
