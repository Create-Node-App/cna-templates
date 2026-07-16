const isCI = process.env.CI === 'true';

export const config: Partial<WebdriverIO.Config> = {
  runner: 'local',
  port: 4444,
  services: isCI ? [] : ['selenium-standalone'],
};
