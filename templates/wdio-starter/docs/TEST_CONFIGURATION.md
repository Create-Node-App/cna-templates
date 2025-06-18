# Test Configuration

This document explains how to configure and customize the WebdriverIO test setup.

## Configuration Files

The configuration is split into multiple files under the `config/` directory:

```txt
config/
├── env.ts                 # Environment variables and configuration
├── wdio.capabilities.conf.ts  # Browser capabilities configuration
├── wdio.common.conf.ts    # Common configuration shared by all environments
├── wdio.env.conf.ts       # Environment-specific configuration
├── wdio.local.conf.ts     # Local test execution configuration
├── wdio.remote.conf.ts    # Remote test execution configuration
└── wdio.suites.conf.ts    # Test suite definitions
```

## Environment Configuration

The `env.ts` file contains all environment-specific settings:

```typescript
export const env = {
  // Browser capabilities
  maxInstances: process.env.MAX_INSTANCES || 1,
  chromeInstances: process.env.CHROME || 0,
  firefoxInstances: process.env.FIREFOX || 0,
  safariInstances: process.env.SAFARI || 0,

  // Test execution
  browserVisible: process.env.BROWSER_VISIBLE === 'true',
  webdriverLogLevel: process.env.WEBDRIVER_LOGLEVEL || 'info',
  specFileRetries: process.env.WEBDRIVER_SPEC_FILE_RETRIES || 0,

  // Remote execution
  seleniumHubHost: process.env.SELENIUM_HUB_HOST || 'localhost',
  seleniumHubPort: process.env.SELENIUM_HUB_PORT || '4444',
};
```

## Browser Capabilities

Configure browser capabilities in `wdio.capabilities.conf.ts`:

```typescript
export const capabilities = {
  chrome: {
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: env.browserVisible ? [] : ['--headless'],
    },
  },
  firefox: {
    browserName: 'firefox',
    'moz:firefoxOptions': {
      args: env.browserVisible ? [] : ['-headless'],
    },
  },
};
```

## Test Suites

Define test suites in `wdio.suites.conf.ts`:

```typescript
export const suites = {
  smoke: ['./test/specs/smoke/**/*.ts'],
  regression: ['./test/specs/regression/**/*.ts'],
  ci: {
    periodic: ['./test/specs/ci/periodic/**/*.ts'],
  },
};
```

## Running Tests

### Local Execution

```bash
# Run all tests locally
<%= runCommand%> test:local

# Run specific suite
<%= runCommand%> test:local --suite smoke

# Run specific spec file
<%= runCommand%> test:local --spec "./test/specs/**/*.ts"

# Run with specific browser
FIREFOX=1 <%= runCommand%> test:local
```

### Remote Execution

```bash
# Start Selenoid
<%= runCommand%> selenoid --start --ui

# Run tests remotely
FIREFOX=1 <%= runCommand%> test:remote --suite smoke
```

## Environment Variables

| Variable                      | Description                            | Default   |
| ----------------------------- | -------------------------------------- | --------- |
| `MAX_INSTANCES`               | Maximum number of concurrent instances | 1         |
| `CHROME`                      | Number of Chrome instances             | 0         |
| `FIREFOX`                     | Number of Firefox instances            | 0         |
| `SAFARI`                      | Number of Safari instances             | 0         |
| `BROWSER_VISIBLE`             | Run browsers in visible mode           | false     |
| `WEBDRIVER_LOGLEVEL`          | Webdriver log level                    | info      |
| `WEBDRIVER_SPEC_FILE_RETRIES` | Number of retry attempts               | 0         |
| `SELENIUM_HUB_HOST`           | Selenium Hub host                      | localhost |
| `SELENIUM_HUB_PORT`           | Selenium Hub port                      | 4444      |

## Best Practices

1. **Configuration Organization**

   - Keep common settings in `wdio.common.conf.ts`
   - Use environment variables for flexible configuration
   - Document all configuration options

2. **Browser Management**

   - Use appropriate browser capabilities
   - Configure headless mode when needed
   - Set proper timeouts and retries

3. **Test Execution**

   - Use test suites for organization
   - Configure parallel execution appropriately
   - Set up proper reporting

4. **Environment Setup**
   - Use environment variables for sensitive data
   - Configure different environments properly
   - Document required setup steps
