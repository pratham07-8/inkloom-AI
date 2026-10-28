import { dataStore } from '../services/dataStore.js';
import { supabase, isLiveSupabaseConfigured } from '../config/index.js';

const DEMO_USERS = {
  USER: '00000000-0000-0000-0000-000000000001',
  MANAGER: '00000000-0000-0000-0000-000000000002',
  ADMIN: '00000000-0000-0000-0000-000000000003'
};

const DEFAULT_COMPANY_ID = '11111111-1111-1111-1111-111111111111';

/**
 * Authentication and Tenant Isolation Middleware
 */
export async function authenticate(req, res, next) {
  try {
    let userId = null;

    // 1. Check live Supabase Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && isLiveSupabaseConfigured && supabase) {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        userId = user.id;
      }
    }

    // 2. Demo persona fallback for instant evaluation / local testing
    if (!userId) {
      const demoHeader = req.headers['x-demo-user-id'] || req.query.demo_user;
      if (demoHeader && (demoHeader in DEMO_USERS || demoHeader.includes('-'))) {
        userId = DEMO_USERS[demoHeader] || demoHeader;
      } else {
        // Default to demo User (Elena)
        userId = DEMO_USERS.USER;
      }
    }

    // 3. Resolve active company and membership
    const companyId = req.headers['x-company-id'] || DEFAULT_COMPANY_ID;
    const membership = await dataStore.getMembership(companyId, userId);

    if (!membership) {
      return res.status(403).json({
        error: 'Forbidden: User is not a member of the requested company tenant.'
      });
    }

    const profile = await dataStore.getProfile(userId);

    req.user = {
      id: userId,
      name: profile?.name || 'Authorized Member',
      email: profile?.email || 'user@aetheris.com',
      companyId: membership.company_id,
      role: membership.role
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: `Authentication failed: ${err.message}` });
  }
}

/**
 * RBAC Role Guard Middleware
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Action requires one of roles [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
      });
    }

    next();
  };
}
