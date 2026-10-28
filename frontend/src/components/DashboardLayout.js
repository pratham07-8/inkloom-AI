'use client';

import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Activity, Shield, Sparkles, Bell } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children, title, subtitle, actions }) {
  const { user, currentRole } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {title}
              {subtitle && (
                <span className="text-xs font-normal text-slate-500 hidden sm:inline">
                  — {subtitle}
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* System Status Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              Jev Governance Engine Active
            </div>

            {/* Role Badge */}
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {currentRole}
            </span>

            {actions}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
