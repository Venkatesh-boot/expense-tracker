import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from './LoginPage';
import loginReducer from '../../store/slices/loginSlice';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useAppDispatch and useAppSelector
const mockDispatch = jest.fn();
jest.mock('../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector(mockStore.getState()),
}));

// Create mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      login: loginReducer,
    },
    preloadedState: {
      login: {
        loading: false,
        error: null,
        isAuthenticated: false,
        email: null,
        ...initialState,
      },
    },
  });
};

let mockStore: any;

const renderLoginPage = (initialState = {}) => {
  mockStore = createMockStore(initialState);
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </Provider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  describe('Rendering', () => {
    it('should render login form', () => {
      renderLoginPage();
      
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('should render registration link', () => {
      renderLoginPage();
      
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('should show both email and mobile login options', () => {
      renderLoginPage();
      
      expect(screen.getByText('Email & Password')).toBeInTheDocument();
      expect(screen.getByText('Mobile & OTP')).toBeInTheDocument();
    });
  });

  describe('Email Login', () => {
    it('should dispatch login request on valid email form submission', async () => {
      renderLoginPage();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'login/loginRequest',
          payload: {
            email: 'test@example.com',
            password: 'password123',
          },
        });
      });
    });

    it('should show validation errors for empty fields', async () => {
      renderLoginPage();
      
      const loginButton = screen.getByRole('button', { name: 'Login' });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email', async () => {
      renderLoginPage();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Login', () => {
    it('should switch to mobile login mode', () => {
      renderLoginPage();
      
      const mobileTab = screen.getByText('Mobile & OTP');
      fireEvent.click(mobileTab);

      expect(screen.getByPlaceholderText('Mobile Number')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Send OTP' })).toBeInTheDocument();
    });

    it('should dispatch mobile login request on valid mobile form submission', async () => {
      renderLoginPage();
      
      // Switch to mobile login
      const mobileTab = screen.getByText('Mobile & OTP');
      fireEvent.click(mobileTab);

      const mobileInput = screen.getByPlaceholderText('Mobile Number');
      const sendOtpButton = screen.getByRole('button', { name: 'Send OTP' });

      fireEvent.change(mobileInput, { target: { value: '9876543210' } });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'login/loginRequest',
          payload: {
            countryCode: '+91',
            mobile: '9876543210',
          },
        });
      });
    });

    it('should show validation error for invalid mobile number', async () => {
      renderLoginPage();
      
      // Switch to mobile login
      const mobileTab = screen.getByText('Mobile & OTP');
      fireEvent.click(mobileTab);

      const mobileInput = screen.getByPlaceholderText('Mobile Number');
      const sendOtpButton = screen.getByRole('button', { name: 'Send OTP' });

      fireEvent.change(mobileInput, { target: { value: '123' } });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid 10-digit mobile number')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication State', () => {
    it('should navigate to dashboard when authenticated', () => {
      renderLoginPage({ isAuthenticated: true });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should not navigate when not authenticated', () => {
      renderLoginPage({ isAuthenticated: false });

      expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard');
    });

    it('should show loading state during login', () => {
      renderLoginPage({ loading: true });

      expect(screen.getByText('Logging in...')).toBeInTheDocument();
    });

    it('should display login errors', () => {
      const errorMessage = 'Invalid credentials';
      renderLoginPage({ error: errorMessage });

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display JSON error objects', () => {
      const errorObject = { message: 'Login failed', code: 401 };
      renderLoginPage({ error: JSON.stringify(errorObject) });

      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to registration page when register link is clicked', () => {
      renderLoginPage();
      
      const registerLink = screen.getByText('Register');
      fireEvent.click(registerLink);

      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
  });

  describe('UI State Management', () => {
    it('should disable login button during loading', () => {
      renderLoginPage({ loading: true });

      const loginButton = screen.getByRole('button', { name: 'Logging in...' });
      expect(loginButton).toBeDisabled();
    });

    it('should disable send OTP button during loading in mobile mode', () => {
      renderLoginPage({ loading: true });
      
      // Switch to mobile login
      const mobileTab = screen.getByText('Mobile & OTP');
      fireEvent.click(mobileTab);

      const sendOtpButton = screen.getByRole('button', { name: 'Sending...' });
      expect(sendOtpButton).toBeDisabled();
    });

    it('should show active state for selected login mode', () => {
      renderLoginPage();
      
      const emailTab = screen.getByText('Email & Password');
      const mobileTab = screen.getByText('Mobile & OTP');

      // Email tab should be active by default
      expect(emailTab.closest('button')).toHaveClass('bg-blue-600', 'text-white');
      expect(mobileTab.closest('button')).toHaveClass('bg-white', 'text-blue-600');

      // Switch to mobile
      fireEvent.click(mobileTab);

      expect(mobileTab.closest('button')).toHaveClass('bg-blue-600', 'text-white');
      expect(emailTab.closest('button')).toHaveClass('bg-white', 'text-blue-600');
    });
  });
});
