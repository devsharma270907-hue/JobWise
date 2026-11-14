import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import zlib from 'zlib';
import { claudeClient } from './claudeClient.js';
import { AppError } from '../../utils/ownershipCheck.js';
import { logger } from '../../utils/logger.js';

export interface StructuredResume {
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    links?: string[];
  };
  summary?: string;
  experience: Array<{
    company: string;
    role: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    bullets: string[];
    skills?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    graduationDate?: string;
    gpa?: string;
  }>;
  skills: string[];
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  score: {
    overall: number;
    impact: number;
    brevity: number;
    atsParseability: number;
    actionableFeedback: string[];
  };
}

/**
 * Decodes standard ASCII85 streams (common in ReportLab, Illustrator, and print PDFs)
 */
function decodeAscii85(str: string): Buffer {
  str = str.replace(/^<~/, '').replace(/~>.*$/, '').replace(/\s+/g, '');
  const out: number[] = [];
  for (let i = 0; i < str.length;) {
    if (str[i] === 'z') {
      out.push(0, 0, 0, 0);
      i++;
      continue;
    }
    let count = 0;
    let val = 0;
    for (let j = 0; j < 5; j++) {
      if (i + j < str.length) {
        val = val * 85 + (str.charCodeAt(i + j) - 33);
        count++;
      } else {
        val = val * 85 + 84;
      }
    }
    for (let k = 0; k < count - 1; k++) {
      out.push((val >> (24 - k * 8)) & 0xff);
    }
    i += 5;
  }
  return Buffer.from(new Uint8Array(out)) as unknown as Buffer;
}

/**
 * Extracts plain text from decoded PostScript/PDF stream operators (Tj, TJ, ', ")
 */
function extractTextFromStream(content: string): string {
  const textBlocks: string[] = [];
  const tjRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
  let match: RegExpExecArray | null;
  while ((match = tjRegex.exec(content)) !== null) {
    const val = match[1];
    if (val) {
      textBlocks.push(val.replace(/\\([()\\])/g, '$1'));
    }
  }

  const arrayRegex = /\[(.*?)\]\s*TJ/g;
  while ((match = arrayRegex.exec(content)) !== null) {
    const inner = match[1];
    if (inner) {
      const subMatches = inner.match(/\(([^)\\]*(?:\\.[^)\\]*)*)\)/g);
      if (subMatches) {
        textBlocks.push(subMatches.map((m) => m.slice(1, -1).replace(/\\([()\\])/g, '$1')).join(' '));
      }
    }
  }

  return textBlocks.join(' ');
}

/**
 * Resilient fallback PDF stream parser for PDFs with non-standard cross-reference tables
 * or composite filters (e.g. ASCII85Decode + FlateDecode) that fail in legacy pdf-parse.
 */
function fallbackExtractPdf(buffer: Buffer): string {
  const content = buffer.toString('latin1');
  let extracted = '';
  const streamRegex = /<<([\s\S]*?)>>\s*stream\r?\n([\s\S]*?)endstream/g;
  let sMatch: RegExpExecArray | null;

  while ((sMatch = streamRegex.exec(content)) !== null) {
    const dict = sMatch[1] || '';
    const rawStream = (sMatch[2] || '').trim();
    try {
      let streamBuf: Buffer = Buffer.from(rawStream, 'latin1');
      if (dict.includes('ASCII85Decode')) {
        streamBuf = decodeAscii85(rawStream);
      }
      if (dict.includes('FlateDecode')) {
        try {
          streamBuf = zlib.inflateSync(streamBuf);
        } catch {
          streamBuf = zlib.inflateRawSync(streamBuf);
        }
      }
      const streamText = extractTextFromStream(streamBuf.toString('latin1'));
      if (streamText) extracted += streamText + '\n';
    } catch {
      // Ignore binary image streams
    }
  }

  // Also extract uncompressed literal text if stream blocks yielded insufficient content
  if (extracted.trim().length < 40) {
    const literalText = extractTextFromStream(content);
    if (literalText.length > extracted.length) {
      extracted = literalText;
    }
  }

  return extracted.trim();
}

export class ResumeParserService {
  async extractRawText(buffer: Buffer, mimeType: string): Promise<string> {
    try {
      if (mimeType === 'application/pdf') {
        // 1. Primary parser attempt via pdf-parse
        try {
          const parsedPdf = await pdfParse(buffer);
          if (parsedPdf.text && parsedPdf.text.trim().length > 30) {
            return parsedPdf.text;
          }
        } catch (pdfErr) {
          logger.warn('pdf-parse encountered parser syntax error, using resilient stream extractor fallback:', {
            error: pdfErr instanceof Error ? pdfErr.message : String(pdfErr),
          });
        }

        // 2. Fallback resilient stream extractor for ReportLab, Canva, & modern PDF.js streams
        const fallbackText = fallbackExtractPdf(buffer);
        if (fallbackText && fallbackText.trim().length > 30) {
          logger.info('Successfully extracted resume text using resilient PDF stream extractor', {
            characterCount: fallbackText.length,
          });
          return fallbackText;
        }

        throw new Error('Unable to parse readable text stream from PDF');
      }

      if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
      }

      return buffer.toString('utf8');
    } catch (error) {
      logger.error('Failed to extract raw text from resume document', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new AppError(
        'Failed to read resume document. Please check the file format.',
        422,
        'RESUME_PARSE_FAILED'
      );
    }
  }

  async parseAndStructure(
    rawText: string,
    userId?: string
  ): Promise<{ data: StructuredResume; tokensUsed: number; modelVersion: string }> {
    if (!rawText || rawText.trim().length < 50) {
      throw new AppError(
        'Resume contains insufficient text for analysis',
        422,
        'RESUME_PARSE_FAILED'
      );
    }

    const systemPrompt = `You are JobWise's expert AI Career Agent and Resume Analyst.
Your task is to parse unstructured resume text into a clean, complete, structured JSON schema, and evaluate the resume on ATS parseability, quantifiable impact, and brevity.
Generate constructive, actionable feedback points tailored to the candidate.`;

    const prompt = `Parse resume text and return structured JSON.
Resume text:
"""
${rawText}
"""

Required JSON Schema:
{
  "contactInfo": { "name": string, "email": string, "phone": string, "location": string, "links": string[] },
  "summary": string,
  "experience": [
    { "company": string, "role": string, "location": string, "startDate": string, "endDate": string, "current": boolean, "bullets": string[], "skills": string[] }
  ],
  "education": [
    { "institution": string, "degree": string, "fieldOfStudy": string, "graduationDate": string, "gpa": string }
  ],
  "skills": string[],
  "projects": [
    { "title": string, "description": string, "technologies": string[], "link": string }
  ],
  "score": {
    "overall": number (0-100),
    "impact": number (0-100),
    "brevity": number (0-100),
    "atsParseability": number (0-100),
    "actionableFeedback": string[]
  }
}`;

    return await claudeClient.generateStructuredResponse<StructuredResume>(prompt, systemPrompt, userId);
  }
}

export const resumeParserService = new ResumeParserService();
