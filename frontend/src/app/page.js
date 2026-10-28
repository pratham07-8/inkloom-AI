'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileCheck,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Search,
  Lock,
  GitBranch,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { currentRole, switchRole } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-slate-900 text-xl">
                INKLOOM <span className="text-blue-600 font-extrabold">AI</span>
              </span>
              <p className="text-[10px] text-blue-600 tracking-wider uppercase font-semibold">Brand Governance</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-blue-600 transition">How It Works</a>
            <a href="#pipeline" className="hover:text-blue-600 transition">Hybrid RAG</a>
            <a href="#governance" className="hover:text-blue-600 transition">Jev Decision Engine</a>
            <a href="#demo" className="hover:text-blue-600 transition">Demo Personas</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-500/25 transition flex items-center gap-1.5"
            >
              Launch App <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-white">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-400/15 via-indigo-300/10 to-transparent blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-8 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI-Powered Brand Governance & Compliance Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.15]">
            Create freely. Govern intelligently. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800">
              Publish confidently.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Automate brand policy compliance, verify marketing claims against approved reference facts, and route submissions through evidence-grounded human review before publication.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/submit"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xl shadow-blue-500/25 transition flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" /> Check Content Now
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-slate-800 font-semibold text-sm border border-slate-200 hover:border-blue-300 shadow-xs transition flex items-center justify-center gap-2"
            >
              Explore Dashboard
            </Link>
          </div>

          {/* Supported Types Badges */}
          <div className="mt-14 pt-10 border-t border-slate-200 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Direct Text & Copy</span>
            </div>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <span>Image Submissions with Tesseract OCR</span>
            </div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-700" />
              <span>PDF Documents with Page Anchors</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow */}
      <section id="how-it-works" className="py-20 bg-slate-50/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Workflow</p>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">The 3-Step Brand Governance Pipeline</h2>
            <p className="text-slate-600 text-sm mt-3">From raw draft to certified enterprise publication in seconds.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-lg mb-5">
                01
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Submit & Extract</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submit marketing copy, visual creatives, or PDF whitepapers. Embedded text is parsed with high precision and image visuals undergo Tesseract.js OCR text extraction.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold text-lg mb-5">
                02
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Hybrid RAG & Policy Audit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simultaneously retrieves approved facts via lexical full-text and pgvector similarity, fuses results with RRF (k=60), reranks, and executes deterministic rule checks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-lg mb-5">
                03
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Jev Scoring & Human Review</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our explainable Jev engine calculates severity-weighted compliance risk (0-100) and routes items to auto-approval, manager review, or critical escalation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RAG Pipeline Diagram Section */}
      <section id="pipeline" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">RAG Architecture</p>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Full Hybrid Retrieval-Augmented Governance</h2>
            <p className="text-slate-600 text-sm mt-3">
              Not merely raw vector cosine similarity. A true multi-stage retrieval architecture ensuring grounded evidence.
            </p>
          </div>

          <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-2xl p-8 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Input</span>
                <p className="text-xs font-semibold text-slate-900">User Submission Draft</p>
              </div>

              <div className="text-blue-500 font-bold hidden md:block">→</div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">Dual Retrieval</span>
                <p className="text-xs font-semibold text-blue-900">pgvector + Lexical BM25</p>
              </div>

              <div className="text-blue-500 font-bold hidden md:block">→</div>

              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">RRF & Rerank</span>
                <p className="text-xs font-semibold text-indigo-900">RRF (k=60) + Cross-Encoder</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200 text-left">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <p className="text-xs font-bold text-slate-900 mb-1">Maximal Marginal Relevance</p>
                <p className="text-[11px] text-slate-600">λ = 0.65 diversity selection eliminates redundant policy chunks while retaining maximal semantic relevance.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <p className="text-xs font-bold text-slate-900 mb-1">Claim Verification</p>
                <p className="text-[11px] text-slate-600">Classifies factual statements into Verified Consistent, Contradicts Policy, or Unverified Claims.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <p className="text-xs font-bold text-slate-900 mb-1">Deterministic Rules</p>
                <p className="text-[11px] text-slate-600">Prohibited absolutes, trademarks, and mandatory legal disclaimers run independently with 100% testability.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Persona Switcher Bar */}
      <section id="demo" className="py-14 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Evaluate INKLOOM AI As Any Role</h3>
          <p className="text-xs text-slate-600 mb-6">Switch personas instantly to inspect tenant role-based security and workflow isolation.</p>

          <div className="grid sm:grid-cols-3 gap-4 text-left">
            <Link
              href="/dashboard"
              onClick={() => switchRole('USER')}
              className={`p-4 rounded-xl border transition ${
                currentRole === 'USER'
                  ? 'bg-blue-50 border-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-blue-600">USER</span>
                <span className="text-[10px] text-slate-500">Submitter</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">Elena Rostova</p>
              <p className="text-[11px] text-slate-600 mt-1">Submit copy, review risk explanations, and resubmit revisions.</p>
            </Link>

            <Link
              href="/manager"
              onClick={() => switchRole('MANAGER')}
              className={`p-4 rounded-xl border transition ${
                currentRole === 'MANAGER'
                  ? 'bg-blue-50 border-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-indigo-600">MANAGER</span>
                <span className="text-[10px] text-slate-500">Reviewer</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">Marcus Vance</p>
              <p className="text-[11px] text-slate-600 mt-1">Audit high-risk queue, approve or request changes with comments.</p>
            </Link>

            <Link
              href="/admin"
              onClick={() => switchRole('ADMIN')}
              className={`p-4 rounded-xl border transition ${
                currentRole === 'ADMIN'
                  ? 'bg-blue-50 border-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-600">ADMIN</span>
                <span className="text-[10px] text-slate-500">Governance Lead</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">Dr. Sarah Lin</p>
              <p className="text-[11px] text-slate-600 mt-1">Manage brand guidelines, upload reference facts, inspect audit trail.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 INKLOOM AI. Tagline: Create freely. Govern intelligently. Publish confidently.</p>
          <div className="flex items-center gap-6 text-slate-600 font-medium">
            <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
            <Link href="/submit" className="hover:text-blue-600 transition">New Submission</Link>
            <Link href="/manager" className="hover:text-blue-600 transition">Manager Queue</Link>
            <Link href="/admin/guidelines" className="hover:text-blue-600 transition">Brand Policies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
