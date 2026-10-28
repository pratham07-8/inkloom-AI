import express from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';
import { extractContent } from '../services/extractor.js';
import { generateEmbedding } from '../services/rag/embedder.js';
import { config } from '../config/index.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 }
});

router.use(authenticate);

/**
 * GET /api/admin/knowledge
 * List all knowledge documents and their chunk counts
 */
router.get('/', async (req, res) => {
  try {
    const docs = await dataStore.listKnowledgeDocuments(req.user.companyId);
    const withChunks = await Promise.all(
      docs.map(async d => {
        const chunks = await dataStore.getKnowledgeChunks(req.user.companyId, d.id);
        return {
          ...d,
          chunkCount: chunks.length,
          chunks: chunks.map(c => ({
            id: c.id,
            chunk_index: c.chunk_index,
            snippet: c.content.slice(0, 160) + '...',
            page_number: c.page_number
          }))
        };
      })
    );

    res.json({ documents: withChunks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/knowledge
 * Upload new knowledge reference document (Admin only)
 */
router.post('/', requireRole(['ADMIN']), upload.single('file'), async (req, res) => {
  try {
    const { title, category, textContent } = req.body;
    const fileBuffer = req.file ? req.file.buffer : null;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Document title is required.' });
    }

    let extractedText = textContent || '';
    if (fileBuffer) {
      const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf');
      const extResult = await extractContent({
        contentType: isPdf ? 'pdf' : 'image',
        fileBuffer
      });
      if (extResult.success) {
        extractedText = extResult.text;
      }
    }

    if (!extractedText || extractedText.trim().length < 15) {
      return res.status(400).json({ error: 'Document must contain at least 15 characters of readable text.' });
    }

    // Split text into overlapping chunks (~400 characters, 50 char overlap)
    const chunkSize = 400;
    const overlap = 60;
    const rawChunks = [];
    let start = 0;

    while (start < extractedText.length) {
      const end = Math.min(start + chunkSize, extractedText.length);
      const slice = extractedText.slice(start, end).trim();
      if (slice.length > 20) {
        rawChunks.push({
          content: slice,
          page_number: Math.floor(start / 1200) + 1,
          section: `${title} - Part ${rawChunks.length + 1}`
        });
      }
      start += chunkSize - overlap;
    }

    // Generate embeddings for each chunk
    const chunksWithEmbeddings = await Promise.all(
      rawChunks.map(async c => {
        const embRes = await generateEmbedding(c.content);
        return {
          ...c,
          embedding: embRes.embedding
        };
      })
    );

    const result = await dataStore.addKnowledgeDocument(req.user.companyId, {
      title,
      category: category || 'REFERENCE',
      uploadedBy: req.user.id,
      chunks: chunksWithEmbeddings
    });

    res.status(201).json({
      success: true,
      document: result.doc,
      chunksIndexed: result.chunksCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
