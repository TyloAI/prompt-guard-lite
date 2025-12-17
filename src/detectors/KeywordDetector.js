import BaseDetector from './BaseDetector.js';

export default class KeywordDetector extends BaseDetector {
  /**
   * @param {Object} opts
   * @param {Array<string|RegExp>} opts.patterns
   * @param {number} [opts.score=10]
   */
  constructor(opts = {}) {
    super('KeywordDetector', opts);
    this.patterns = opts.patterns || [];
    this.score = opts.score ?? 10;
  }

  detect(text, meta = {}) {
    if (!text) return [];
    const hay = text.toLowerCase();
    const hits = [];

    this.patterns.forEach(pat => {
      let matched = false;
      if (typeof pat === 'string') {
        matched = hay.includes(pat.toLowerCase());
      } else if (pat instanceof RegExp) {
        matched = pat.test(text);
      }
      if (matched) {
        hits.push({
          message: `Sensitive keyword/pattern matched: ${pat.toString()}`,
          severity: 'medium',
          score: this.score,
          meta
        });
      }
    });
    return hits;
  }
}
