'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';

export default function SubmitPage() {
  const router = useRouter();
  const { currentRole } = useAuth();

  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'image' | 'pdf'
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [campaignTag, setCampaignTag] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10 MB limit.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please provide a submission title.');
      return;
    }

    if (activeTab === 'text' && !textContent.trim()) {
      setErrorMessage('Please provide copy text to evaluate.');
      return;
    }

    if ((activeTab === 'image' || activeTab === 'pdf') && !selectedFile) {
      setErrorMessage(`Please upload a valid ${activeTab.toUpperCase()} file.`);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      setSubmitProgress('Extracting content and running OCR text normalization...');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('contentType', activeTab);
      if (campaignTag) formData.append('campaignTag', campaignTag);

      if (activeTab === 'text') {
        formData.append('textContent', textContent);
      } else {
        formData.append('file', selectedFile);
      }

      setSubmitProgress('Performing Hybrid RAG (pgvector + Lexical BM25) & RRF fusion...');
      
      const res = await fetchApi('/api/submissions', {
        method: 'POST',
        body: formData
      }, currentRole);

      setSubmitProgress('Running Jev Decision-Support scoring & LLM explanations...');
      
      setTimeout(() => {
        if (res.submission?.id) {
          router.push(`/submissions/${res.submission.id}`);
        } else {
          router.push('/dashboard');
        }
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || 'Submission failed. Please check parameters and try again.');
      setSubmitting(false);
      setSubmitProgress('');
    }
  };

  const loadPreset = (type) => {
    if (type === 'compliant') {
      setTitle('Q3 Edge Latency Launch Announcement');
      setTextContent('Announcing Aetheris Neural Mesh™ edge inference capabilities. Experience sub-millisecond edge latency with 99.99% Enterprise SLA. Subject to standard SLA terms and regional availability.');
      setCampaignTag('Product Launch Q3');
    } else if (type === 'high_risk') {
      setTitle('AMR-500 Logistics Robot Press Release');
      setTextContent('Our revolutionary AMR-500 logistics robot is the best in the world for smart warehousing. It features full autonomous navigation at cheap operational costs without needing human intervention.');
      setCampaignTag('Press Release');
    } else if (type === 'critical') {
      setTitle('Social Campaign: Unbreakable Cloud Security');
      setTextContent('Our cloud cluster has guaranteed 100% uptime and is mathematically unhackable. It works like magic for mission critical operations.');
      setCampaignTag('Social Media');
    }
  };

  return (
    <DashboardLayout
      title="Submit Content"
      subtitle="Unified Text, Image & PDF Brand Audit"
    >
      <div className="max-w-4xl mx-auto">
        {/* Preset Helper Bar */}
        <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span><strong>Quick Presets:</strong> Test how the Jev compliance engine audits different risk tiers:</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => { setActiveTab('text'); loadPreset('compliant'); }}
              className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-2xs"
            >
              Compliant (Low)
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('text'); loadPreset('high_risk'); }}
              className="px-2.5 py-1 text-[11px] font-semibold rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition shadow-2xs"
            >
              High Risk (Review)
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('text'); loadPreset('critical'); }}
              className="px-2.5 py-1 text-[11px] font-semibold rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition shadow-2xs"
            >
              Critical Risk
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl px-4 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'text'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" /> Text Submission
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'image'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Image (OCR Recognition)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'pdf'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> PDF Document
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-b-xl rounded-t-none border border-slate-200/80 shadow-xs space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title Field */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Submission Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Launch Copy: Aetheris Neural Mesh"
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-900 placeholder-slate-400"
            />
            <p className="text-[11px] text-slate-500 mt-1">Title is evaluated against brand tone and length guidelines.</p>
          </div>

          {/* Campaign Tag (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campaign / Channel Tag <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={campaignTag}
              onChange={(e) => setCampaignTag(e.target.value)}
              placeholder="e.g. Social Media, Press Release, Website Landing"
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* TAB 1: Direct Text */}
          {activeTab === 'text' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Content Copy <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {textContent.length} characters
                </span>
              </div>
              <textarea
                rows={8}
                required
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste marketing copy, press releases, product features, or promotional text here..."
                className="w-full p-3.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-900 placeholder-slate-400 font-sans leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Direct text bypasses OCR and runs immediately through Hybrid RAG, Deterministic Rules, and Jev Scoring.
              </p>
            </div>
          )}

          {/* TAB 2: Image with OCR */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Upload Image Graphic <span className="text-rose-500">*</span>
              </label>

              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center bg-slate-50/50 transition">
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-800 mb-1">
                  Drag and drop image here, or browse from computer
                </p>
                <p className="text-[11px] text-slate-500 mb-3">
                  Supports PNG, JPG, and JPEG (Max 10 MB). Tesseract.js will extract visible text.
                </p>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer hover:bg-blue-700 transition shadow-xs">
                  <span>Browse Image</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedFile && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {filePreview && (
                      <img src={filePreview} alt="Preview" className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {(selectedFile.size / 1024).toFixed(1)} KB — Tesseract OCR Ready
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Ready
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PDF Document */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Upload PDF Document <span className="text-rose-500">*</span>
              </label>

              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center bg-slate-50/50 transition">
                <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-800 mb-1">
                  Drag and drop PDF document here, or browse files
                </p>
                <p className="text-[11px] text-slate-500 mb-3">
                  Extracts embedded text first; falls back to OCR for scanned pages (Max 10 MB).
                </p>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer hover:bg-blue-700 transition shadow-xs">
                  <span>Browse PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedFile && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB — PDF Parser Ready
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Ready
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Submit Action & Honest Progress */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              {submitting ? (
                <div className="flex items-center gap-2 text-blue-700 font-medium">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>{submitProgress}</span>
                </div>
              ) : (
                <span>All submissions are securely logged and evaluated against active company policies.</span>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold text-white shadow-xs transition flex items-center gap-2 ${
                submitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Running Governance Pipeline...' : 'Submit & Analyze'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
