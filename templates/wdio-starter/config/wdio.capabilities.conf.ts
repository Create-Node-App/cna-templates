import {
  DisaredCapabilityName,
  getCapabilitiesMaxInstances,
  getCapabilityMaxInstances,
  getCapabilityOptionsOverride,
  getDesiredCapabilitiesNames,
  isHeadlessMode,
} from './env';

const headless = isHeadlessMode();

const maxInstances = getCapabilitiesMaxInstances();

const capabilitiesMap: Record<DisaredCapabilityName, () => WebdriverIO.Capabilities> = {
  firefox: () => ({
    maxInstances: getCapabilityMaxInstances('firefox'),
    browserName: 'firefox' as const,
    'moz:firefoxOptions': {
      args: headless ? ['-headless'] : [],
    },
  }),
  chrome: () => ({
    maxInstances: getCapabilityMaxInstances('chrome'),
    browserName: 'chrome' as const,
    'goog:chromeOptions': {
      args: headless ? ['--headless', '--window-size=1920,1080'] : ['--start-maximized'],
    },
  }),
  mobile_chrome: () => ({
    maxInstances: getCapabilityMaxInstances('mobile_chrome'),
    browserName: 'chrome' as const,
    'goog:chromeOptions': {
      args: headless ? ['--headless', '--window-size=1920,1080'] : ['--start-maximized'],
      mobileEmulation: { deviceName: 'Pixel 2 XL' },
    },
  }),
  safari: () => ({
    maxInstances: getCapabilityMaxInstances('safari'),
    browserName: 'safari' as const,
    'safari.options': {
      args: headless ? ['--headless', '--window-size=1920,1080'] : ['--window-size=1920,1080'],
    },
  }),
};

const capabilities: WebdriverIO.Capabilities[] = getDesiredCapabilitiesNames().map((name) => ({
  ...capabilitiesMap[name](),
  ...getCapabilityOptionsOverride(),
  acceptInsecureCerts: true,
}));

if (capabilities.length <= 0) {
  console.warn('No capabilities selected!');
}

export const config: Partial<WebdriverIO.Config> = {
  maxInstances,
  capabilities,
};
