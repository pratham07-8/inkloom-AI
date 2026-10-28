'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, ArrowRight, UserCheck, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { personas, switchRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePersonaSelect = (roleKey) => {
    switchRole(roleKey);
    if (roleKey === 'MANAGER') router.push('/manager');
    else if (roleKey === 'ADMIN') router.push('/admin');
    else router.push('/dashboard');
  };

  const handleCustomLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      switchRole('USER');
      router.push('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-slate-50 to-white text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-slate-900 text-2xl">
            INKLOOM <span className="text-blue-600">AI</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Sign In to Brand Governance</h2>
        <p className="mt-1 text-xs text-slate-500">Tenant-isolated access for Aetheris Dynamics</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl rounded-2xl sm:px-8 space-y-6">
          {/* Quick Demo Personas */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Quick Persona Switcher
            </p>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(personas).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handlePersonaSelect(role)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-500 hover:bg-blue-50 text-center transition group shadow-2xs"
                >
                  <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">{role}</p>
                  <p className="text-[10px] text-slate-500 truncate">{personas[role].name.split(' ')[0]}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">Click any role to test workflow permissions immediately.</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">or sign in with credentials</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@aetheris.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Need an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
