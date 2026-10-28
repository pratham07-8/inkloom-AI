'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import {
  Sliders,
  Users,
  ShieldCheck,
  Database,
  BookOpen,
  Activity,
  History,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function AdminPage() {
  const { user, currentRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, logsData, membersData] = await Promise.all([
        fetchApi('/api/admin/stats', {}, currentRole),
        fetchApi('/api/admin/audit-logs?limit=15', {}, currentRole),
        fetchApi('/api/admin/members', {}, currentRole)
      ]);
      setStats(statsData.stats);
      setAuditLogs(logsData.logs || []);
      setMembers(membersData.members || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [currentRole]);

  return (
    <DashboardLayout
      title="Admin & Governance Center"
      subtitle={`Company Administration for ${user.companyName}`}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/admin/guidelines"
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" /> Guidelines
          </Link>
          <Link
            href="/admin/knowledge"
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" /> Approved Facts
          </Link>
        </div>
      }
    >
      {/* Platform & Model Availability Status */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white rounded-xl p-5 mb-8 shadow-md border border-blue-900">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>AI Models & Infrastructure Health</span>
          </h3>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
            Operational
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-lg border border-white/10">
            <p className="text-[10px] text-blue-200">Embedding Model</p>
            <p className="font-semibold text-white mt-0.5 truncate">all-MiniLM-L6-v2</p>
            <span className="text-[9px] text-emerald-300 font-mono">384 Dimensions</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-lg border border-white/10">
            <p className="text-[10px] text-blue-200">Hybrid Search</p>
            <p className="font-semibold text-white mt-0.5">pgvector + BM25</p>
            <span className="text-[9px] text-blue-300 font-mono">RRF (k=60)</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-lg border border-white/10">
            <p className="text-[10px] text-blue-200">Decision Engine</p>
            <p className="font-semibold text-white mt-0.5">Jev Engine v1.0</p>
            <span className="text-[9px] text-blue-300 font-mono">Explainable Weighted</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-lg border border-white/10">
            <p className="text-[10px] text-blue-200">OCR Engine</p>
            <p className="font-semibold text-white mt-0.5">Tesseract.js OCR</p>
            <span className="text-[9px] text-amber-300 font-mono">Client & Server Ready</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Company Submissions</span>
            <div className="text-2xl font-bold text-slate-900">{stats.totalSubmissions}</div>
            <p className="text-[10px] text-slate-500 mt-1">{stats.approved} certified compliant</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">High Risk Queue</span>
            <div className="text-2xl font-bold text-rose-700">{stats.highRiskCount}</div>
            <p className="text-[10px] text-slate-500 mt-1">Requiring supervisor sign-off</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Knowledge Docs</span>
            <div className="text-2xl font-bold text-indigo-700">{stats.totalKnowledgeDocs}</div>
            <p className="text-[10px] text-slate-500 mt-1">Indexed for Hybrid RAG</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Active Members</span>
            <div className="text-2xl font-bold text-blue-700">{stats.activeMembers}</div>
            <p className="text-[10px] text-slate-500 mt-1">Tenant-scoped accounts</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Members List */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Company Membership Directory</span>
            </h3>
            <span className="text-[11px] text-slate-500">Multi-tenant isolated</span>
          </div>

          <div className="divide-y divide-slate-100">
            {members.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{m.name}</p>
                  <p className="text-[11px] text-slate-500">{m.email}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  m.role === 'ADMIN'
                    ? 'bg-blue-100 text-blue-800'
                    : m.role === 'MANAGER'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Trail */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span>Tamper-Evident Audit Trail</span>
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold">Immutable Logs</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 font-mono text-[11px]">{log.action}</span>
                  <span className="text-[10px] text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Resource: <span className="font-mono text-slate-800">{log.resource_type}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
