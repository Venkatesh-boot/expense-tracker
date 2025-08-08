# Authentication Flow Testing Suite

This comprehensive testing suite ensures that your authentication system remains robust and bug-free across code changes.

## 🎯 What's Covered

### 🔄 Redux State Management
- **Login Slice Tests** (`loginSlice.test.ts`)
  - Initial state with/without tokens
  - Login request, success, failure actions
  - Logout functionality and cleanup
  - Authentication state management

### 🧩 React Components  
- **LoginPage Tests** (`LoginPage.test.tsx`)
  - Form rendering and validation
  - Email/mobile login modes
  - Error handling and loading states
  - Navigation on authentication
  
- **RegistrationPage Tests** (`RegistrationPage.test.tsx`)
  - Form validation (email, password confirmation)
  - User existence checks
  - Success/error handling
  - Navigation logic

- **Header Tests** (`Header.test.tsx`)
  - Logout functionality
  - Navigation and user menu
  - Dark mode toggle
  - Mobile responsiveness

- **RequireAuth Tests** (`RequireAuth.test.tsx`)
  - Authentication guards
  - Token validation
  - Redirect behavior

### ⚡ Async Flows
- **Login Saga Tests** (`loginSaga.test.ts`)
  - API call handling
  - Token storage
  - Error scenarios
  - Success flows

## 🚀 Running Tests

### Quick Start
```bash
# Install dependencies (if not already done)
cd web-app && npm install

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Using the Test Runner
```bash
# Run all test categories
node test-runner.js

# Run full suite with coverage
node test-runner.js --full

# Run specific category
node test-runner.js --category redux-store-tests
node test-runner.js --category component-tests

# Watch mode
node test-runner.js --watch

# Help
node test-runner.js --help
```

## 📊 Coverage Goals

The test suite maintains these coverage thresholds:
- **Branches**: 80%
- **Functions**: 80%  
- **Lines**: 80%
- **Statements**: 80%

## 🔍 Test Categories

### 1. Redux Store Tests
Validates state management logic:
```bash
node test-runner.js --category redux-store-tests
```

### 2. Component Tests  
Tests React component behavior:
```bash
node test-runner.js --category component-tests
```

### 3. Page Tests
Tests full page components:
```bash
node test-runner.js --category page-tests
```

### 4. Saga Tests
Tests async flows:
```bash
node test-runner.js --category saga-tests
```

## 🛡️ What These Tests Prevent

### Authentication Bugs
- ✅ Infinite navigation loops
- ✅ Token/state mismatches
- ✅ Improper logout cleanup
- ✅ Authentication bypass

### UI Regression
- ✅ Form validation breaks
- ✅ Loading state issues
- ✅ Error message display
- ✅ Navigation problems

### State Management Issues
- ✅ Redux state corruption
- ✅ Action payload errors
- ✅ Side effect problems
- ✅ Storage inconsistencies

## 🧪 Test Structure

Each test file follows this pattern:

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  describe('Feature Group', () => {
    it('should behave correctly in specific scenario', () => {
      // Test implementation
    });
  });
});
```

## 🔧 Adding New Tests

### For New Components
1. Create `ComponentName.test.tsx` next to your component
2. Follow the existing test patterns
3. Test all user interactions and edge cases
4. Mock external dependencies

### For New Redux Logic
1. Create `sliceName.test.ts` next to your slice
2. Test all actions and reducers
3. Verify state transformations
4. Test edge cases and error scenarios

### For New Sagas
1. Create `sagaName.test.ts` next to your saga
2. Use `runSaga` for testing
3. Mock API calls
4. Test success and error flows

## 🚨 CI/CD Integration

Add this to your CI pipeline:

```yaml
- name: Run Authentication Tests
  run: |
    cd web-app
    npm ci
    npm run test:ci
```

## 📈 Monitoring Test Health

### Regular Checks
- Run tests before each commit
- Monitor coverage reports
- Update tests when adding features
- Review failing tests immediately

### Test Maintenance
- Keep mocks up to date
- Update tests when APIs change
- Refactor tests with code changes
- Add tests for new edge cases

## 🐛 Debugging Test Failures

### Common Issues
1. **Mock not working**: Check if mocks are properly reset
2. **Async test failing**: Use `waitFor` for async operations
3. **Component not rendering**: Verify all required props/context
4. **Redux test failing**: Check initial state setup

### Debug Commands
```bash
# Run specific test file
npm test -- LoginPage.test.tsx

# Run with verbose output
npm test -- --verbose

# Run in debug mode
npm test -- --runInBand --detectOpenHandles
```

## 📝 Best Practices

### Test Writing
- Test behavior, not implementation
- Use descriptive test names
- Keep tests focused and atomic
- Mock external dependencies

### Test Organization
- Group related tests with `describe`
- Use `beforeEach` for common setup
- Keep test files close to source files
- Follow naming conventions

### Maintenance
- Run tests frequently
- Update tests with feature changes
- Remove obsolete tests
- Keep coverage high

---

**Remember**: These tests are your safety net. They catch bugs before your users do and give you confidence to refactor and improve your authentication system! 🛡️
