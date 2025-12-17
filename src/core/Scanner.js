import Scorer from './Scorer.js';

/**
 * Scanner orchestrates detectors, scoring, and alerting.
 * It is intentionally synchronous to stay lightweight for runtime / edge usage.
 */
export default class Scanner {
  /**
   * @param {Object} opts
   * @param {Array} opts.detectors list of detector instances
   * @param {Scorer} [opts.scorer] optional scorer, defaults to built-in
   * @param {Function} [opts.onAlert] callback(result) when risk level >= medium
   * @param {Object} [opts.logger] logger with info/warn methods (console compatible)
   */
  constructor(opts = {}) {
    this.detectors = opts.detectors || [];
    this.scorer = opts.scorer || new Scorer();
    this.onAlert = typeof opts.onAlert === 'function' ? opts.onAlert : null;
    this.logger = opts.logger || console;
    this.maxInputLength = opts.maxInputLength || 20000; // chars
    this.maxExternal = opts.maxExternal || 32; // max external segments scanned
  }

  #truncate(text) {
    if (typeof text !== 'string') return '';
    if (text.length <= this.maxInputLength) return text;
    const truncated = text.slice(0, this.maxInputLength);
    this.logger?.warn?.(
      `[PromptGuard] input truncated to ${this.maxInputLength} chars to mitigate ReDoS/DoS risk`
    );
    return truncated;
  }

  /**
   * Add a detector at runtime.
   * @param {BaseDetector} detector
   */
  use(detector) {
    this.detectors.push(detector);
  }

  /**
   * Scan user input plus optional external content (indirect injection vectors).
   * @param {string} text user prompt
   * @param {Object} [options]
   * @param {Array<{source:string,content:string}>} [options.external] external strings that may carry hidden instructions
   * @param {Object} [options.context] arbitrary metadata (user id, channel, etc.)
   * @returns {{detections:Array,score:number,level:string}}
   */
  scan(text, options = {}) {
    const external = (options.external || []).slice(0, this.maxExternal);
    const ctx = options.context || {};
    const detections = [];

    const primary = this.#truncate(text);

    // Primary text
    this.detectors.forEach(det => {
      const hits = det.detect(primary, { origin: 'input', context: ctx }) || [];
      hits.forEach(h => detections.push({ ...h, origin: 'input', detector: det.name }));
    });

    // Indirect / supply chain input
    external.forEach(({ source, content }) => {
      this.detectors.forEach(det => {
        const hits =
          det.detect(this.#truncate(content), { origin: 'external', source, context: ctx }) || [];
        hits.forEach(h =>
          detections.push({ ...h, origin: 'external', source, detector: det.name })
        );
      });
    });

    const score = this.scorer.score(detections, ctx);
    const level = this.scorer.level(score);
    const result = { detections, score, level };

    if (detections.length && this.logger?.info) {
      this.logger.info(
        `[PromptGuard] hits=${detections.length}, level=${level}, score=${score}`
      );
    }

    if (this.onAlert && (level === 'medium' || level === 'high')) {
      try {
        this.onAlert(result);
      } catch (err) {
        this.logger?.warn?.('onAlert handler failed', err);
      }
    }

    return result;
  }
}
