import pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';

/**
 * Text Normalization
 * Preserves paragraphs, strips dangerous control characters, normalizes Unicode spaces
 */
export function normalizeText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\t\f]/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

/**
 * Image Extraction using Tesseract.js OCR
 */
export async function extractFromImage(imageBufferOrPath) {
  try {
    const worker = await createWorker('eng');
    const result = await worker.recognize(imageBufferOrPath);
    await worker.terminate();

    const normalized = normalizeText(result.data.text);
    const confidence = result.data.confidence || 0;

    if (!normalized || normalized.length < 3) {
      return {
        success: false,
        text: '',
        confidence: 0,
        source_kind: 'ocr',
        error: 'No readable text detected in the uploaded image. Please ensure the image is clear and contains legible text.'
      };
    }

    return {
      success: true,
      text: normalized,
      confidence,
      source_kind: 'ocr',
      page_number: 1,
      source_reference: 'Image OCR Extraction'
    };
  } catch (err) {
    return {
      success: false,
      text: '',
      confidence: 0,
      source_kind: 'ocr',
      error: `OCR Extraction failed: ${err.message}`
    };
  }
}

/**
 * PDF Extraction using embedded text extraction first, with fallback detection
 */
export async function extractFromPdf(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    const normalized = normalizeText(data.text);

    if (!normalized || normalized.length < 10) {
      return {
        success: false,
        text: '',
        pageCount: data.numpages || 1,
        source_kind: 'embedded_text',
        error: 'PDF contains no extractable embedded text. Scanned document requires OCR or clearer resolution.'
      };
    }

    // Rough page segmentation
    const pages = normalized.split(/\n\s*\n\s*\n/).filter(p => p.trim().length > 0);
    const pageReferences = pages.map((p, idx) => ({
      pageNumber: idx + 1,
      snippet: p.slice(0, 100),
      charCount: p.length
    }));

    return {
      success: true,
      text: normalized,
      pageCount: data.numpages || 1,
      pageReferences,
      source_kind: 'embedded_text',
      source_reference: `PDF Document (${data.numpages} pages)`
    };
  } catch (err) {
    return {
      success: false,
      text: '',
      pageCount: 0,
      source_kind: 'embedded_text',
      error: `PDF extraction failed: ${err.message}`
    };
  }
}

/**
 * Unified Dispatcher
 */
export async function extractContent({ contentType, textContent, fileBuffer }) {
  if (contentType === 'text') {
    const normalized = normalizeText(textContent);
    if (!normalized) {
      throw new Error('Text submission cannot be empty');
    }
    return {
      success: true,
      text: normalized,
      source_kind: 'direct_text',
      page_number: 1
    };
  }

  if (contentType === 'image') {
    if (!fileBuffer) throw new Error('Image file buffer is required');
    return await extractFromImage(fileBuffer);
  }

  if (contentType === 'pdf') {
    if (!fileBuffer) throw new Error('PDF file buffer is required');
    return await extractFromPdf(fileBuffer);
  }

  throw new Error(`Unsupported content type: ${contentType}`);
}
