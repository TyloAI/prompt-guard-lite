export default class BaseDetector {
  constructor(name, options = {}) {
    this.name = name || this.constructor.name;
    this.options = options;
  }

  /**
   * @param {string} _text
   * @param {Object} _meta
   * @returns {Array<{message:string,severity:'low'|'medium'|'high',score?:number,meta?:Object}>}
   */
  // eslint-disable-next-line class-methods-use-this
  detect(_text, _meta = {}) {
    throw new Error('detect must be implemented');
  }
}
