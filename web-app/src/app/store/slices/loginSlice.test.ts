import loginReducer, { 
  loginRequest, 
  loginSuccess, 
  loginFailure, 
  logout,
  LoginState 
} from './loginSlice';

describe('loginSlice', () => {
  const initialState: LoginState = {
    loading: false,
    error: null,
    isAuthenticated: false,
    email: null,
  };

  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  describe('initial state', () => {
    it('should return initial state when no token exists', () => {
      const state = loginReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should set isAuthenticated to true when token exists in sessionStorage', () => {
      sessionStorage.setItem('token', 'mock-token');
      
      // Re-import to get fresh initial state
      jest.resetModules();
      const freshLoginSlice = require('./loginSlice').default;
      
      const state = freshLoginSlice(undefined, { type: 'unknown' });
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('loginRequest', () => {
    it('should handle email login request', () => {
      const action = loginRequest({ email: 'test@example.com', password: 'password123' });
      const state = loginReducer(initialState, action);

      expect(state).toEqual({
        loading: true,
        error: null,
        isAuthenticated: false,
        email: 'test@example.com',
      });
    });

    it('should handle mobile login request', () => {
      const action = loginRequest({ countryCode: '+91', mobile: '9876543210' });
      const state = loginReducer(initialState, action);

      expect(state).toEqual({
        loading: true,
        error: null,
        isAuthenticated: false,
        email: null,
      });
    });

    it('should reset authentication state on new login request', () => {
      const currentState: LoginState = {
        loading: false,
        error: 'Previous error',
        isAuthenticated: true,
        email: 'old@example.com',
      };

      const action = loginRequest({ email: 'new@example.com', password: 'password123' });
      const state = loginReducer(currentState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.email).toBe('new@example.com');
    });
  });

  describe('loginSuccess', () => {
    it('should handle successful login', () => {
      const currentState: LoginState = {
        loading: true,
        error: null,
        isAuthenticated: false,
        email: 'test@example.com',
      };

      const action = loginSuccess();
      const state = loginReducer(currentState, action);

      expect(state).toEqual({
        loading: false,
        error: null,
        isAuthenticated: true,
        email: 'test@example.com',
      });
    });
  });

  describe('loginFailure', () => {
    it('should handle login failure with string error', () => {
      const currentState: LoginState = {
        loading: true,
        error: null,
        isAuthenticated: false,
        email: 'test@example.com',
      };

      const errorMessage = 'Invalid credentials';
      const action = loginFailure(errorMessage);
      const state = loginReducer(currentState, action);

      expect(state).toEqual({
        loading: false,
        error: errorMessage,
        isAuthenticated: false,
        email: 'test@example.com',
      });
    });

    it('should handle login failure with object error', () => {
      const currentState: LoginState = {
        loading: true,
        error: null,
        isAuthenticated: false,
        email: 'test@example.com',
      };

      const errorObject = { message: 'Login failed', code: 401 };
      const action = loginFailure(errorObject);
      const state = loginReducer(currentState, action);

      expect(state).toEqual({
        loading: false,
        error: errorObject,
        isAuthenticated: false,
        email: 'test@example.com',
      });
    });
  });

  describe('logout', () => {
    it('should handle logout and clear session storage', () => {
      // Set up initial authenticated state
      sessionStorage.setItem('token', 'mock-token');
      const currentState: LoginState = {
        loading: false,
        error: null,
        isAuthenticated: true,
        email: 'test@example.com',
      };

      const action = logout();
      const state = loginReducer(currentState, action);

      expect(state).toEqual({
        loading: false,
        error: null,
        isAuthenticated: false,
        email: null,
      });

      // Verify sessionStorage is cleared
      expect(sessionStorage.getItem('token')).toBe(null);
    });

    it('should clear all login state on logout', () => {
      const currentState: LoginState = {
        loading: true,
        error: 'Some error',
        isAuthenticated: true,
        email: 'user@example.com',
      };

      const action = logout();
      const state = loginReducer(currentState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.email).toBe(null);
    });
  });
});
