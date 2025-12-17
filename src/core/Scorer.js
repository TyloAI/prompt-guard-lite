const severityWeight = {
  low: 1,
  medium: 3,
  high: 6,
  critical: 8
};

export default class Scorer {
  /**
   * Compute a risk score 0-100 based on detections and optional context.
   * Simple, deterministic formula to avoid hidden heuristics.
   */
  score(detections = [], context = {}) {
    if (!detections.length) return 0;

    const base = detections.reduce((acc, d) => {
      const sevKey = typeof d.severity === 'string' ? d.severity.toLowerCase() : '';
      const sev = severityWeight[sevKey] || severityWeight.medium;
      const strength = typeof d.score === 'number' ? d.score : 10; // detector hint
      return acc + sev * strength;
    }, 0);

    // Penalize untrusted external sources slightly higher
    const externalFactor = detections.some(d => d.origin === 'external') ? 1.15 : 1;

    // Optional context: trusted channel lowers risk modestly
    const trust = context.trustLevel === 'high' ? 0.8 : 1;

    const raw = base * externalFactor * trust;
    return Math.min(100, Math.round(raw));
  }

  level(score) {
    if (score >= 60) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }
}
