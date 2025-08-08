import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import RegistrationPage from './RegistrationPage';
import registrationReducer from '../../store/slices/registrationSlice';
import userReducer from '../../store/slices/userSlice';

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
      registration: registrationReducer,
      user: userReducer,
    },
    preloadedState: {
      registration: {
        loading: false,
        error: null,
        success: false,
      },
      user: {
        exists: null,
        loading: false,
        error: null,
      },
      ...initialState,
    },
  });
};

let mockStore: any;

const renderRegistrationPage = (initialState = {}) => {
  mockStore = createMockStore(initialState);
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        <RegistrationPage />
      </BrowserRouter>
    </Provider>
  );
};

describe('RegistrationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render registration form', () => {
      renderRegistrationPage();
      
      expect(screen.getByText('Register')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    });

    it('should render login link', () => {
      renderRegistrationPage();
      
      expect(screen.getByText('Already have an account?')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty fields', async () => {
      renderRegistrationPage();
      
      const registerButton = screen.getByRole('button', { name: 'Register' });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      renderRegistrationPage();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const registerButton = screen.getByRole('button', { name: 'Register' });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
      });
    });

    it('should validate password confirmation', async () => {
      renderRegistrationPage();
      
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const registerButton = screen.getByRole('button', { name: 'Register' });

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });
  });

  describe('User Existence Check', () => {
    it('should navigate to login when user exists', () => {
      renderRegistrationPage({
        user: { exists: true },
      });

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should not navigate when user does not exist', () => {
      renderRegistrationPage({
        user: { exists: false },
      });

      expect(mockNavigate).not.toHaveBeenCalledWith('/login');
    });

    it('should not navigate when user existence is unknown', () => {
      renderRegistrationPage({
        user: { exists: null },
      });

      expect(mockNavigate).not.toHaveBeenCalledWith('/login');
    });
  });

  describe('Form Submission', () => {
    it('should dispatch registration and user check actions on valid form submission', async () => {
      renderRegistrationPage();
      
      // Fill out form
      fireEvent.change(screen.getByPlaceholderText('First Name'), { 
        target: { value: 'John' } 
      });
      fireEvent.change(screen.getByPlaceholderText('Last Name'), { 
        target: { value: 'Doe' } 
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), { 
        target: { value: 'john.doe@example.com' } 
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), { 
        target: { value: 'password123' } 
      });
      fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { 
        target: { value: 'password123' } 
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'user/checkUserExistsRequest',
          payload: 'john.doe@example.com',
        });
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'registration/registrationRequest',
          payload: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: 'password123',
          },
        });
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during registration', () => {
      renderRegistrationPage({
        registration: { loading: true },
      });

      expect(screen.getByText('Registering...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Registering...' })).toBeDisabled();
    });

    it('should show normal state when not loading', () => {
      renderRegistrationPage({
        registration: { loading: false },
      });

      expect(screen.getByRole('button', { name: 'Register' })).not.toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display registration errors', () => {
      const errorMessage = 'Email already exists';
      renderRegistrationPage({
        registration: { error: errorMessage },
      });

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display JSON error objects', () => {
      const errorObject = { message: 'Registration failed', code: 400 };
      renderRegistrationPage({
        registration: { error: JSON.stringify(errorObject) },
      });

      expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });

    it('should show fallback error message for invalid JSON', () => {
      renderRegistrationPage({
        registration: { error: 'Invalid JSON error' },
      });

      expect(screen.getByText('Invalid JSON error')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to login when login link is clicked', () => {
      renderRegistrationPage();
      
      const loginLink = screen.getByText('Login');
      fireEvent.click(loginLink);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Success Handling', () => {
    it('should navigate to login on successful registration', () => {
      renderRegistrationPage({
        registration: { success: true },
      });

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
