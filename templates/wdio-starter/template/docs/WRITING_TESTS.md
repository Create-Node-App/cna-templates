# Writing Tests

This document explains how to write and organize tests using the WebdriverIO framework.

## Test Structure

Tests are organized in the following structure:

```txt
test/
├── pageobjects/     # Page Object Models
│   ├── base/       # Base page objects
│   └── pages/      # Specific page objects
└── specs/          # Test specifications
    ├── smoke/      # Smoke tests
    ├── regression/ # Regression tests
    └── ci/         # CI-specific tests
```

## Page Objects

Page Objects encapsulate the page-specific code and provide a clean API for tests.

### Base Page Object

```typescript
// test/pageobjects/base/BasePage.ts
export class BasePage {
  protected async waitForElement(selector: string, timeout = 5000) {
    await $(selector).waitForDisplayed({ timeout });
  }

  protected async click(selector: string) {
    await this.waitForElement(selector);
    await $(selector).click();
  }

  protected async setValue(selector: string, value: string) {
    await this.waitForElement(selector);
    await $(selector).setValue(value);
  }
}
```

### Specific Page Object

```typescript
// test/pageobjects/pages/LoginPage.ts
import { BasePage } from '../base/BasePage';

export class LoginPage extends BasePage {
  private selectors = {
    usernameInput: '#username',
    passwordInput: '#password',
    loginButton: '#login-button',
    errorMessage: '.error-message',
  };

  async login(username: string, password: string) {
    await this.setValue(this.selectors.usernameInput, username);
    await this.setValue(this.selectors.passwordInput, password);
    await this.click(this.selectors.loginButton);
  }

  async getErrorMessage() {
    await this.waitForElement(this.selectors.errorMessage);
    return $(this.selectors.errorMessage).getText();
  }
}
```

## Writing Test Specifications

### Basic Test Structure

```typescript
// test/specs/smoke/login.spec.ts
import { LoginPage } from '../../pageobjects/pages/LoginPage';

describe('Login Page', () => {
  let loginPage: LoginPage;

  beforeEach(async () => {
    loginPage = new LoginPage();
    await browser.url('/login');
  });

  it('should login successfully with valid credentials', async () => {
    await loginPage.login('validUser', 'validPass');
    await expect(browser).toHaveUrl('/dashboard');
  });

  it('should show error message with invalid credentials', async () => {
    await loginPage.login('invalidUser', 'invalidPass');
    const errorMessage = await loginPage.getErrorMessage();
    await expect(errorMessage).toBe('Invalid credentials');
  });
});
```

## Best Practices

### 1. Page Object Pattern

- Keep selectors in Page Objects
- Encapsulate page-specific actions
- Make Page Objects reusable
- Use inheritance for common functionality

### 2. Test Organization

- Group related tests
- Use descriptive test names
- Keep tests independent
- Use appropriate test suites

### 3. Selectors

- Use data-testid attributes
- Avoid brittle selectors
- Keep selectors in Page Objects
- Use meaningful selector names

### 4. Assertions

- Use appropriate assertion methods
- Add meaningful error messages
- Check both positive and negative cases
- Verify state changes

### 5. Error Handling

- Handle expected errors gracefully
- Add proper error messages
- Use try-catch when needed
- Log relevant information

## Example Test Scenarios

### Form Submission

```typescript
describe('Form Submission', () => {
  it('should submit form successfully', async () => {
    await formPage.fillForm({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
    });
    await formPage.submit();
    await expect(formPage.getSuccessMessage()).toBe('Form submitted successfully');
  });
});
```

### API Integration

```typescript
describe('API Integration', () => {
  it('should handle API response correctly', async () => {
    const response = await apiPage.makeRequest();
    await expect(response.status).toBe(200);
    await expect(response.data).toHaveProperty('id');
  });
});
```

### Visual Testing

```typescript
describe('Visual Testing', () => {
  it('should match baseline screenshot', async () => {
    await page.load();
    await expect(browser).toMatchElement('body', {
      screenshot: 'homepage',
    });
  });
});
```

## Troubleshooting

### Common Issues

1. **Element Not Found**

   - Check selector
   - Verify element is visible
   - Check timing issues

2. **Test Flakiness**

   - Add proper waits
   - Use stable selectors
   - Handle dynamic content

3. **Performance Issues**
   - Optimize selectors
   - Reduce unnecessary waits
   - Use appropriate timeouts
