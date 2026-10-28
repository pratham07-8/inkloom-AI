'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import {
  Inbox,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  Scale,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export default function ManagerDashboard() {
  const { user, currentRole } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRisk, setFilterRisk] = useState('ALL');

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApi('/api/manager/reviews', {}, currentRole);
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [currentRole]);

  // Derived metrics
  const highRiskQueue = reviews.filter(r => (r.risk_level === 'HIGH' || r.risk_level === 'CRITICAL') && r.status === 'IN_REVIEW');
  const criticalItems = reviews.filter(r => r.risk_level === 'CRITICAL');
  const pendingDecisions = reviews.filter(r => r.status === 'IN_REVIEW' || r.status === 'PENDING_ANALYSIS');

  const filteredReviews = filterRisk === 'ALL'
    ? reviews
    : reviews.filter(r => r.risk_level === filterRisk);

  const getRiskPill = (score, level) => {
    let color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (level === 'CRITICAL' || score >= 80) color = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
    else if (level === 'HIGH' || score >= 60) color = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
    else if (level === 'MEDIUM') color = 'bg-yellow-50 text-yellow-700 border-yellow-200';

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border ${color}`}>
        <span>Score {score}</span>
        <span className="text-[10px] uppercase font-bold tracking-wider">({level})</span>
      </span>
    );
  };

  return (
    <DashboardLayout
      title="Manager Review Queue"
      subtitle={`Authorized Governance Review for ${user.companyName}`}
      actions={
        <button
          onClick={loadReviews}
          disabled={loading}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Queue
        </button>
      }
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Awaiting Decision</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{pendingDecisions.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Submissions in review hold</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Escalations</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{criticalItems.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Score ≥ 80 or legal violations</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">High Risk Queue</span>
            <ShieldAlert className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-700">{highRiskQueue.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Requires human review</p>
        </div>
      </div>

      {/* Main Review Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filter Risk:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterRisk(lvl)}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    filterRisk === lvl
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading company review queue...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600">
            Failed to load queue: {error}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">Review Queue is Clear</h3>
            <p className="text-[11px] text-slate-500 mt-1">No pending submissions match the selected risk criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Submission Title</th>
                  <th className="py-3 px-4">Content Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Jev Compliance Score</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/60 transition group">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <Link href={`/manager/reviews/${rev.id}`} className="hover:text-blue-600 transition">
                        {rev.title}
                      </Link>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Guideline v{rev.guideline_version || 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {rev.content_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {rev.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getRiskPill(rev.risk_score, rev.risk_level)}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/manager/reviews/${rev.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-2xs"
                      >
                        Audit & Decide <ArrowRight className="w-3 h-3" />
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
