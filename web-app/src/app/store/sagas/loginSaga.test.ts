import { runSaga } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import loginSaga, * as loginSagaModule from './loginSaga';
import { loginRequest, loginSuccess, loginFailure } from '../slices/loginSlice';
import { fetchAccountStart } from '../slices/accountSlice';
import api from '../../utils/api';
import API_CONFIG from '../../config/api-config';

// Mock API
jest.mock('../../utils/api', () => ({
  post: jest.fn(),
}));

// Mock sessionStorage
const mockSessionStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('loginSaga', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleLogin', () => {
    it('should handle successful email login', async () => {
      const mockResponse = {
        data: {
          token: 'mock-jwt-token',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const dispatched: any[] = [];
      
      await runSaga(
        {
          dispatch: (action: any) => dispatched.push(action),
          getState: () => ({}),
        },
        loginSagaModule.handleLogin,
        loginRequest({ email: 'test@example.com', password: 'password123' })
      ).toPromise();

      // Verify API call
      expect(api.post).toHaveBeenCalledWith(API_CONFIG.LOGIN, {
        email: 'test@example.com',
        password: 'password123',
      });

      // Verify token storage
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token');

      // Verify dispatched actions
      expect(dispatched).toEqual([
        loginSuccess(),
        fetchAccountStart(),
      ]);
    });

    it('should handle successful mobile login', async () => {
      const mockResponse = {
        data: {
          token: 'mock-jwt-token',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const dispatched: any[] = [];
      
      await runSaga(
        {
          dispatch: (action: any) => dispatched.push(action),
          getState: () => ({}),
        },
        loginSagaModule.handleLogin,
        loginRequest({ countryCode: '+91', mobile: '9876543210' })
      ).toPromise();

      // Verify API call
      expect(api.post).toHaveBeenCalledWith(API_CONFIG.LOGIN_MOBILE, {
        countryCode: '+91',
        mobile: '9876543210',
      });

      // Verify token storage
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token');

      // Verify dispatched actions
      expect(dispatched).toEqual([
        loginSuccess(),
        fetchAccountStart(),
      ]);
    });

    it('should handle login without token in response', async () => {
      const mockResponse = {
        data: {},
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const dispatched: any[] = [];
      
      await runSaga(
        {
          dispatch: (action: any) => dispatched.push(action),
          getState: () => ({}),
        },
        loginSagaModule.handleLogin,
        loginRequest({ email: 'test@example.com', password: 'password123' })
      ).toPromise();

      // Verify token is not stored
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();

      // Verify success actions are still dispatched
      expect(dispatched).toEqual([
        loginSuccess(),
        fetchAccountStart(),
      ]);
    });

    it('should handle API error with response data', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(mockError);

      const dispatched: any[] = [];
      
      await runSaga(
        {
          dispatch: (action: any) => dispatched.push(action),
          getState: () => ({}),
        },
        loginSagaModule.handleLogin,
        loginRequest({ email: 'test@example.com', password: 'wrong-password' })
      ).toPromise();

      // Verify failure action is dispatched
      expect(dispatched).toEqual([
        loginFailure('Invalid credentials'),
      ]);

      // Verify token is not stored
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle API error with string response data', async () => {
      const mockError = {
        response: {
          data: 'Authentication failed',
        },
      };

      (api.post as jest.Mock).mockRejectedValue(mockError);

      const dispatched: any[] = [];
      
      await runSaga(
        {
          dispatch: (action: any) => dispatched.push(action),
          getState: () => ({}),
        },
        loginSagaModule.handleLogin,
        loginRequest({ email: 'test@example.com', password: 'wrong-password' })
      ).toPromise();

      // Verify failure action is dispatched
      expect(dispatched).toEqual([
        loginFailure('Authentication failed'),
      ]);
    });

    it('should handle generic Error object', async () => {
      const mockError = new Error('Network error');

      (api.post as jest.Mock).mockRejectedValue(mockError);

      const dispatched: any[] = [];
      
      await runSaga(
        {
          dispatch: (action: any) => dispatched.push(action),
          getState: () => ({}),
        },
        loginSagaModule.handleLogin,
        loginRequest({ email: 'test@example.com', password: 'password123' })
      ).toPromise();

      // Verify failure action is dispatched
      expect(dispatched).toEqual([
        loginFailure('Network error'),
      ]);
    });

    it('should handle unknown error', async () => {
      const mockError = 'Unknown error';

      (api.post as jest.Mock).mockRejectedValue(mockError);

      const dispatched: any[] = [];
      
      await runSaga(
        {
          dispatch: (action: any) => dispatched.push(action),
          getState: () => ({}),
        },
        loginSagaModule.handleLogin,
        loginRequest({ email: 'test@example.com', password: 'password123' })
      ).toPromise();

      // Verify failure action is dispatched with default message
      expect(dispatched).toEqual([
        loginFailure('Login failed'),
      ]);
    });

    it('should handle null response', async () => {
      (api.post as jest.Mock).mockResolvedValue(null);

      const dispatched: any[] = [];
      
      await runSaga(
        {
          dispatch: (action: any) => dispatched.push(action),
          getState: () => ({}),
        },
        loginSagaModule.handleLogin,
        loginRequest({ email: 'test@example.com', password: 'password123' })
      ).toPromise();

      // Verify success actions are still dispatched
      expect(dispatched).toEqual([
        loginSuccess(),
        fetchAccountStart(),
      ]);

      // Verify token is not stored
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('loginSaga watcher', () => {
    it('should take latest login request', () => {
      const generator = loginSaga();
      const next = generator.next();
      
      expect(next.value).toEqual(
        expect.objectContaining({
          payload: {
            action: { type: 'login/loginRequest' },
            fn: expect.any(Function),
          },
        })
      );
    });
  });
});
