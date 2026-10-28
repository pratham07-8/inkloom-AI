-- ==============================================================================
-- INKLOOM AI - Realistic Demo Seed Data
-- Fictional Company: Aetheris Dynamics (Cloud & Autonomous Robotics)
-- ==============================================================================

-- 1. Create Demo Profiles
INSERT INTO profiles (id, name, email) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Elena Rostova', 'user@aetheris.com'),
    ('00000000-0000-0000-0000-000000000002', 'Marcus Vance', 'manager@aetheris.com'),
    ('00000000-0000-0000-0000-000000000003', 'Dr. Sarah Lin', 'admin@aetheris.com')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;

-- 2. Create Fictional Company
INSERT INTO companies (id, name, slug) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Aetheris Dynamics', 'aetheris-dynamics')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Company Memberships
INSERT INTO company_memberships (company_id, user_id, role) VALUES
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'USER'),
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'MANAGER'),
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000003', 'ADMIN')
ON CONFLICT (company_id, user_id) DO UPDATE SET role = EXCLUDED.role;

-- 4. Brand Guidelines (Version 1)
INSERT INTO brand_guidelines (id, company_id, version, configuration, status, created_by) VALUES
    (
        '22222222-2222-2222-2222-222222222221',
        '11111111-1111-1111-1111-111111111111',
        1,
        '{
            "companyName": "Aetheris Dynamics",
            "tagline": "Empowering autonomous intelligence",
            "tone": {
                "primary": "Professional, visionary, technically precise, credible",
                "avoid": "Hyperbolic, deceptive, casual jargon, ungrounded superlatives"
            },
            "prohibitedTerms": [
                { "term": "guaranteed 100% uptime", "severity": "CRITICAL", "message": "Never guarantee 100% uptime; standard SLA is 99.99%." },
                { "term": "unhackable", "severity": "CRITICAL", "message": "Security can never be described as unhackable; use Zero-Trust architecture." },
                { "term": "best in the world", "severity": "HIGH", "message": "Unsubstantiated absolute claim violates truth-in-advertising guidelines." },
                { "term": "infinitely scalable", "severity": "MEDIUM", "message": "Use horizontally scalable across 42 global regions instead." },
                { "term": "cheap", "severity": "MEDIUM", "message": "Use cost-efficient or optimized total cost of ownership." },
                { "term": "magic", "severity": "LOW", "message": "Avoid colloquial slang when describing neural networks." }
            ],
            "requiredPhrases": [
                { "phrase": "Aetheris Neural Mesh™", "category": "TRADEMARK", "severity": "MEDIUM" },
                { "phrase": "Subject to standard SLA terms and regional availability.", "category": "DISCLAIMER", "severity": "HIGH", "triggerOnKeywords": ["uptime", "latency", "SLA", "availability"] },
                { "phrase": "Autonomous operations require certified safety supervisor oversight.", "category": "DISCLAIMER", "severity": "CRITICAL", "triggerOnKeywords": ["autonomous", "robot", "AMR", "driverless"] }
            ],
            "approvedTerminology": [
                { "preferred": "Zero-Trust verified architecture", "replaces": ["unbreakable", "bulletproof"] },
                { "preferred": "99.99% Enterprise SLA", "replaces": ["100% uptime", "never goes down"] },
                { "preferred": "Sub-millisecond edge latency", "replaces": ["instant speed", "zero lag"] }
            ],
            "scoreWeights": {
                "critical": 40,
                "high": 25,
                "medium": 12,
                "low": 4
            },
            "rules": {
                "maxTitleLength": 120,
                "maxBodyLength": 20000,
                "requireDisclaimers": true,
                "flagSuperlatives": true
            }
        }'::jsonb,
        'ACTIVE',
        '00000000-0000-0000-0000-000000000003'
    )
ON CONFLICT (company_id, version) DO NOTHING;

-- 5. Knowledge Documents & Chunks for Hybrid RAG
INSERT INTO knowledge_documents (id, company_id, title, category, version, status, uploaded_by) VALUES
    ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Aetheris Cloud Architecture & SLA Factsheet v3.2', 'FACTSHEET', 1, 'ACTIVE', '00000000-0000-0000-0000-000000000003'),
    ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Aetheris Robotics Safety & Compliance Handbook 2026', 'COMPLIANCE', 1, 'ACTIVE', '00000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- Chunks
