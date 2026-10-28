import express from 'express';
import cors from 'cors';
import { config, isLiveSupabaseConfigured } from './config/index.js';

import authRoutes from './routes/auth.js';
import submissionsRoutes from './routes/submissions.js';
import reviewsRoutes from './routes/reviews.js';
import guidelinesRoutes from './routes/guidelines.js';
import knowledgeRoutes from './routes/knowledge.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Global Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-user-id', 'x-company-id']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'INKLOOM AI - Brand Governance Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      supabasePostgreSQL: isLiveSupabaseConfigured ? 'LIVE_CONNECTED' : 'IN_MEMORY_TRANSACTIONAL_FALLBACK',
      huggingFaceEmbedding: config.huggingface.apiKey ? 'LIVE_HF_API' : 'DETERMINISTIC_LOCAL_EMBEDDER',
      huggingFaceReranker: config.huggingface.apiKey ? 'LIVE_HF_CROSS_ENCODER' : 'LOCAL_CROSS_TOKEN_ALIGNMENT',
      huggingFaceLLM: config.huggingface.apiKey ? 'LIVE_HF_INFERENCE' : 'OFFLINE_RULE_GUIDED_SYNTHESIS',
      jevDecisionEngine: 'ACTIVE',
      ocrEngine: 'TESSERACT_JS_READY'
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/manager/reviews', reviewsRoutes);
app.use('/api/admin/guidelines', guidelinesRoutes);
app.use('/api/admin/knowledge', knowledgeRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 INKLOOM AI Backend running on port ${config.port}`);
    console.log(`🏢 Tenant: Multi-company enabled (Default: Aetheris Dynamics)`);
    console.log(`🧠 Governance Pipeline: Rules + Hybrid RAG + Jev Scoring`);
    console.log(`=======================================================`);
  });
}

export default app;
