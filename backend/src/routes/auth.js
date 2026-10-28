import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  res.json({
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

router.get('/personas', async (req, res) => {
  const profiles = await dataStore.listProfiles();
  const memberships = await Promise.all(
    profiles.map(async p => {
      const m = await dataStore.getMembership('11111111-1111-1111-1111-111111111111', p.id);
      return {
        ...p,
        role: m?.role || 'USER',
        companyId: '11111111-1111-1111-1111-111111111111'
      };
    })
  );

  res.json({ personas: memberships });
});

export default router;
