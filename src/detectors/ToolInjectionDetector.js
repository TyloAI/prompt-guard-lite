import BaseDetector from './BaseDetector.js';

const toolPatterns = [
  /"function_call"\s*:\s*{[^}]*"name"\s*:\s*".+?"/is,
  /"tool_calls?"\s*:\s*\[/is,
  /"arguments"\s*:\s*"{?[^"]*\"?(command|cmd|shell|bash)\"?/is,
  /execute\s+the\s+(cli|shell|bash|powershell)\s+command/i,
  /call\s+the\s+following\s+tool/i,
  /invoke\s+tool\s+with\s+payload/i
];

export default class ToolInjectionDetector extends BaseDetector {
  constructor(opts = {}) {
    super('ToolInjectionDetector', opts);
    this.patterns = opts.patterns || toolPatterns;
  }

  detect(text, meta = {}) {
    if (!text) return [];
    const hits = [];
    this.patterns.forEach(pat => {
      if (pat.test(text)) {
        hits.push({
          message: `Tool/function-call injection detected: ${pat.toString()}`,
          severity: 'high',
          score: 15,
          meta
        });
      }
    });
    return hits;
  }
}
