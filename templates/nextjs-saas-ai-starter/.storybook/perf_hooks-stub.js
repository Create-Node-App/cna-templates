/**
 * Stub for Node's perf_hooks so server-only packages (e.g. postgres) don't break Storybook's browser bundle.
 */
const performanceStub = {
  now: () => 0,
  mark: () => {},
  measure: () => {},
  getEntriesByType: () => [],
  getEntriesByName: () => [],
  clearMarks: () => {},
  clearMeasures: () => {},
  clearResourceTimings: () => {},
};

module.exports = {
  performance: performanceStub,
  PerformanceObserver: function () {},
};
