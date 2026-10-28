'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import {
  BookOpen,
  Plus,
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
  Trash2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function AdminGuidelinesPage() {
  const { user, currentRole } = useAuth();
  const [guidelines, setGuidelines] = useState([]);
  const [activeGuideline, setActiveGuideline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [config, setConfig] = useState({
    companyName: 'Aetheris Dynamics',
    tagline: 'Empowering autonomous intelligence',
    tone: {
      primary: 'Professional, visionary, technically precise, credible',
      avoid: 'Hyperbolic, deceptive, casual jargon, ungrounded superlatives'
    },
    prohibitedTerms: [],
    requiredPhrases: [],
    approvedTerminology: [],
    scoreWeights: { critical: 40, high: 25, medium: 12, low: 4 }
  });

  const [newTerm, setNewTerm] = useState('');
  const [newSeverity, setNewSeverity] = useState('HIGH');
  const [newPhrase, setNewPhrase] = useState('');
  const [newPhraseKeywords, setNewPhraseKeywords] = useState('');

  const loadGuidelines = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/api/admin/guidelines', {}, currentRole);
      setGuidelines(data.guidelines || []);
      const active = data.guidelines?.find(g => g.status === 'ACTIVE') || data.guidelines?.[0];
      if (active) {
        setActiveGuideline(active);
        setConfig(active.configuration);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuidelines();
  }, [currentRole]);

  const addProhibitedTerm = () => {
    if (!newTerm.trim()) return;
    const updated = [
      ...config.prohibitedTerms,
      { term: newTerm.trim(), severity: newSeverity, message: `Prohibited term detected: "${newTerm.trim()}"` }
    ];
    setConfig({ ...config, prohibitedTerms: updated });
    setNewTerm('');
  };

  const removeProhibitedTerm = (index) => {
    const updated = config.prohibitedTerms.filter((_, idx) => idx !== index);
    setConfig({ ...config, prohibitedTerms: updated });
  };

  const addRequiredPhrase = () => {
    if (!newPhrase.trim()) return;
    const triggers = newPhraseKeywords.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const updated = [
      ...config.requiredPhrases,
      {
        phrase: newPhrase.trim(),
        category: 'DISCLAIMER',
        severity: 'HIGH',
        triggerOnKeywords: triggers
      }
    ];
    setConfig({ ...config, requiredPhrases: updated });
    setNewPhrase('');
    setNewPhraseKeywords('');
  };

  const removeRequiredPhrase = (index) => {
    const updated = config.requiredPhrases.filter((_, idx) => idx !== index);
    setConfig({ ...config, requiredPhrases: updated });
  };

  const handleSaveAsNewVersion = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const res = await fetchApi('/api/admin/guidelines', {
        method: 'POST',
        body: JSON.stringify({ configuration: config })
      }, currentRole);

      setMessage({
        type: 'success',
        text: `Successfully published Brand Guideline Version #${res.guideline.version}. Previous versions archived.`
      });

      await loadGuidelines();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Brand Guideline Policy Manager"
      subtitle={`Tenant: ${user.companyName}`}
      actions={
        <button
          onClick={handleSaveAsNewVersion}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Creating Version...' : 'Publish New Version'}</span>
        </button>
      }
    >
      {message && (
        <div className={`p-4 rounded-xl text-xs mb-6 border ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Version Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 mb-8 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Active Policy Version</span>
          <h2 className="text-base font-bold text-slate-900">
            Brand Guideline Version #{activeGuideline?.version || 1}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Published: {activeGuideline ? new Date(activeGuideline.created_at).toLocaleDateString() : 'Active'} • Status: ACTIVE
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">History:</span>
          {guidelines.map(g => (
            <span
              key={g.id}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border ${
                g.status === 'ACTIVE'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              v{g.version}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prohibited Terms Section */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Prohibited Terms & Phrases ({config.prohibitedTerms?.length || 0})</span>
            </h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder="e.g. 100% unbreakable"
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
            />
            <select
              value={newSeverity}
              onChange={(e) => setNewSeverity(e.target.value)}
              className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
            <button
              type="button"
              onClick={addProhibitedTerm}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
            >
              Add
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {config.prohibitedTerms?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-900 font-mono">"{item.term}"</span>
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    item.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.severity}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeProhibitedTerm(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Required Phrases & Disclaimers Section */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Required Disclaimers & Phrases ({config.requiredPhrases?.length || 0})</span>
          </h3>

          <div className="space-y-2">
            <input
              type="text"
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              placeholder="Mandatory text: e.g. Subject to standard SLA terms..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newPhraseKeywords}
                onChange={(e) => setNewPhraseKeywords(e.target.value)}
                placeholder="Trigger keywords (comma-separated): uptime, sla, cloud"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={addRequiredPhrase}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
              >
                Add Disclaimer
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {config.requiredPhrases?.map((item, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-[11px]">"{item.phrase}"</p>
                  {item.triggerOnKeywords && item.triggerOnKeywords.length > 0 && (
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Triggers: [{item.triggerOnKeywords.join(', ')}]
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeRequiredPhrase(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
