const isCI = process.env.CI === 'true';

export const config: Partial<WebdriverIO.Config> = {
  runner: 'local',
  port: 4444,
  services: isCI
    ? []
    : [
        [
          'selenium-standalone',
          {
            installArgs: {
              drivers: {
                chromiumedge: {
                  version: 'latest',
                  baseURL: 'https://msedgedriver.microsoft.com',
                },
              },
            },
            args: {
              drivers: {
                chromiumedge: {
                  version: 'latest',
                  baseURL: 'https://msedgedriver.microsoft.com',
                },
              },
            },
          },
        ],
      ],
};
