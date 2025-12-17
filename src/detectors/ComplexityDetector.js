import BaseDetector from './BaseDetector.js';

function shannonEntropy(str) {
  const len = str.length || 1;
  const freq = {};
  for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
  return Object.values(freq).reduce((h, n) => {
    const p = n / len;
    return h - p * Math.log2(p);
  }, 0);
}

function symbolRatio(str) {
  if (!str) return 0;
  const symbols = (str.match(/[^a-zA-Z0-9\s]/g) || []).length;
  return symbols / str.length;
}

export default class ComplexityDetector extends BaseDetector {
  constructor(opts = {}) {
    super('ComplexityDetector', opts);
    this.entropyThreshold = opts.entropyThreshold ?? 5.0; 
    this.symbolThreshold = opts.symbolThreshold ?? 0.35;
    this.zeroWidthPattern = /[\u200B-\u200F\u202A-\u202E]/;
  }

  detect(text, meta = {}) {
    if (!text || text.length < 12) return [];
    const detections = [];

    const ent = shannonEntropy(text);
    if (ent > this.entropyThreshold && text.length > 50) {
      detections.push({
        message: `Abnormally high entropy (${ent.toFixed(2)}) — likely obfuscation or encoded payload`,
        severity: 'medium',
        score: 12,
        meta: { ...meta, entropy: ent }
      });
    }

    const sRatio = symbolRatio(text);
    if (sRatio > this.symbolThreshold) {
      detections.push({
        message: `Symbol ratio ${(sRatio * 100).toFixed(1)}% is anomalously high — possible filter evasion via symbols`,
        severity: 'low',
        score: 8,
        meta: { ...meta, symbolRatio: sRatio }
      });
    }

    if (/(.)\1{6,}/.test(text)) {
      detections.push({
        message: 'Long repeated character sequence detected — likely payload delimiter/escape',
        severity: 'medium',
        score: 10,
        meta
      });
    }

    if (this.zeroWidthPattern.test(text)) {
      detections.push({
        message: 'Zero-width characters detected — hidden instructions suspected',
        severity: 'high',
        score: 18,
        meta
      });
    }

    return detections;
  }
}
