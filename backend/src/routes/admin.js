import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole(['ADMIN']));

/**
 * GET /api/admin/stats
 * Overview company analytics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await dataStore.getCompanyStats(req.user.companyId);
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/audit-logs
 * Tamper-evident audit trail
 */
router.get('/audit-logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const logs = await dataStore.listAuditLogs(req.user.companyId, limit);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/members
 * Company membership directory
 */
router.get('/members', async (req, res) => {
  try {
    const profiles = await dataStore.listProfiles();
    const members = await Promise.all(
      profiles.map(async p => {
        const m = await dataStore.getMembership(req.user.companyId, p.id);
        return {
          id: p.id,
          name: p.name,
          email: p.email,
          role: m?.role || 'USER'
        };
      })
    );

    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
