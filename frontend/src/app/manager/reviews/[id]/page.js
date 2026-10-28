'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import {
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Clock,
  ArrowLeft,
  RefreshCw,
  Scale,
  Sparkles,
  Database,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function ManagerReviewDetailPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading review detail...</div>}>
      <ManagerReviewDetailContent />
    </React.Suspense>
  );
}

function ManagerReviewDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const { user, currentRole } = useAuth();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Decision State
  const [comments, setComments] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [decisionError, setDecisionError] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'

  const loadSubmission = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApi(`/api/submissions/${id}`, {}, currentRole);
      setSubmission(data.submission);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadSubmission();
  }, [id, currentRole]);

  const handleDecisionSubmit = async () => {
    if (!confirmModal) return;

    if ((confirmModal === 'REJECTED' || confirmModal === 'CHANGES_REQUESTED') && (!comments || comments.trim().length < 5)) {
      setDecisionError('Mandatory explanation comment is required when rejecting or requesting changes (minimum 5 characters).');
      return;
    }

    try {
      setSubmittingDecision(true);
      setDecisionError(null);

      await fetchApi(`/api/manager/reviews/${id}`, {
        method: 'POST',
        body: JSON.stringify({
          decision: confirmModal,
          comments
        })
      }, currentRole);

      setConfirmModal(null);
      await loadSubmission();
    } catch (err) {
      setDecisionError(err.message);
    } finally {
      setSubmittingDecision(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Manager Audit Workspace">
        <div className="p-16 text-center text-xs text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
          Loading submission review package...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !submission) {
    return (
      <DashboardLayout title="Manager Audit Workspace">
        <div className="max-w-xl mx-auto p-8 bg-white border border-rose-200 rounded-xl text-center">
          <AlertOctagon className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 mb-1">Access Restricted or Missing</h2>
          <p className="text-xs text-rose-600 mb-4">{error || 'This submission does not exist or does not belong to your company tenant.'}</p>
          <button
            onClick={() => router.push('/manager')}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg shadow-xs hover:bg-blue-700"
          >
            Return to Review Queue
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
  const jevMeta = modelMeta.jev || {};
  const evidenceChunks = retrieval.selectedEvidenceChunks || [];

  return (
    <DashboardLayout
      title={`Review: ${submission.title}`}
      subtitle={`Tenant: ${user.companyName}`}
      actions={
        <Link
          href="/manager"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Queue
        </Link>
      }
    >
      {/* Confirmation Decision Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              <span>Confirm Governance Decision: {confirmModal}</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are recording an irreversible compliance decision on this submission. This action will be permanently recorded in the company audit log.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Reviewer Comments & Feedback {confirmModal !== 'APPROVED' && <span className="text-rose-500">* (Mandatory)</span>}
              </label>
              <textarea
                rows={4}
                required={confirmModal !== 'APPROVED'}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={
                  confirmModal === 'APPROVED'
                    ? 'Optional editorial notes or conditional approval comments...'
                    : 'Explain exact policy requirements or required corrections for the submitter...'
                }
                className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-900"
              />
            </div>

            {decisionError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {decisionError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setConfirmModal(null); setDecisionError(null); }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDecisionSubmit}
                disabled={submittingDecision}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition shadow-xs ${
                  confirmModal === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : confirmModal === 'REJECTED'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {submittingDecision ? 'Recording Decision...' : `Confirm ${confirmModal}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Action Banner */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-5 mb-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Manager Action Center</span>
          <p className="text-xs text-slate-700">
            Current status: <span className="font-bold text-slate-900">{submission.status}</span>. Record review decision based on policy findings below:
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setConfirmModal('APPROVED')}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Approve
          </button>
          <button
            onClick={() => setConfirmModal('CHANGES_REQUESTED')}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4" /> Request Changes
          </button>
          <button
            onClick={() => setConfirmModal('REJECTED')}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" /> Reject
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Content & Findings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Text */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Submitted Content
            </h3>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
              {submission.latestRevision?.text_content || 'No text extracted.'}
            </div>
          </div>

          {/* Compliance Findings */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Governance Violations & Disclaimers ({findings.length})
            </h3>
            {findings.map((f, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-700">{f.severity} • {f.category}</span>
                  <span className="text-[10px] text-slate-500 font-mono">+{f.score_contribution} pts</span>
                </div>
                <p className="text-slate-800 font-medium">{f.message}</p>
                {f.evidence && (
                  <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-700">
                    "{f.evidence}"
                  </div>
                )}
                {f.recommended_action && (
                  <p className="text-[11px] text-blue-800 font-medium bg-blue-50 p-2 rounded border border-blue-200">Recommended: {f.recommended_action}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Jev Engine & Retrieved Evidence */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>Jev Compliance Score</span>
            </h3>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">
              {submission.risk_score} / 100
            </div>
            <p className="text-xs text-slate-600 font-semibold mb-3">Risk Level: {submission.risk_level}</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {jevMeta.explanation || 'Severity-weighted risk evaluation based on legal and brand policies.'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Retrieved Policy Evidence</span>
            </h3>
            <div className="space-y-2.5">
              {evidenceChunks.map((ev, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <p className="font-bold text-slate-900 text-[11px] truncate mb-1">{ev.docTitle}</p>
                  <p className="text-slate-600 text-[11px] italic">"{ev.snippet}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
