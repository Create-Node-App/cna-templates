const driverOpts: Record<string, unknown> = {
  drivers: {
    chromiumedge: {
      version: 'latest',
      baseURL: 'https://msedgedriver.microsoft.com',
    },
  },
};

let seleniumProcess: import('child_process').ChildProcess | null = null;

export const config: Partial<WebdriverIO.Config> = {
  runner: 'local',
  port: 4444,
  onPrepare: async () => {
    console.log('// Test execution has started //');
    if (process.env.CI === 'true') return;
    const selenium = await import('selenium-standalone');
    await selenium.install(driverOpts);
    seleniumProcess = await selenium.start(driverOpts);
  },
  onComplete: () => {
    console.log('// Test execution has completed //');
    if (seleniumProcess) {
      seleniumProcess.kill();
      seleniumProcess = null;
    }
  },
};
