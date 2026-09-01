# Running Tests

This document explains how to run tests in different environments and configurations.

## Prerequisites

### Required Dependencies

- **Node.js**: Version 18 or later
- **OpenJDK**: Version 11 JRE (for local execution)
- **Browser Drivers**: ChromeDriver, GeckoDriver (for local execution)

### Installation

1. **Node.js**

   ```bash
   # Using fnm (recommended)
   fnm install 18
   fnm use 18
   ```

2. **OpenJDK**

   ```bash
   # Linux
   sudo apt install openjdk-11-jre-headless

   # macOS
   brew tap AdoptOpenJDK/openjdk
   brew install adoptopenjdk11-jre

   # Windows
   choco install adoptopenjdk11jre
   ```

3. **Project Dependencies**

   ```bash
   <%= installCommand%>
   ```

## Running Tests Locally

### Basic Commands

```bash
# Run all tests
<%= runCommand%> test:local

# Run specific suite
<%= runCommand%> test:local --suite smoke

# Run specific spec file
<%= runCommand%> test:local --spec "./test/specs/**/*.ts"
```

### Browser Selection

Control which browsers to use with environment variables:

```bash
# Run with Chrome only
CHROME=1 <%= runCommand%> test:local

# Run with Firefox only
FIREFOX=1 <%= runCommand%> test:local

# Run with multiple browsers
CHROME=1 FIREFOX=1 <%= runCommand%> test:local
```

### Browser Visibility

Control browser visibility:

```bash
# Run with visible browser
BROWSER_VISIBLE=true <%= runCommand%> test:local

# Run in headless mode (default)
<%= runCommand%> test:local
```

## Running Tests Remotely

### Using Selenoid

1. **Start Selenoid**

   ```bash
   # Start Selenoid with UI
   <%= runCommand%> selenoid --start --ui

   # Access Selenoid UI at http://localhost:8080
   ```

2. **Run Tests**

   ```bash
   # Run tests remotely
   <%= runCommand%> test:remote

   # Run specific suite remotely
   <%= runCommand%> test:remote --suite smoke

   # Run with specific browser
   FIREFOX=1 <%= runCommand%> test:remote
   ```

### Custom Selenium Hub

Configure a custom Selenium Hub:

```bash
# Set custom hub host and port
SELENIUM_HUB_HOST=selenium.example.com
SELENIUM_HUB_PORT=4444
export SELENIUM_HUB_HOST SELENIUM_HUB_PORT

# Run tests
<%= runCommand%> test:remote
```

## Test Execution Options

### Parallel Execution

Control parallel execution:

```bash
# Run up to 3 instances
MAX_INSTANCES=3 <%= runCommand%> test:local

# Run multiple browsers in parallel
CHROME=2 FIREFOX=2 <%= runCommand%> test:local
```

### Retry Failed Tests

Configure test retries:

```bash
# Retry failed tests 3 times
WEBDRIVER_SPEC_FILE_RETRIES=3 <%= runCommand%> test:local
```

### Logging

Configure logging:

```bash
# Set log level
WEBDRIVER_LOGLEVEL=debug <%= runCommand%> test:local

# Save logs to file
OUTPUT_DIR=./logs <%= runCommand%> test:local
```

## CI/CD Integration

### GitHub Actions

Example workflow:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: <%= installCommand%>
      - run: <%= runCommand%> test:remote
```

### Jenkins Pipeline

Example pipeline:

```groovy
pipeline {
    agent any
    stages {
        stage('Test') {
            steps {
                sh '<%= installCommand%>'
                sh '<%= runCommand%> test:remote'
            }
        }
    }
}
```

## Troubleshooting

### Common Issues

1. **Browser Driver Issues**

   - Ensure correct driver version
   - Check browser compatibility
   - Verify driver installation

2. **Connection Issues**

   - Check Selenium Hub connection
   - Verify network settings
   - Check firewall rules

3. **Performance Issues**
   - Adjust parallel execution
   - Optimize test suite
   - Check resource usage

### Getting Help

If you encounter issues:

1. Check the [WebdriverIO documentation](https://webdriver.io/docs/configurationfile)
2. Search existing issues
3. Ask in the [WebdriverIO Discord](https://discord.webdriver.io)