INSERT INTO knowledge_chunks (id, company_id, document_id, chunk_index, content, source_type, page_number, metadata) VALUES
    (
        '44444444-4444-4444-4444-444444444441',
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333331',
        0,
        'Aetheris Neural Mesh™ provides a verified 99.99% enterprise uptime commitment under standard Tier-4 data center SLAs. Claims of 100% zero downtime are strictly prohibited as scheduled quarterly maintenance windows apply. All SLA claims must carry the disclaimer: "Subject to standard SLA terms and regional availability."',
        'DOCUMENT',
        1,
        '{"section": "SLA & Uptime Policy", "docTitle": "Aetheris Cloud Architecture & SLA Factsheet v3.2"}'::jsonb
    ),
    (
        '44444444-4444-4444-4444-444444444442',
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333331',
        1,
        'Edge inference throughput achieves up to 14,200 inferences/second with 1.8ms median response latency across 42 global edge points of presence. Security follows Zero-Trust verified architecture with end-to-end mTLS encryption and hardware HSM key isolation.',
        'DOCUMENT',
        2,
        '{"section": "Edge Latency & Security", "docTitle": "Aetheris Cloud Architecture & SLA Factsheet v3.2"}'::jsonb
    ),
    (
        '44444444-4444-4444-4444-444444444443',
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333332',
        0,
        'All autonomous mobile robots (AMR-500 series) comply with ISO 3691-4 industrial safety standards. Operating speeds in shared human spaces are electronically governed at a maximum of 1.5 m/s with LiDAR redundancy.',
        'DOCUMENT',
        1,
        '{"section": "AMR Safety Envelope", "docTitle": "Aetheris Robotics Safety & Compliance Handbook 2026"}'::jsonb
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333332',
        1,
        'Marketing materials and press releases discussing robotic autonomy must include the mandatory disclaimer: "Autonomous operations require certified safety supervisor oversight." Unsupervised autonomous claims are unverified and non-compliant with commercial robotics regulations.',
        'DOCUMENT',
        2,
        '{"section": "Marketing Governance Rules", "docTitle": "Aetheris Robotics Safety & Compliance Handbook 2026"}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Sample Submissions, Revisions, Analysis Runs, and Reviews
-- Submission 1: Approved Low Risk
INSERT INTO submissions (id, company_id, submitted_by, title, content_type, source_type, status, risk_score, risk_level, guideline_version) VALUES
    ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Q3 Product Announcement: Neural Mesh Edge Latency', 'text', 'human', 'APPROVED', 12, 'LOW', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO submission_revisions (id, company_id, submission_id, revision_number, text_content, submitted_by) VALUES
    ('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555551', 1, 'Announcing Aetheris Neural Mesh™ edge inference capabilities. Experience sub-millisecond edge latency with 99.99% Enterprise SLA. Subject to standard SLA terms and regional availability.', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO analysis_runs (id, company_id, submission_id, revision_id, pipeline_version, risk_score, risk_level, findings, retrieval_metadata, model_metadata, scoring_version) VALUES
    (
        '77777777-7777-7777-7777-777777777771',
        '11111111-1111-1111-1111-111111111111',
        '55555555-5555-5555-5555-555555555551',
        '66666666-6666-6666-6666-666666666661',
        '1.0.0',
        12,
        'LOW',
        '[
            {
                "finding_id": "fnd-01",
                "rule_id": "rule-trademark-check",
                "category": "BRANDING",
                "severity": "INFO",
                "message": "Correctly utilized approved trademark Aetheris Neural Mesh™.",
                "evidence": "Aetheris Neural Mesh™",
                "score_contribution": 0,
                "source": "deterministic_rule"
            },
            {
                "finding_id": "fnd-02",
                "rule_id": "rule-disclaimer-present",
                "category": "COMPLIANCE",
                "severity": "LOW",
                "message": "Mandatory SLA disclaimer is present and verified.",
                "evidence": "Subject to standard SLA terms and regional availability.",
                "score_contribution": 12,
                "source": "deterministic_rule"
            }
        ]'::jsonb,
        '{"retrievalChannel": "hybrid", "candidatesRRF": 6, "rerankerModel": "cross-encoder/ms-marco-MiniLM-L-6-v2", "mmrLambda": 0.65}'::jsonb,
        '{"claimVerification": "VERIFIED_CONSISTENT", "confidence": 0.96}'::jsonb,
        'jev-v1'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO reviews (id, company_id, submission_id, revision_id, manager_id, decision, comments) VALUES
    ('88888888-8888-8888-8888-888888888881', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555551', '66666666-6666-6666-6666-666666666661', '00000000-0000-0000-0000-000000000002', 'APPROVED', 'Compliant with trademark policies and SLA disclaimers. Approved for immediate publication.')
ON CONFLICT (id) DO NOTHING;

-- Submission 2: High Risk In Review
INSERT INTO submissions (id, company_id, submitted_by, title, content_type, source_type, status, risk_score, risk_level, guideline_version) VALUES
    ('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Press Release: Next-Gen AMR-500 Logistics Robot', 'text', 'human', 'IN_REVIEW', 65, 'HIGH', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO submission_revisions (id, company_id, submission_id, revision_number, text_content, submitted_by) VALUES
    ('66666666-6666-6666-6666-666666666662', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555552', 1, 'Our revolutionary AMR-500 logistics robot is the best in the world for smart warehousing. It features full autonomous navigation at cheap operational costs without needing human intervention.', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO analysis_runs (id, company_id, submission_id, revision_id, pipeline_version, risk_score, risk_level, findings, retrieval_metadata, model_metadata, scoring_version) VALUES
    (
        '77777777-7777-7777-7777-777777777772',
        '11111111-1111-1111-1111-111111111111',
        '55555555-5555-5555-5555-555555555552',
        '66666666-6666-6666-6666-666666666662',
        '1.0.0',
        65,
        'HIGH',
        '[
            {
                "finding_id": "fnd-10",
                "rule_id": "rule-superlative-prohibited",
                "category": "LEGAL_RISK",
                "severity": "HIGH",
                "message": "Unsubstantiated superlative ''best in the world'' detected.",
                "evidence": "is the best in the world for smart warehousing",
                "recommended_action": "Replace with substantiated metrics (e.g. ISO 3691-4 certified).",
                "score_contribution": 25,
                "source": "deterministic_rule"
            },
            {
                "finding_id": "fnd-11",
                "rule_id": "rule-mandatory-disclaimer-missing",
                "category": "COMPLIANCE",
                "severity": "CRITICAL",
                "message": "Missing mandatory robotics disclaimer for autonomous claims.",
                "evidence": "autonomous navigation",
                "recommended_action": "Add: ''Autonomous operations require certified safety supervisor oversight.''",
                "score_contribution": 40,
                "source": "deterministic_rule"
            }
        ]'::jsonb,
        '{"retrievalChannel": "hybrid", "candidatesRRF": 8, "rerankerModel": "cross-encoder/ms-marco-MiniLM-L-6-v2", "mmrLambda": 0.65}'::jsonb,
        '{"claimVerification": "CONTRADICTS_POLICY", "confidence": 0.91}'::jsonb,
        'jev-v1'
    )
ON CONFLICT (id) DO NOTHING;

-- Submission 3: Critical Risk Changes Requested
INSERT INTO submissions (id, company_id, submitted_by, title, content_type, source_type, status, risk_score, risk_level, guideline_version) VALUES
    ('55555555-5555-5555-5555-555555555553', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Social Media Campaign: Unbreakable Cloud Security', 'text', 'human', 'CHANGES_REQUESTED', 85, 'CRITICAL', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO submission_revisions (id, company_id, submission_id, revision_number, text_content, submitted_by) VALUES
    ('66666666-6666-6666-6666-666666666663', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555553', 1, 'Our cloud cluster has guaranteed 100% uptime and is mathematically unhackable. It works like magic for mission critical operations.', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reviews (id, company_id, submission_id, revision_id, manager_id, decision, comments) VALUES
    ('88888888-8888-8888-8888-888888888883', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555553', '66666666-6666-6666-6666-666666666663', '00000000-0000-0000-0000-000000000002', 'CHANGES_REQUESTED', 'Critical violations: ''guaranteed 100% uptime'' and ''unhackable'' are legally prohibited. Please rewrite using Zero-Trust and 99.99% SLA standards.')
ON CONFLICT (id) DO NOTHING;

-- Audit Logs
INSERT INTO audit_logs (company_id, actor_id, action, resource_type, resource_id, metadata) VALUES
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000003', 'CREATE_GUIDELINE', 'brand_guidelines', '22222222-2222-2222-2222-222222222221', '{"version": 1}'::jsonb),
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'CREATE_SUBMISSION', 'submissions', '55555555-5555-5555-5555-555555555551', '{"title": "Q3 Product Announcement"}'::jsonb),
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'REVIEW_DECISION', 'reviews', '88888888-8888-8888-8888-888888888881', '{"decision": "APPROVED"}'::jsonb);
