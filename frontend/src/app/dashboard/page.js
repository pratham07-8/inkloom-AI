'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertOctagon,
  FileUp,
  ArrowRight,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function UserDashboard() {
  const { user, currentRole } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApi('/api/submissions', {}, currentRole);
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentRole]);

  // Derived metrics
  const totalCount = submissions.length;
  const approvedCount = submissions.filter(s => s.status === 'APPROVED').length;
  const inReviewCount = submissions.filter(s => s.status === 'IN_REVIEW' || s.status === 'PENDING_ANALYSIS').length;
  const changesCount = submissions.filter(s => s.status === 'CHANGES_REQUESTED').length;

  const filteredSubmissions = filterStatus === 'ALL'
    ? submissions
    : submissions.filter(s => s.status === filterStatus);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Approved
        </span>;
      case 'IN_REVIEW':
      case 'PENDING_ANALYSIS':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3" /> Awaiting Review
        </span>;
      case 'CHANGES_REQUESTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertOctagon className="w-3 h-3" /> Changes Requested
        </span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          Rejected
        </span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  const getRiskBadge = (score, level) => {
    if (score === null || score === undefined) return <span className="text-xs text-slate-600">—</span>;

    let color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (level === 'CRITICAL' || score >= 80) color = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
    else if (level === 'HIGH' || score >= 60) color = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
    else if (level === 'MEDIUM' || score >= 30) color = 'bg-yellow-50 text-yellow-700 border-yellow-200';

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${color}`}>
        <span>Score {score}</span>
        <span className="text-[10px] uppercase font-bold">({level})</span>
      </span>
    );
  };

  return (
    <DashboardLayout
      title="Content Submissions"
      subtitle="Publishing compliance workspace"
      actions={
        <Link
          href="/submit"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <FileUp className="w-3.5 h-3.5" /> Submit Content
        </Link>
      }
    >
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Submissions</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
          <p className="text-[11px] text-slate-600 mt-1">Tenant: {user.companyName}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{approvedCount}</div>
          <p className="text-[11px] text-slate-600 mt-1">Certified for publication</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{inReviewCount}</div>
          <p className="text-[11px] text-slate-600 mt-1">Awaiting manager decision</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Changes Requested</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{changesCount}</div>
          <p className="text-[11px] text-slate-600 mt-1">Requires user revision</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filter:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {['ALL', 'APPROVED', 'IN_REVIEW', 'CHANGES_REQUESTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                    filterStatus === st
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="p-12 text-center text-slate-600 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading submissions from tenant database...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-xs">
            Failed to load submissions: {error}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No submissions found</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 mb-4">
              Submit your first marketing copy, image graphic, or PDF whitepaper to evaluate against brand guidelines.
            </p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition"
            >
              <FileUp className="w-4 h-4" /> New Submission
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Jev Risk Score</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition group">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <Link href={`/submissions/${sub.id}`} className="hover:text-blue-600 transition flex items-center gap-2">
                        <span>{sub.title}</span>
                      </Link>
                      <span className="text-[10px] text-slate-600 block mt-0.5">
                        Guideline v{sub.guideline_version || 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {sub.content_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(sub.status)}</td>
                    <td className="py-3.5 px-4">{getRiskBadge(sub.risk_score, sub.risk_level)}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/submissions/${sub.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                      >
                        Review Workspace <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
