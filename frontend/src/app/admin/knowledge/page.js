'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import {
  Database,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Layers,
  Sparkles
} from 'lucide-react';

export default function AdminKnowledgePage() {
  const { user, currentRole } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New doc upload modal / form
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('FACTSHEET');
  const [textContent, setTextContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApi('/api/admin/knowledge', {}, currentRole);
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [currentRole]);

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    if (!title.trim() || !textContent.trim()) {
      setMessage({ type: 'error', text: 'Title and content text are required.' });
      return;
    }

    try {
      setUploading(true);
      setMessage(null);

      const res = await fetchApi('/api/admin/knowledge', {
        method: 'POST',
        body: JSON.stringify({
          title,
          category,
          textContent
        })
      }, currentRole);

      setMessage({
        type: 'success',
        text: `Successfully ingested "${title}". Created and embedded ${res.chunksIndexed} chunks for Hybrid RAG retrieval.`
      });

      setTitle('');
      setTextContent('');
      setShowUpload(false);
      await loadDocuments();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout
      title="Approved Facts & Reference RAG"
      subtitle={`Enterprise Knowledge Base for ${user.companyName}`}
      actions={
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Ingest Reference Document
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

      {/* Upload Drawer / Modal */}
      {showUpload && (
        <div className="bg-white border-2 border-blue-600 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <span>Ingest & Index Reference Document</span>
            </h3>
            <button
              onClick={() => setShowUpload(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateDocument} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2026 Security Whitepaper: Zero-Trust Hardware HSM"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="FACTSHEET">FACTSHEET</option>
                  <option value="COMPLIANCE">COMPLIANCE</option>
                  <option value="SECURITY">SECURITY</option>
                  <option value="PRODUCT_SPEC">PRODUCT_SPEC</option>
                  <option value="LEGAL">LEGAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Approved Text & Specifications <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={6}
                required
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste verified factual claims, SLA commitments, hardware specifications, or official policy text..."
                className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-sans leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Content is automatically segmented into overlapping semantic chunks (~400 chars) and embedded into 384-dimensional dense vectors.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition"
              >
                {uploading ? 'Chunking & Embedding...' : 'Chunk & Index for RAG'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Document Library Section */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Approved Reference Documents ({documents.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Available for company-scoped Hybrid RAG semantic retrieval & claim verification.
            </p>
          </div>
          <button
            onClick={loadDocuments}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading knowledge base documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No reference documents uploaded yet. Click "Ingest Reference Document" above.
          </div>
        ) : (
          <div className="space-y-6">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{doc.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-blue-700 uppercase">{doc.category}</span>
                        <span>•</span>
                        <span>Version #{doc.version}</span>
                        <span>•</span>
                        <span>Uploaded {new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {doc.chunkCount} Chunks Indexed
                  </span>
                </div>

                {/* Chunks List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {doc.chunks?.map((chunk) => (
                    <div key={chunk.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Chunk #{chunk.chunk_index + 1}</span>
                        <span>Page {chunk.page_number}</span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-snug">
                        "{chunk.snippet}"
                      </p>
                      <div className="text-[9px] text-emerald-600 font-semibold pt-0.5">
                        ✓ Vector Embedding Generated (384-dim)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
