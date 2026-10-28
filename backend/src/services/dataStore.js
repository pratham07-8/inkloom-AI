import { supabase, isLiveSupabaseConfigured } from '../config/index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed data matching supabase/seed.sql
 */
const initialSeed = {
  profiles: [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Elena Rostova', email: 'user@aetheris.com' },
    { id: '00000000-0000-0000-0000-000000000002', name: 'Marcus Vance', email: 'manager@aetheris.com' },
    { id: '00000000-0000-0000-0000-000000000003', name: 'Dr. Sarah Lin', email: 'admin@aetheris.com' },
  ],
  companies: [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Aetheris Dynamics', slug: 'aetheris-dynamics' },
  ],
  company_memberships: [
    { id: 'm1', company_id: '11111111-1111-1111-1111-111111111111', user_id: '00000000-0000-0000-0000-000000000001', role: 'USER' },
    { id: 'm2', company_id: '11111111-1111-1111-1111-111111111111', user_id: '00000000-0000-0000-0000-000000000002', role: 'MANAGER' },
    { id: 'm3', company_id: '11111111-1111-1111-1111-111111111111', user_id: '00000000-0000-0000-0000-000000000003', role: 'ADMIN' },
  ],
  brand_guidelines: [
    {
      id: '22222222-2222-2222-2222-222222222221',
      company_id: '11111111-1111-1111-1111-111111111111',
      version: 1,
      status: 'ACTIVE',
      created_by: '00000000-0000-0000-0000-000000000003',
      configuration: {
        companyName: 'Aetheris Dynamics',
        tagline: 'Empowering autonomous intelligence',
        tone: {
          primary: 'Professional, visionary, technically precise, credible',
          avoid: 'Hyperbolic, deceptive, casual jargon, ungrounded superlatives'
        },
        prohibitedTerms: [
          { term: 'guaranteed 100% uptime', severity: 'CRITICAL', message: 'Never guarantee 100% uptime; standard SLA is 99.99%.' },
          { term: 'unhackable', severity: 'CRITICAL', message: 'Security can never be described as unhackable; use Zero-Trust architecture.' },
          { term: 'best in the world', severity: 'HIGH', message: 'Unsubstantiated absolute claim violates truth-in-advertising guidelines.' },
          { term: 'infinitely scalable', severity: 'MEDIUM', message: 'Use horizontally scalable across 42 global regions instead.' },
          { term: 'cheap', severity: 'MEDIUM', message: 'Use cost-efficient or optimized total cost of ownership.' },
          { term: 'magic', severity: 'LOW', message: 'Avoid colloquial slang when describing neural networks.' }
        ],
        requiredPhrases: [
          { phrase: 'Aetheris Neural Mesh™', category: 'TRADEMARK', severity: 'MEDIUM' },
          { phrase: 'Subject to standard SLA terms and regional availability.', category: 'DISCLAIMER', severity: 'HIGH', triggerOnKeywords: ['uptime', 'latency', 'sla', 'availability'] },
          { phrase: 'Autonomous operations require certified safety supervisor oversight.', category: 'DISCLAIMER', severity: 'CRITICAL', triggerOnKeywords: ['autonomous', 'robot', 'amr', 'driverless'] }
        ],
        approvedTerminology: [
          { preferred: 'Zero-Trust verified architecture', replaces: ['unbreakable', 'bulletproof'] },
          { preferred: '99.99% Enterprise SLA', replaces: ['100% uptime', 'never goes down'] },
          { preferred: 'Sub-millisecond edge latency', replaces: ['instant speed', 'zero lag'] }
        ],
        scoreWeights: {
          critical: 40,
          high: 25,
          medium: 12,
          low: 4
        },
        rules: {
          maxTitleLength: 120,
          maxBodyLength: 20000,
          requireDisclaimers: true,
          flagSuperlatives: true
        }
      }
    }
  ],
  knowledge_documents: [
    {
      id: '33333333-3333-3333-3333-333333333331',
      company_id: '11111111-1111-1111-1111-111111111111',
      title: 'Aetheris Cloud Architecture & SLA Factsheet v3.2',
      category: 'FACTSHEET',
      version: 1,
      status: 'ACTIVE',
      uploaded_by: '00000000-0000-0000-0000-000000000003',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333332',
      company_id: '11111111-1111-1111-1111-111111111111',
      title: 'Aetheris Robotics Safety & Compliance Handbook 2026',
      category: 'COMPLIANCE',
      version: 1,
      status: 'ACTIVE',
      uploaded_by: '00000000-0000-0000-0000-000000000003',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ],
  knowledge_chunks: [
    {
      id: '44444444-4444-4444-4444-444444444441',
      company_id: '11111111-1111-1111-1111-111111111111',
      document_id: '33333333-3333-3333-3333-333333333331',
      chunk_index: 0,
      content: 'Aetheris Neural Mesh™ provides a verified 99.99% enterprise uptime commitment under standard Tier-4 data center SLAs. Claims of 100% zero downtime are strictly prohibited as scheduled quarterly maintenance windows apply. All SLA claims must carry the disclaimer: "Subject to standard SLA terms and regional availability."',
      source_type: 'DOCUMENT',
      page_number: 1,
      metadata: { section: 'SLA & Uptime Policy', docTitle: 'Aetheris Cloud Architecture & SLA Factsheet v3.2' }
    },
    {
      id: '44444444-4444-4444-4444-444444444442',
      company_id: '11111111-1111-1111-1111-111111111111',
      document_id: '33333333-3333-3333-3333-333333333331',
      chunk_index: 1,
      content: 'Edge inference throughput achieves up to 14,200 inferences/second with 1.8ms median response latency across 42 global edge points of presence. Security follows Zero-Trust verified architecture with end-to-end mTLS encryption and hardware HSM key isolation.',
      source_type: 'DOCUMENT',
      page_number: 2,
      metadata: { section: 'Edge Latency & Security', docTitle: 'Aetheris Cloud Architecture & SLA Factsheet v3.2' }
    },
    {
      id: '44444444-4444-4444-4444-444444444443',
      company_id: '11111111-1111-1111-1111-111111111111',
      document_id: '33333333-3333-3333-3333-333333333332',
      chunk_index: 0,
      content: 'All autonomous mobile robots (AMR-500 series) comply with ISO 3691-4 industrial safety standards. Operating speeds in shared human spaces are electronically governed at a maximum of 1.5 m/s with LiDAR redundancy.',
      source_type: 'DOCUMENT',
      page_number: 1,
      metadata: { section: 'AMR Safety Envelope', docTitle: 'Aetheris Robotics Safety & Compliance Handbook 2026' }
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      company_id: '11111111-1111-1111-1111-111111111111',
      document_id: '33333333-3333-3333-3333-333333333332',
      chunk_index: 1,
      content: 'Marketing materials and press releases discussing robotic autonomy must include the mandatory disclaimer: "Autonomous operations require certified safety supervisor oversight." Unsupervised autonomous claims are unverified and non-compliant with commercial robotics regulations.',
      source_type: 'DOCUMENT',
      page_number: 2,
      metadata: { section: 'Marketing Governance Rules', docTitle: 'Aetheris Robotics Safety & Compliance Handbook 2026' }
    }
  ],
  submissions: [
    {
      id: '55555555-5555-5555-5555-555555555551',
      company_id: '11111111-1111-1111-1111-111111111111',
      submitted_by: '00000000-0000-0000-0000-000000000001',
      title: 'Q3 Product Announcement: Neural Mesh Edge Latency',
      content_type: 'text',
      source_type: 'human',
      status: 'APPROVED',
      risk_score: 12,
      risk_level: 'LOW',
      guideline_version: 1,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    {
      id: '55555555-5555-5555-5555-555555555552',
      company_id: '11111111-1111-1111-1111-111111111111',
      submitted_by: '00000000-0000-0000-0000-000000000001',
      title: 'Press Release: Next-Gen AMR-500 Logistics Robot',
      content_type: 'text',
      source_type: 'human',
      status: 'IN_REVIEW',
      risk_score: 65,
      risk_level: 'HIGH',
      guideline_version: 1,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: '55555555-5555-5555-5555-555555555553',
      company_id: '11111111-1111-1111-1111-111111111111',
      submitted_by: '00000000-0000-0000-0000-000000000001',
      title: 'Social Media Campaign: Unbreakable Cloud Security',
      content_type: 'text',
      source_type: 'human',
      status: 'CHANGES_REQUESTED',
      risk_score: 85,
      risk_level: 'CRITICAL',
      guideline_version: 1,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  submission_revisions: [
    {
      id: '66666666-6666-6666-6666-666666666661',
      company_id: '11111111-1111-1111-1111-111111111111',
      submission_id: '55555555-5555-5555-5555-555555555551',
      revision_number: 1,
      text_content: 'Announcing Aetheris Neural Mesh™ edge inference capabilities. Experience sub-millisecond edge latency with 99.99% Enterprise SLA. Subject to standard SLA terms and regional availability.',
      submitted_by: '00000000-0000-0000-0000-000000000001',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: '66666666-6666-6666-6666-666666666662',
      company_id: '11111111-1111-1111-1111-111111111111',
      submission_id: '55555555-5555-5555-5555-555555555552',
      revision_number: 1,
      text_content: 'Our revolutionary AMR-500 logistics robot is the best in the world for smart warehousing. It features full autonomous navigation at cheap operational costs without needing human intervention.',
      submitted_by: '00000000-0000-0000-0000-000000000001',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: '66666666-6666-6666-6666-666666666663',
      company_id: '11111111-1111-1111-1111-111111111111',
      submission_id: '55555555-5555-5555-5555-555555555553',
      revision_number: 1,
      text_content: 'Our cloud cluster has guaranteed 100% uptime and is mathematically unhackable. It works like magic for mission critical operations.',
      submitted_by: '00000000-0000-0000-0000-000000000001',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ],
  analysis_runs: [
    {
      id: '77777777-7777-7777-7777-777777777771',
      company_id: '11111111-1111-1111-1111-111111111111',
      submission_id: '55555555-5555-5555-5555-555555555551',
      revision_id: '66666666-6666-6666-6666-666666666661',
      pipeline_version: '1.0.0',
      guideline_version: 1,
      status: 'COMPLETED',
      risk_score: 12,
      risk_level: 'LOW',
      findings: [
        {
          finding_id: 'fnd-01',
          rule_id: 'rule-trademark-check',
          category: 'BRANDING',
          severity: 'INFO',
          message: 'Correctly utilized approved trademark Aetheris Neural Mesh™.',
          evidence: 'Aetheris Neural Mesh™',
          score_contribution: 0,
          source: 'deterministic_rule'
        },
        {
          finding_id: 'fnd-02',
          rule_id: 'rule-disclaimer-present',
          category: 'COMPLIANCE',
          severity: 'LOW',
          message: 'Mandatory SLA disclaimer is present and verified.',
          evidence: 'Subject to standard SLA terms and regional availability.',
          score_contribution: 12,
          source: 'deterministic_rule'
        }
      ],
      retrieval_metadata: {
        retrievalChannel: 'hybrid',
        candidatesRRF: 6,
        rerankerModel: 'cross-encoder/ms-marco-MiniLM-L-6-v2',
        mmrLambda: 0.65,
        selectedEvidenceChunks: ['44444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444442']
      },
      model_metadata: {
        claimVerification: 'VERIFIED_CONSISTENT',
        confidence: 0.96,
        llmSuggestedRewrite: 'Announcing Aetheris Neural Mesh™ edge inference capabilities. Experience sub-millisecond edge latency with 99.99% Enterprise SLA. Subject to standard SLA terms and regional availability.'
      },
      scoring_version: 'jev-v1',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: '77777777-7777-7777-7777-777777777772',
      company_id: '11111111-1111-1111-1111-111111111111',
      submission_id: '55555555-5555-5555-5555-555555555552',
      revision_id: '66666666-6666-6666-6666-666666666662',
      pipeline_version: '1.0.0',
      guideline_version: 1,
      status: 'COMPLETED',
      risk_score: 65,
      risk_level: 'HIGH',
      findings: [
        {
          finding_id: 'fnd-10',
          rule_id: 'rule-superlative-prohibited',
          category: 'LEGAL_RISK',
          severity: 'HIGH',
          message: 'Unsubstantiated superlative "best in the world" detected.',
          evidence: 'is the best in the world for smart warehousing',
          recommended_action: 'Replace with substantiated metrics (e.g. ISO 3691-4 certified).',
          score_contribution: 25,
          source: 'deterministic_rule'
        },
        {
          finding_id: 'fnd-11',
          rule_id: 'rule-mandatory-disclaimer-missing',
          category: 'COMPLIANCE',
          severity: 'CRITICAL',
          message: 'Missing mandatory robotics disclaimer for autonomous claims.',
          evidence: 'autonomous navigation',
          recommended_action: 'Add: "Autonomous operations require certified safety supervisor oversight."',
          score_contribution: 40,
          source: 'deterministic_rule'
        }
      ],
      retrieval_metadata: {
        retrievalChannel: 'hybrid',
        candidatesRRF: 8,
        rerankerModel: 'cross-encoder/ms-marco-MiniLM-L-6-v2',
        mmrLambda: 0.65,
        selectedEvidenceChunks: ['44444444-4444-4444-4444-444444444443', '44444444-4444-4444-4444-444444444444']
      },
      model_metadata: {
        claimVerification: 'CONTRADICTS_POLICY',
        confidence: 0.91,
        llmSuggestedRewrite: 'Our AMR-500 logistics robot provides ISO 3691-4 certified navigation for smart warehousing. It optimizes operational costs with LiDAR-guided pathing. Autonomous operations require certified safety supervisor oversight.'
      },
      scoring_version: 'jev-v1',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ],
  reviews: [
    {
      id: '88888888-8888-8888-8888-888888888881',
      company_id: '11111111-1111-1111-1111-111111111111',
      submission_id: '55555555-5555-5555-5555-555555555551',
      revision_id: '66666666-6666-6666-6666-666666666661',
      manager_id: '00000000-0000-0000-0000-000000000002',
      decision: 'APPROVED',
      comments: 'Compliant with trademark policies and SLA disclaimers. Approved for immediate publication.',
      created_at: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    {
      id: '88888888-8888-8888-8888-888888888883',
      company_id: '11111111-1111-1111-1111-111111111111',
      submission_id: '55555555-5555-5555-5555-555555555553',
      revision_id: '66666666-6666-6666-6666-666666666663',
      manager_id: '00000000-0000-0000-0000-000000000002',
      decision: 'CHANGES_REQUESTED',
      comments: 'Critical violations: "guaranteed 100% uptime" and "unhackable" are legally prohibited. Please rewrite using Zero-Trust and 99.99% SLA standards.',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  audit_logs: [
    {
      id: 'a1',
      company_id: '11111111-1111-1111-1111-111111111111',
      actor_id: '00000000-0000-0000-0000-000000000003',
      action: 'CREATE_GUIDELINE',
      resource_type: 'brand_guidelines',
      resource_id: '22222222-2222-2222-2222-222222222221',
      metadata: { version: 1 },
      created_at: new Date(Date.now() - 86400000 * 6).toISOString()
    },
    {
      id: 'a2',
      company_id: '11111111-1111-1111-1111-111111111111',
      actor_id: '00000000-0000-0000-0000-000000000001',
      action: 'CREATE_SUBMISSION',
      resource_type: 'submissions',
      resource_id: '55555555-5555-5555-5555-555555555551',
      metadata: { title: 'Q3 Product Announcement' },
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 'a3',
      company_id: '11111111-1111-1111-1111-111111111111',
      actor_id: '00000000-0000-0000-0000-000000000002',
      action: 'REVIEW_DECISION',
      resource_type: 'reviews',
      resource_id: '88888888-8888-8888-8888-888888888881',
      metadata: { decision: 'APPROVED' },
      created_at: new Date(Date.now() - 3600000 * 20).toISOString()
    }
  ]
};

// Clone initial state for in-memory transactional operations
let memoryStore = JSON.parse(JSON.stringify(initialSeed));

export const dataStore = {
  // Profiles
  async getProfile(id) {
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (data) return data;
    }
    return memoryStore.profiles.find(p => p.id === id) || null;
  },

  async listProfiles() {
    return memoryStore.profiles;
  },

  // Company Memberships
  async getMembership(companyId, userId) {
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('company_memberships')
        .select('*')
        .eq('company_id', companyId)
        .eq('user_id', userId)
        .single();
      if (data) return data;
    }
    return memoryStore.company_memberships.find(
      m => m.company_id === companyId && m.user_id === userId
    ) || null;
  },

  async getUserMemberships(userId) {
    return memoryStore.company_memberships.filter(m => m.user_id === userId);
  },

  // Guidelines
  async getActiveGuideline(companyId) {
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('brand_guidelines')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'ACTIVE')
        .order('version', { ascending: false })
        .limit(1)
        .single();
      if (data) return data;
    }
    return memoryStore.brand_guidelines
      .filter(g => g.company_id === companyId && g.status === 'ACTIVE')
      .sort((a, b) => b.version - a.version)[0] || null;
  },

  async listGuidelines(companyId) {
    return memoryStore.brand_guidelines
      .filter(g => g.company_id === companyId)
      .sort((a, b) => b.version - a.version);
  },

  async createGuideline(companyId, configuration, createdBy) {
    const existing = memoryStore.brand_guidelines.filter(g => g.company_id === companyId);
    const newVersion = existing.length > 0 ? Math.max(...existing.map(g => g.version)) + 1 : 1;
    
    // Archive previous
    existing.forEach(g => { g.status = 'ARCHIVED'; });

    const newGuideline = {
      id: uuidv4(),
      company_id: companyId,
      version: newVersion,
      configuration,
      status: 'ACTIVE',
      created_by: createdBy,
      created_at: new Date().toISOString()
    };

    memoryStore.brand_guidelines.push(newGuideline);
    await this.logAudit(companyId, createdBy, 'CREATE_GUIDELINE', 'brand_guidelines', newGuideline.id, { version: newVersion });
    return newGuideline;
  },

  // Knowledge Documents & Chunks
  async listKnowledgeDocuments(companyId) {
    return memoryStore.knowledge_documents
      .filter(d => d.company_id === companyId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getKnowledgeChunks(companyId, documentId = null) {
    let chunks = memoryStore.knowledge_chunks.filter(c => c.company_id === companyId);
    if (documentId) {
      chunks = chunks.filter(c => c.document_id === documentId);
    }
    return chunks;
  },

  async addKnowledgeDocument(companyId, { title, category, uploadedBy, chunks }) {
    const docId = uuidv4();
    const doc = {
      id: docId,
      company_id: companyId,
      title,
      category: category || 'GENERAL',
      version: 1,
      status: 'ACTIVE',
      uploaded_by: uploadedBy,
      created_at: new Date().toISOString()
    };
    memoryStore.knowledge_documents.push(doc);

    const insertedChunks = chunks.map((c, idx) => ({
      id: uuidv4(),
      company_id: companyId,
      document_id: docId,
      chunk_index: idx,
      content: c.content,
      source_type: 'DOCUMENT',
      source_version: 1,
      page_number: c.page_number || 1,
      metadata: { section: c.section || 'General', docTitle: title }
    }));

    memoryStore.knowledge_chunks.push(...insertedChunks);
    await this.logAudit(companyId, uploadedBy, 'UPLOAD_KNOWLEDGE', 'knowledge_documents', docId, { title, chunksCount: chunks.length });
    return { doc, chunksCount: insertedChunks.length };
  },

  // Submissions
  async listSubmissions(companyId, { userId = null, role = 'USER', status = null, riskLevel = null } = {}) {
    let items = memoryStore.submissions.filter(s => s.company_id === companyId);
    if (role === 'USER' && userId) {
      items = items.filter(s => s.submitted_by === userId);
    }
    if (status) {
      items = items.filter(s => s.status === status);
    }
    if (riskLevel) {
      items = items.filter(s => s.risk_level === riskLevel);
    }
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getSubmission(id, companyId) {
    const sub = memoryStore.submissions.find(s => s.id === id && s.company_id === companyId);
    if (!sub) return null;

    const revisions = memoryStore.submission_revisions
      .filter(r => r.submission_id === id)
      .sort((a, b) => b.revision_number - a.revision_number);

    const latestRevision = revisions[0] || null;

    const analysisRuns = memoryStore.analysis_runs
      .filter(a => a.submission_id === id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const latestAnalysis = analysisRuns[0] || null;

    const reviews = memoryStore.reviews
      .filter(r => r.submission_id === id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const submitter = memoryStore.profiles.find(p => p.id === sub.submitted_by) || null;

    return {
      ...sub,
      submitter,
      revisions,
      latestRevision,
      latestAnalysis,
      reviews
    };
  },

  async createSubmission(companyId, { submittedBy, title, contentType, sourceType = 'human', textContent, storagePath = null }) {
    const submissionId = uuidv4();
    const revisionId = uuidv4();
    const now = new Date().toISOString();

    const submission = {
      id: submissionId,
      company_id: companyId,
      submitted_by: submittedBy,
      title,
      content_type: contentType,
      source_type: sourceType,
      storage_path: storagePath,
      status: 'PENDING_ANALYSIS',
      risk_score: null,
      risk_level: null,
      guideline_version: 1,
      created_at: now,
      updated_at: now
    };

    const revision = {
      id: revisionId,
      company_id: companyId,
      submission_id: submissionId,
      revision_number: 1,
      text_content: textContent,
      storage_path: storagePath,
      submitted_by: submittedBy,
      created_at: now
    };

    memoryStore.submissions.push(submission);
    memoryStore.submission_revisions.push(revision);

    await this.logAudit(companyId, submittedBy, 'CREATE_SUBMISSION', 'submissions', submissionId, { title, contentType });
    return { submission, revision };
  },

  async createRevision(companyId, submissionId, { submittedBy, textContent, storagePath = null }) {
    const sub = memoryStore.submissions.find(s => s.id === submissionId && s.company_id === companyId);
    if (!sub) throw new Error('Submission not found');

    const existingRevs = memoryStore.submission_revisions.filter(r => r.submission_id === submissionId);
    const nextRevNum = Math.max(...existingRevs.map(r => r.revision_number), 0) + 1;
    const revId = uuidv4();
    const now = new Date().toISOString();

    const revision = {
      id: revId,
      company_id: companyId,
      submission_id: submissionId,
      revision_number: nextRevNum,
      text_content: textContent,
      storage_path: storagePath,
      submitted_by: submittedBy,
      created_at: now
    };

    memoryStore.submission_revisions.push(revision);

    sub.status = 'PENDING_ANALYSIS';
    sub.updated_at = now;

    await this.logAudit(companyId, submittedBy, 'CREATE_REVISION', 'submission_revisions', revId, { revisionNumber: nextRevNum });
    return { submission: sub, revision };
  },

  async recordAnalysisRun(companyId, { submissionId, revisionId, riskScore, riskLevel, findings, retrievalMetadata, modelMetadata, recommendedStatus }) {
    const analysisId = uuidv4();
    const now = new Date().toISOString();

    const run = {
      id: analysisId,
      company_id: companyId,
      submission_id: submissionId,
      revision_id: revisionId,
      pipeline_version: '1.0.0',
      guideline_version: 1,
      status: 'COMPLETED',
      risk_score: riskScore,
      risk_level: riskLevel,
      findings,
      retrieval_metadata: retrievalMetadata,
      model_metadata: modelMetadata,
      scoring_version: 'jev-v1',
      created_at: now,
      completed_at: now
    };

    memoryStore.analysis_runs.push(run);

    // Update parent submission status and risk metrics
    const sub = memoryStore.submissions.find(s => s.id === submissionId);
    if (sub) {
      sub.risk_score = riskScore;
      sub.risk_level = riskLevel;
      sub.status = recommendedStatus;
      sub.updated_at = now;
    }

    return run;
  },

  // Reviews
  async recordReview(companyId, { submissionId, revisionId, managerId, decision, comments }) {
    const reviewId = uuidv4();
    const now = new Date().toISOString();

    const review = {
      id: reviewId,
      company_id: companyId,
      submission_id: submissionId,
      revision_id: revisionId,
      manager_id: managerId,
      decision,
      comments: comments || '',
      created_at: now
    };

    memoryStore.reviews.push(review);

    // Update submission status based on manager decision
    const sub = memoryStore.submissions.find(s => s.id === submissionId);
    if (sub) {
      sub.status = decision;
      sub.updated_at = now;
    }

    await this.logAudit(companyId, managerId, 'REVIEW_DECISION', 'reviews', reviewId, { decision, comments });
    return review;
  },

  // Audit Logs
  async logAudit(companyId, actorId, action, resourceType, resourceId, metadata = {}) {
    const log = {
      id: uuidv4(),
      company_id: companyId,
      actor_id: actorId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
      created_at: new Date().toISOString()
    };
    memoryStore.audit_logs.push(log);
    return log;
  },

  async listAuditLogs(companyId, limit = 50) {
    return memoryStore.audit_logs
      .filter(l => l.company_id === companyId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  },

  // Stats
  async getCompanyStats(companyId) {
    const subs = memoryStore.submissions.filter(s => s.company_id === companyId);
    return {
      totalSubmissions: subs.length,
      approved: subs.filter(s => s.status === 'APPROVED').length,
      inReview: subs.filter(s => s.status === 'IN_REVIEW' || s.status === 'PENDING_ANALYSIS').length,
      changesRequested: subs.filter(s => s.status === 'CHANGES_REQUESTED').length,
      rejected: subs.filter(s => s.status === 'REJECTED').length,
      highRiskCount: subs.filter(s => s.risk_level === 'HIGH' || s.risk_level === 'CRITICAL').length,
      totalKnowledgeDocs: memoryStore.knowledge_documents.filter(d => d.company_id === companyId).length,
      activeMembers: memoryStore.company_memberships.filter(m => m.company_id === companyId).length
    };
  }
};
