# Project Structure

This document outlines the structure of the WebdriverIO test project.

## Directory Structure

```txt
wdio-starter/
├── bin/                    # Executable scripts
├── config/                 # WebdriverIO configuration files
│   ├── wdio.conf.js       # Main configuration file
│   └── wdio.*.conf.js     # Environment-specific configurations
├── test/                  # Test files
│   ├── specs/            # Test specifications
│   ├── pageobjects/      # Page Object Models
│   └── support/          # Support files and utilities
├── .babelrc              # Babel configuration
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies and scripts
```

## Key Directories

### `bin/`

Contains executable scripts for running tests and other utilities.

### `config/`

Contains WebdriverIO configuration files:

- `wdio.conf.js`: Main configuration file
- `wdio.*.conf.js`: Environment-specific configurations (e.g., `wdio.chrome.conf.js`)

### `test/`

Main directory for test files:

- `specs/`: Contains test specifications
- `pageobjects/`: Contains Page Object Models
- `support/`: Contains support files and utilities

## Configuration Files

### WebdriverIO Configuration

The main configuration file (`wdio.conf.js`) includes:

- Browser capabilities
- Test framework settings
- Reporter configurations
- Hooks and plugins

### TypeScript Configuration

The `tsconfig.json` file configures TypeScript for the project:

- Compiler options
- Type definitions
- Module resolution

## Test Organization

### Page Objects

Page Objects are stored in `test/pageobjects/` and follow this structure:

```typescript
export class LoginPage {
  // Selectors
  private usernameInput = '#username';
  private passwordInput = '#password';
  private loginButton = '#login-button';

  // Actions
  async login(username: string, password: string) {
    await $(this.usernameInput).setValue(username);
    await $(this.passwordInput).setValue(password);
    await $(this.loginButton).click();
  }
}
```

### Test Specifications

Test specifications are stored in `test/specs/` and follow this structure:

```typescript
describe('Login Page', () => {
  it('should login successfully', async () => {
    const loginPage = new LoginPage();
    await loginPage.login('user', 'pass');
    // Add assertions
  });
});
```

## Best Practices

1. **Page Object Pattern**

   - Keep selectors in Page Objects
   - Encapsulate page-specific actions
   - Make Page Objects reusable

2. **Test Organization**

   - Group related tests
   - Use descriptive test names
   - Keep tests independent

3. **Configuration**

   - Use environment-specific configs
   - Keep sensitive data in environment variables
   - Document configuration options

4. **Code Quality**
   - Follow TypeScript best practices
   - Use ESLint and Prettier
   - Write clear and maintainable code
