'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Sparkles,
  Database,
  ArrowRight,
  RefreshCw,
  GitCommit,
  Send,
  FileText,
  AlertOctagon,
  Copy,
  ChevronDown,
  Layers,
  Scale
} from 'lucide-react';

export default function SubmissionResultPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading audit workspace...</div>}>
      <SubmissionResultContent />
    </React.Suspense>
  );
}

function SubmissionResultContent() {
  const { id } = useParams();
  const router = useRouter();
  const { user, currentRole } = useAuth();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Resubmit Revision State
  const [showResubmit, setShowResubmit] = useState(false);
  const [revisedText, setRevisedText] = useState('');
  const [resubmitting, setResubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApi(`/api/submissions/${id}`, {}, currentRole);
      setSubmission(data.submission);
      if (data.submission?.latestRevision?.text_content) {
        setRevisedText(data.submission.latestRevision.text_content);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadSubmission();
  }, [id, currentRole]);

  const handleResubmit = async (e) => {
    e.preventDefault();
    if (!revisedText.trim()) return;

    try {
      setResubmitting(true);
      await fetchApi(`/api/submissions/${id}/revisions`, {
        method: 'POST',
        body: JSON.stringify({ textContent: revisedText })
      }, currentRole);

      setShowResubmit(false);
      await loadSubmission();
    } catch (err) {
      alert(`Resubmit failed: ${err.message}`);
    } finally {
      setResubmitting(false);
    }
  };

  const copySuggestedRewrite = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setRevisedText(text);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <DashboardLayout title="Audit Workspace">
        <div className="p-16 text-center text-xs text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
          Loading compliance audit report & evidence graph...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !submission) {
    return (
      <DashboardLayout title="Audit Workspace">
        <div className="max-w-xl mx-auto p-8 bg-white border border-rose-200 rounded-xl text-center">
          <AlertOctagon className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 mb-1">Unable to Load Submission</h2>
          <p className="text-xs text-rose-600 mb-4">{error || 'Record does not exist or access is restricted by tenant policy.'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg shadow-xs hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const analysis = submission.latestAnalysis || {};
  const findings = analysis.findings || [];
  const retrieval = analysis.retrieval_metadata || {};
  const modelMeta = analysis.model_metadata || {};
  const claimVerif = modelMeta.claimVerification || null;
  const llmMeta = modelMeta.llm || null;
  const jevMeta = modelMeta.jev || {};
  const evidenceChunks = retrieval.selectedEvidenceChunks || [];

  const riskScore = submission.risk_score ?? analysis.risk_score ?? 0;
  const riskLevel = submission.risk_level ?? analysis.risk_level ?? 'LOW';

  const getRiskScoreColor = (score) => {
    if (score >= 80) return 'text-rose-600 border-rose-500 bg-rose-50';
    if (score >= 60) return 'text-amber-600 border-amber-500 bg-amber-50';
    if (score >= 30) return 'text-yellow-600 border-yellow-500 bg-yellow-50';
    return 'text-emerald-600 border-emerald-500 bg-emerald-50';
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">INFO</span>;
    }
  };

  return (
    <DashboardLayout
      title={submission.title}
      subtitle={`Revision #${submission.latestRevision?.revision_number || 1} • Guideline v${submission.guideline_version || 1}`}
      actions={
        <div className="flex items-center gap-2">
          {submission.status === 'CHANGES_REQUESTED' && (
            <button
              onClick={() => setShowResubmit(!showResubmit)}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Resubmit Revision
            </button>
          )}
        </div>
      }
    >
      {/* Resubmit Modal / Section if toggled */}
      {showResubmit && (
        <div className="mb-8 p-6 bg-white border-2 border-blue-600 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-blue-600" /> Resubmit Content Revision
            </h3>
            <button
              onClick={() => setShowResubmit(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Edit your draft to resolve the compliance findings flagged below. Resubmitting will create an immutable new revision and immediately re-evaluate the governance pipeline.
          </p>
          <form onSubmit={handleResubmit}>
            <textarea
              rows={6}
              value={revisedText}
              onChange={(e) => setRevisedText(e.target.value)}
              className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-sans leading-relaxed text-slate-900"
            />
            <div className="mt-3 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={resubmitting}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition"
              >
                {resubmitting ? 'Re-analyzing...' : 'Submit Revision #2'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Top Compliance Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Risk Gauge Box */}
            <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-xs ${getRiskScoreColor(riskScore)}`}>
              <span className="text-2xl font-black tracking-tight">{riskScore}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider">{riskLevel}</span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
                <span className="text-xs font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {submission.status}
                </span>
                <span className="text-xs text-slate-500">• Source: {submission.content_type?.toUpperCase()}</span>
                <span className="text-xs text-slate-500">• Submitter: {submission.submitter?.name || 'Elena Rostova'}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">{submission.title}</h2>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {jevMeta.explanation || 'Analyzed against enterprise policies and approved corporate reference documents.'}
              </p>
            </div>
          </div>

          {/* Workflow Routing Recommendation Card */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/80 text-xs w-full lg:w-72 shrink-0">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">Jev Workflow Recommendation</span>
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>{jevMeta.routing || 'AUTO_APPROVE'}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              {jevMeta.routingReason || 'Low risk score with 0 severe violations.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Content, Findings, and Proof Snippets */}
        <div className="lg:col-span-2 space-y-8">
          {/* Submission Text Content */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Evaluated Content</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {submission.latestRevision?.text_content?.length || 0} characters
              </span>
            </h3>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
              {submission.latestRevision?.text_content || 'No text extracted.'}
            </div>
          </div>

          {/* Findings Grouped by Severity */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Compliance Findings ({findings.length})
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Deterministic Rules Verified</span>
              </div>
            </div>

            {findings.length === 0 ? (
              <div className="p-8 bg-emerald-50/50 rounded-xl border border-emerald-200 text-center text-xs text-emerald-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold">No Policy Violations Found</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Submission strictly follows tone requirements, trademark rules, and required disclaimers.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {findings.map((f, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(f.severity)}
                        <span className="font-semibold text-slate-900">{f.category}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        +{f.score_contribution} pts to Risk Score
                      </span>
                    </div>

                    <p className="text-slate-800 font-medium">{f.message}</p>

                    {f.evidence && (
                      <div className="p-2 rounded bg-white border border-slate-200 text-[11px] font-mono text-slate-700">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Flagged Evidence:</span>
                        "{f.evidence}"
                      </div>
                    )}

                    {f.recommended_action && (
                      <div className="text-[11px] text-blue-800 bg-blue-50 p-2 rounded border border-blue-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span><strong>Action:</strong> {f.recommended_action}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LLM Suggested Compliant Rewrite */}
          {llmMeta && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    AI Suggested Compliant Rewrite
                  </h3>
                </div>
                <button
                  onClick={() => copySuggestedRewrite(llmMeta.suggestedRewrite)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied to Draft!' : 'Copy to Draft'}</span>
                </button>
              </div>

              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-200/80 text-xs text-slate-800 leading-relaxed font-sans">
                {llmMeta.suggestedRewrite}
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
                <span>Model: {llmMeta.model}</span>
                <span className="italic text-slate-400">{llmMeta.disclaimer}</span>
              </div>
            </div>
          )}

          {/* Revision & Review Decision History */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-slate-500" />
              <span>Immutable Audit & Decision History</span>
            </h3>

            {submission.reviews && submission.reviews.length > 0 ? (
              <div className="space-y-3">
                {submission.reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">Manager Decision: {rev.decision}</span>
                      <span className="text-[10px] text-slate-500">{new Date(rev.created_at).toLocaleString()}</span>
                    </div>
                    {rev.comments && (
                      <p className="text-slate-700 italic mt-1">"{rev.comments}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No manager review decisions recorded yet.</p>
            )}
          </div>
        </div>

        {/* Right Col: Hybrid RAG Provenance, Claim Verification, Model Status */}
        <div className="space-y-8">
          {/* Claim Verification Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>Claim Verification</span>
            </h3>

            {claimVerif ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg border bg-slate-50 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Classification:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    claimVerif.status === 'VERIFIED_CONSISTENT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : claimVerif.status === 'CONTRADICTS_POLICY'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {claimVerif.label}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {claimVerif.evidenceSummary}
                </p>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between">
                  <span>Method: {claimVerif.method}</span>
                  <span>Confidence: {(claimVerif.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No claim verification data recorded.</p>
            )}
          </div>

          {/* Retrieved Knowledge Evidence (RAG Provenance) */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                <span>RAG Evidence Provenance</span>
              </h3>
              <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                MMR λ=0.65
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              Retrieved via pgvector + Lexical BM25, combined with RRF (k=60), and diversified with MMR:
            </p>

            <div className="space-y-3">
              {evidenceChunks.map((ev, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span className="text-slate-900 truncate max-w-[170px]">{ev.docTitle}</span>
                    <span>P. {ev.pageNumber}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 italic leading-snug">
                    "{ev.snippet}"
                  </p>
                  <div className="text-[9px] text-slate-400 font-mono pt-1 flex justify-between">
                    <span>Section: {ev.section}</span>
                    <span>Score: {ev.mmrScore ? ev.mmrScore.toFixed(3) : 'Top Rank'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model & Security Audit Details */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs text-xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Pipeline Execution Metadata
            </h3>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Pipeline Engine:</span>
              <span className="font-mono text-slate-800">inkloom-governance-1.0</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Scoring Engine:</span>
              <span className="font-mono text-slate-800">{analysis.scoring_version || 'jev-v1'}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Reranker Status:</span>
              <span className="font-mono text-slate-800">{retrieval.rerankerStatus || 'OK'}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Tenant Scope:</span>
              <span className="font-mono text-emerald-600">Isolated (Company ID)</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
