import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL || 'http://localhost:54321',
    anonKey: process.env.SUPABASE_ANON_KEY || 'dummy_anon',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_service',
  },
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY || '',
    embeddingModel: process.env.HUGGINGFACE_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2',
    rerankerModel: process.env.HUGGINGFACE_RERANKER_MODEL || 'cross-encoder/ms-marco-MiniLM-L-6-v2',
    llmModel: process.env.HUGGINGFACE_LLM_MODEL || 'meta-llama/Llama-3.2-3B-Instruct',
  },
  internalApiSecret: process.env.INTERNAL_API_SECRET || 'inkloom-internal-secret-change-in-prod',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
};

// Check if live Supabase is configured
export const isLiveSupabaseConfigured = Boolean(
  config.supabase.url &&
  !config.supabase.url.includes('localhost:54321') &&
  config.supabase.anonKey &&
  !config.supabase.anonKey.includes('dummy')
);

export const supabase = isLiveSupabaseConfigured
  ? createClient(config.supabase.url, config.supabase.serviceRoleKey || config.supabase.anonKey)
  : null;
