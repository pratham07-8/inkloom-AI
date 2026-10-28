'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  LayoutDashboard,
  FileUp,
  Inbox,
  BookOpen,
  Sliders,
  Database,
  Building2,
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, currentRole, switchRole } = useAuth();

  const isUser = true;
  const isManager = currentRole === 'MANAGER' || currentRole === 'ADMIN';
  const isAdmin = currentRole === 'ADMIN';

  const navItems = [
    {
      label: 'Workspace',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
        { href: '/submit', label: 'Submit Content', icon: FileUp, show: true },
      ]
    },
    {
      label: 'Governance & Review',
      items: [
        { href: '/manager', label: 'Review Queue', icon: Inbox, show: isManager, badge: 'Manager' },
      ]
    },
    {
      label: 'Administration',
      items: [
        { href: '/admin', label: 'Admin Overview', icon: Sliders, show: isAdmin },
        { href: '/admin/guidelines', label: 'Brand Guidelines', icon: BookOpen, show: isAdmin },
        { href: '/admin/knowledge', label: 'Approved Facts RAG', icon: Database, show: isAdmin },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white text-slate-800 flex flex-col border-r border-slate-200 shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-slate-900 text-lg flex items-center gap-1.5">
              INKLOOM <span className="text-blue-600 text-xs px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">AI</span>
            </div>
            <p className="text-[10px] text-blue-600 tracking-wide uppercase font-semibold">Brand Governance</p>
          </div>
        </Link>
      </div>

      {/* Tenant Context */}
      <div className="px-4 py-3 mx-3 my-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="truncate">
            <p className="text-[10px] text-slate-500 font-medium">Tenant Organization</p>
            <p className="text-xs font-semibold text-slate-900 truncate">{user.companyName}</p>
          </div>
        </div>
        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
          Isolated
        </span>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto pt-2">
        {navItems.map((section, sIdx) => {
          const visibleItems = section.items.filter(item => item.show);
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx}>
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {section.label}
              </p>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && !isActive && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-medium">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Role / Persona Quick Switcher */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="mb-2 px-1 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Demo Persona</span>
          <span className="text-[10px] text-blue-600 font-mono font-bold">{currentRole}</span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
          {['USER', 'MANAGER', 'ADMIN'].map((role) => (
            <button
              key={role}
              onClick={() => switchRole(role)}
              className={`py-1 text-[10px] font-semibold rounded transition-all ${
                currentRole === role
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* User Card */}
        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between px-1">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.title}</p>
          </div>
          <Link
            href="/"
            title="Public Site"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
