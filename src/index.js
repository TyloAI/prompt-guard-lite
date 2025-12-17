import Scanner from './core/Scanner.js';
import Scorer from './core/Scorer.js';
import BaseDetector from './detectors/BaseDetector.js';
import KeywordDetector from './detectors/KeywordDetector.js';
import ComplexityDetector from './detectors/ComplexityDetector.js';
import InjectionDetector from './detectors/InjectionDetector.js';
import ContextShiftDetector from './detectors/ContextShiftDetector.js';
import ToolInjectionDetector from './detectors/ToolInjectionDetector.js';
import presets from './presets/standard.js';

/**
 * Create a ready-to-ship guard instance.
 * Pass custom detectors/scorers to extend behavior.
 */
export function createDefaultGuard(options = {}) {
  const detectors = [
    new KeywordDetector({ patterns: presets.keywordPatterns, score: 9 }),
    new InjectionDetector({ patterns: presets.injectionRegex }),
    new ContextShiftDetector(),
    new ToolInjectionDetector(),
    new ComplexityDetector()
  ];

  // Allow user-supplied detectors to plug in
  if (Array.isArray(options.extraDetectors)) {
    detectors.push(...options.extraDetectors);
  }

  return new Scanner({
    detectors,
    scorer: options.scorer || new Scorer(),
    onAlert: options.onAlert,
    logger: options.logger
  });
}

export {
  Scanner,
  Scorer,
  BaseDetector,
  KeywordDetector,
  ComplexityDetector,
  InjectionDetector,
  ContextShiftDetector,
  ToolInjectionDetector,
  presets
};
