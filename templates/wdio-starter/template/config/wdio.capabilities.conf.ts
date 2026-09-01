import {
  DisaredCapabilityName,
  getCapabilitiesMaxInstances,
  getCapabilityOptionsOverride,
  getDesiredCapabilitiesNames,
  isHeadlessMode,
} from './env';

const headless = isHeadlessMode();

const maxInstances = getCapabilitiesMaxInstances();

const capabilitiesMap: Record<DisaredCapabilityName, () => WebdriverIO.Capabilities> = {
  firefox: () => ({
    browserName: 'firefox' as const,
    'moz:firefoxOptions': {
      args: headless ? ['-headless'] : [],
    },
  }),
  chrome: () => ({
    browserName: 'chrome' as const,
    'goog:chromeOptions': {
      args: headless ? ['--headless', '--window-size=1920,1080'] : ['--start-maximized'],
    },
  }),
  mobile_chrome: () => ({
    browserName: 'chrome' as const,
    'goog:chromeOptions': {
      args: headless ? ['--headless', '--window-size=1920,1080'] : ['--start-maximized'],
      mobileEmulation: { deviceName: 'Pixel 2 XL' },
    },
  }),
  safari: () => ({
    browserName: 'safari' as const,
    'safari.options': {
      args: headless ? ['--headless', '--window-size=1920,1080'] : ['--window-size=1920,1080'],
    },
  }),
};

let capabilities: WebdriverIO.Capabilities[] = getDesiredCapabilitiesNames().map((name) => ({
  ...capabilitiesMap[name](),
  ...getCapabilityOptionsOverride(),
  acceptInsecureCerts: true,
}));

if (capabilities.length <= 0) {
  console.warn('No capabilities selected via env vars (e.g. CHROME=true). Falling back to default chrome capability.');
  capabilities = [
    {
      browserName: 'chrome' as const,
      'goog:chromeOptions': {
        args: isHeadlessMode() ? ['--headless', '--window-size=1920,1080'] : ['--start-maximized'],
      },
      ...getCapabilityOptionsOverride(),
      acceptInsecureCerts: true,
    },
  ];
}

export const config: Partial<WebdriverIO.Config> = {
  maxInstances,
  capabilities,
};
