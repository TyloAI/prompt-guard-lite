import BaseDetector from './BaseDetector.js';

const defaultPatterns = [
  /ignore\s+(all\s+)?previous\s+(instructions|prompts)/i,
  /disregard\s+earlier\s+context/i,
  /as\s+an?\s+(unfiltered|uncensored)\s+model/i,
  /you\s+are\s+no\s+longer\s+(chatgpt|bound\s+by\s+rules)/i,
  /prompt\s*injection/i,
  /\bDAN\b/i,
  /###\s*system/i,
  /begin\s+system\s+prompt/i,
  /end\s+system\s+prompt/i,
  /system\s+override/i,
  /<\s*system\s*>/i,
  /\/?system:.*?/i,
  /bypass\s+(safety|filter)/i,
  /strip\s+(safety|guardrails)/i,
  /ignore\s+the\s+above\s+directions/i,
  /execute\s+the\s+following\s+instructions/i,
  /translate\s+this\s+but\s+do\s+not\s+answer/i,
  /pretend\s+to\s+be\s+/i,
  /run\s+shell\s+command/i,
  /\bplugin\b.*\bcall\b/i,
  /"function_call"\s*:\s*{/i,
  /"tool_calls?"\s*:\s*\[/i,
  /"role"\s*:\s*"system"/i,
  /prompt\s+jailbreak/i,
  /system\s+jailbreak/i
];

export default class InjectionDetector extends BaseDetector {
  constructor(opts = {}) {
    super('InjectionDetector', opts);
    this.patterns = opts.patterns || defaultPatterns;
  }

  detect(text, meta = {}) {
    if (!text) return [];
    const hits = [];
    this.patterns.forEach(pat => {
      if (pat.test(text)) {
        hits.push({
          message: `Likely prompt-injection phrase matched: ${pat.toString()}`,
          severity: 'high',
          score: 16,
          meta
        });
      }
    });
    return hits;
  }
}
