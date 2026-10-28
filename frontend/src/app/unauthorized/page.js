'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldX, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function UnauthorizedPage() {
  const { currentRole, switchRole } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-6 font-sans">
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-5">
          <ShieldX className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Your current persona role (<span className="text-white font-bold">{currentRole}</span>) is not authorized to access this administrative resource. INKLOOM AI enforces strict tenant and role isolation.
        </p>

        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-left mb-6">
          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">Switch Demo Persona</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => switchRole('MANAGER')}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600 hover:text-white transition"
            >
              Switch to MANAGER
            </button>
            <button
              onClick={() => switchRole('ADMIN')}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition"
            >
              Switch to ADMIN
            </button>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Submissions Dashboard
        </Link>
      </div>
    </div>
  );
}
