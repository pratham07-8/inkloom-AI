-- ==============================================================================
-- INKLOOM AI - Supabase PostgreSQL Schema & Security Migrations
-- Brand Governance Platform
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Enable pgvector if available in environment
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Drop existing tables if re-running
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS analysis_runs CASCADE;
DROP TABLE IF EXISTS submission_revisions CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS knowledge_chunks CASCADE;
DROP TABLE IF EXISTS knowledge_documents CASCADE;
DROP TABLE IF EXISTS brand_guidelines CASCADE;
DROP TABLE IF EXISTS company_memberships CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. Core Tables

-- Profiles (linked to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Companies (Tenants)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Company Memberships (Strict RBAC: USER, MANAGER, ADMIN)
CREATE TABLE company_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('USER', 'MANAGER', 'ADMIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_company_user UNIQUE (company_id, user_id)
);

-- Brand Guidelines (Versioned policy configurations)
CREATE TABLE brand_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    configuration JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'DRAFT')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_company_guideline_version UNIQUE (company_id, version)
);

-- Knowledge Documents (Reference facts, product specs, claims)
CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'GENERAL',
    storage_path TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Knowledge Chunks (Hybrid Lexical + Vector storage)
CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    source_type TEXT NOT NULL DEFAULT 'DOCUMENT',
    source_version INTEGER NOT NULL DEFAULT 1,
    page_number INTEGER,
    embedding VECTOR(384),
    search_vector TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Submissions
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'pdf')),
    source_type TEXT NOT NULL DEFAULT 'human',
    storage_path TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING_ANALYSIS' CHECK (
        status IN ('PENDING_ANALYSIS', 'IN_REVIEW', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED')
    ),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    guideline_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Submission Revisions (Immutable)
CREATE TABLE submission_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL DEFAULT 1,
    text_content TEXT,
    storage_path TEXT,
    submitted_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_submission_revision UNIQUE (submission_id, revision_number)
);

-- Analysis Runs (Immutable audit of evaluation runs)
CREATE TABLE analysis_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    revision_id UUID NOT NULL REFERENCES submission_revisions(id) ON DELETE CASCADE,
    pipeline_version TEXT NOT NULL DEFAULT '1.0.0',
    guideline_version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    findings JSONB NOT NULL DEFAULT '[]'::jsonb,
    retrieval_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    model_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    scoring_version TEXT NOT NULL DEFAULT 'jev-v1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews (Manager Decision records, immutable)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    revision_id UUID NOT NULL REFERENCES submission_revisions(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES profiles(id),
    decision TEXT NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED', 'CHANGES_REQUESTED')),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs (Tamper-evident activity trail)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Indexes for Performance and RAG Retrieval
CREATE INDEX idx_memberships_user ON company_memberships(user_id);
CREATE INDEX idx_memberships_company ON company_memberships(company_id);
CREATE INDEX idx_guidelines_company ON brand_guidelines(company_id, status);
CREATE INDEX idx_knowledge_docs_company ON knowledge_documents(company_id, status);
CREATE INDEX idx_knowledge_chunks_company ON knowledge_chunks(company_id);
CREATE INDEX idx_knowledge_chunks_doc ON knowledge_chunks(document_id);
CREATE INDEX idx_knowledge_chunks_tsvector ON knowledge_chunks USING GIN(search_vector);
CREATE INDEX idx_submissions_company ON submissions(company_id, status);
CREATE INDEX idx_submissions_user ON submissions(submitted_by);
CREATE INDEX idx_analysis_runs_sub ON analysis_runs(submission_id);
CREATE INDEX idx_reviews_sub ON reviews(submission_id);
CREATE INDEX idx_audit_company ON audit_logs(company_id, created_at DESC);

-- 5. Row-Level Security (RLS) Setup
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper security definer function to get current user's role in a company
CREATE OR REPLACE FUNCTION get_user_role(target_company_id UUID, target_user_id UUID)
RETURNS TEXT AS $$
    SELECT role FROM company_memberships 
    WHERE company_id = target_company_id AND user_id = target_user_id
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Profiles: Users can view their own profile or fellow company members
CREATE POLICY "Profiles are viewable by owner" 
    ON profiles FOR SELECT USING (id = auth.uid());

CREATE POLICY "Profiles can be updated by owner" 
    ON profiles FOR UPDATE USING (id = auth.uid());

-- Submissions:
-- Users can view their own submissions.
-- Managers and Admins in the same company can view company submissions.
CREATE POLICY "Submissions viewable by submitter or authorized reviewer"
    ON submissions FOR SELECT USING (
        submitted_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM company_memberships
            WHERE company_memberships.company_id = submissions.company_id
              AND company_memberships.user_id = auth.uid()
              AND company_memberships.role IN ('MANAGER', 'ADMIN')
        )
    );

CREATE POLICY "Submissions insertable by company members"
    ON submissions FOR INSERT WITH CHECK (
        submitted_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM company_memberships
            WHERE company_memberships.company_id = submissions.company_id
              AND company_memberships.user_id = auth.uid()
        )
    );

-- Knowledge chunks: Strictly isolated to company members
CREATE POLICY "Knowledge chunks accessible to company members only"
    ON knowledge_chunks FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_memberships
            WHERE company_memberships.company_id = knowledge_chunks.company_id
              AND company_memberships.user_id = auth.uid()
        )
    );

-- Hybrid search stored procedure for PostgreSQL
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
    p_company_id UUID,
    p_query_embedding VECTOR(384),
    p_match_threshold FLOAT,
    p_match_count INT
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    chunk_index INT,
    content TEXT,
    source_type TEXT,
    similarity FLOAT
)
LANGUAGE sql STABLE AS $$
    SELECT
        id,
        document_id,
        chunk_index,
        content,
        source_type,
        1 - (knowledge_chunks.embedding <=> p_query_embedding) AS similarity
    FROM knowledge_chunks
    WHERE company_id = p_company_id
      AND (1 - (knowledge_chunks.embedding <=> p_query_embedding)) >= p_match_threshold
    ORDER BY knowledge_chunks.embedding <=> p_query_embedding
    LIMIT p_match_count;
$$;
