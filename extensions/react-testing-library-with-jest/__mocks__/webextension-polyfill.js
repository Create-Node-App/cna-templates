// Manual mock for webextension-polyfill used by Jest.
// Vitest uses vi.mock in vitest.setup; Jest uses this manual mock.
const mockFn = () => {
  const fn = (...args) => undefined;
  fn.mockResolvedValue = (v) => { fn._res = v; return fn; };
  fn.mockReturnValue = (v) => fn;
  fn.mockImplementation = () => fn;
  // Make it a jest.fn if jest is available
  if (typeof jest !== 'undefined' && jest.fn) {
    const j = jest.fn().mockResolvedValue({});
    // copy mock methods
    fn.mockResolvedValue = j.mockResolvedValue.bind(j);
    fn.mockReturnValue = j.mockReturnValue.bind(j);
    return j;
  }
  return fn;
};
// Use jest.fn when available, otherwise fallback
const createMockFn = () => {
  if (typeof jest !== 'undefined' && jest.fn) return jest.fn().mockResolvedValue({});
  return mockFn();
};

module.exports = {
  default: {
    storage: {
      sync: { get: createMockFn(), set: createMockFn() },
      local: { get: createMockFn(), set: createMockFn() },
    },
    runtime: {
      sendMessage: createMockFn(),
      onMessage: { addListener: createMockFn() },
      openOptionsPage: createMockFn(),
    },
  },
  storage: {
    sync: { get: createMockFn(), set: createMockFn() },
    local: { get: createMockFn(), set: createMockFn() },
  },
  runtime: {
    sendMessage: createMockFn(),
    onMessage: { addListener: createMockFn() },
    openOptionsPage: createMockFn(),
  },
};
// Also support ES default
module.exports.__esModule = true;
