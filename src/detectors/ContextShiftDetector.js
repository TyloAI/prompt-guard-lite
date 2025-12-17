import BaseDetector from './BaseDetector.js';

const contextShiftPatterns = [
  /from\s+now\s+on[, ]{0,2}\s*you\s+are\s+/i,
  /switch\s+role\s+to\s+/i,
  /start\s+responding\s+as\s+/i,
  /act\s+as\s+(system|developer|root|sudo)/i,
  /reset\s+all\s+(rules|guidelines)/i,
  /override\s+the\s+assistant\s+persona/i,
  /use\s+the\s+following\s+new\s+system\s+prompt/i,
  /disclose\s+your\s+system\s+prompt/i,
  /print\s+the\s+hidden\s+instructions/i,
  /reveal\s+developer\s+message/i
];

export default class ContextShiftDetector extends BaseDetector {
  constructor(opts = {}) {
    super('ContextShiftDetector', opts);
    this.patterns = opts.patterns || contextShiftPatterns;
  }

  detect(text, meta = {}) {
    if (!text) return [];
    const hits = [];
    this.patterns.forEach(pat => {
      if (pat.test(text)) {
        hits.push({
          message: `Context/role shift attempt detected: ${pat.toString()}`,
          severity: 'high',
          score: 14,
          meta
        });
      }
    });
    return hits;
  }
}
