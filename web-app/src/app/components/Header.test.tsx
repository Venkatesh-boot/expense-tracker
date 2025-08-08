import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Header from './Header';
import loginReducer from '../store/slices/loginSlice';
import accountReducer from '../store/slices/accountSlice';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Create mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      login: loginReducer,
      account: accountReducer,
    },
    preloadedState: {
      login: {
        loading: false,
        error: null,
        isAuthenticated: true,
        email: null,
      },
      account: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        loading: false,
        error: null,
      },
      ...initialState,
    },
  });
};

const renderHeader = (initialState = {}, props = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Header {...props} />
      </BrowserRouter>
    </Provider>
  );
};

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Rendering', () => {
    it('should render company logo and name', () => {
      renderHeader();
      
      expect(screen.getByText('ExpenseTracker')).toBeInTheDocument();
      expect(screen.getByAltText('Company Logo')).toBeInTheDocument();
    });

    it('should render navigation buttons on desktop', () => {
      renderHeader();
      
      expect(screen.getByText('Expenses')).toBeInTheDocument();
      expect(screen.getByText('Group')).toBeInTheDocument();
      expect(screen.getByText('Subscription')).toBeInTheDocument();
    });

    it('should render user avatar', () => {
      renderHeader();
      
      expect(screen.getByAltText('User Avatar')).toBeInTheDocument();
    });

    it('should conditionally render logout button', () => {
      renderHeader({}, { showLogout: true });
      
      // Click on avatar to open menu
      fireEvent.click(screen.getByAltText('User Avatar'));
      
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should hide logout button when showLogout is false', () => {
      renderHeader({}, { showLogout: false });
      
      // Click on avatar to open menu
      fireEvent.click(screen.getByAltText('User Avatar'));
      
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to dashboard when logo is clicked', () => {
      renderHeader();
      
      fireEvent.click(screen.getByText('ExpenseTracker'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should navigate to expenses page', () => {
      renderHeader();
      
      fireEvent.click(screen.getByText('Expenses'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/expenses');
    });

    it('should navigate to group page', () => {
      renderHeader();
      
      fireEvent.click(screen.getByText('Group'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/group');
    });

    it('should navigate to subscription page', () => {
      renderHeader();
      
      fireEvent.click(screen.getByText('Subscription'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/subscription');
    });
  });

  describe('User Menu', () => {
    it('should open user menu when avatar is clicked', () => {
      renderHeader();
      
      fireEvent.click(screen.getByAltText('User Avatar'));
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should close user menu when avatar is clicked again', () => {
      renderHeader();
      
      const avatar = screen.getByAltText('User Avatar');
      
      // Open menu
      fireEvent.click(avatar);
      expect(screen.getByText('Account')).toBeInTheDocument();
      
      // Close menu
      fireEvent.click(avatar);
      expect(screen.queryByText('Account')).not.toBeInTheDocument();
    });

    it('should navigate to account page from menu', () => {
      renderHeader();
      
      fireEvent.click(screen.getByAltText('User Avatar'));
      fireEvent.click(screen.getByText('Account'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/account');
    });

    it('should navigate to settings page from menu', () => {
      renderHeader();
      
      fireEvent.click(screen.getByAltText('User Avatar'));
      fireEvent.click(screen.getByText('Settings'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });
  });

  describe('Dark Mode', () => {
    it('should toggle dark mode', () => {
      renderHeader();
      
      fireEvent.click(screen.getByAltText('User Avatar'));
      
      const darkModeToggle = screen.getByRole('button', { pressed: false });
      fireEvent.click(darkModeToggle);
      
      expect(localStorage.getItem('darkMode')).toBe('true');
      expect(document.documentElement).toHaveClass('dark');
    });

    it('should initialize dark mode from localStorage', () => {
      localStorage.setItem('darkMode', 'true');
      
      renderHeader();
      
      expect(document.documentElement).toHaveClass('dark');
    });
  });

  describe('Logout Functionality', () => {
    it('should handle logout correctly', () => {
      // Mock dispatch to capture logout action
      const mockDispatch = jest.fn();
      jest.spyOn(require('react-redux'), 'useDispatch').mockReturnValue(mockDispatch);
      
      // Set up tokens
      sessionStorage.setItem('token', 'mock-token');
      localStorage.setItem('authToken', 'mock-auth-token');
      localStorage.setItem('user', 'mock-user');
      
      renderHeader();
      
      // Open menu and click logout
      fireEvent.click(screen.getByAltText('User Avatar'));
      fireEvent.click(screen.getByText('Logout'));
      
      // Verify logout action was dispatched
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'login/logout' });
      
      // Verify localStorage cleanup
      expect(localStorage.getItem('authToken')).toBe(null);
      expect(localStorage.getItem('user')).toBe(null);
      
      // Verify navigation to login
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should close menu after logout', () => {
      renderHeader();
      
      fireEvent.click(screen.getByAltText('User Avatar'));
      fireEvent.click(screen.getByText('Logout'));
      
      // Menu should be closed after logout
      expect(screen.queryByText('Account')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    it('should open mobile menu when hamburger is clicked', () => {
      renderHeader();
      
      const hamburger = screen.getByLabelText('Open menu');
      fireEvent.click(hamburger);
      
      // Check if mobile menu items are present
      const mobileExpensesButton = screen.getAllByText('Expenses')[1]; // Second one is mobile
      expect(mobileExpensesButton).toBeInTheDocument();
    });

    it('should navigate from mobile menu', () => {
      renderHeader();
      
      const hamburger = screen.getByLabelText('Open menu');
      fireEvent.click(hamburger);
      
      const mobileExpensesButtons = screen.getAllByText('Expenses');
      fireEvent.click(mobileExpensesButtons[1]); // Click mobile menu item
      
      expect(mockNavigate).toHaveBeenCalledWith('/expenses');
    });
  });

  describe('User Avatar Generation', () => {
    it('should generate avatar URL with user name', () => {
      renderHeader();
      
      const avatar = screen.getByAltText('User Avatar');
      const avatarSrc = avatar.getAttribute('src');
      
      expect(avatarSrc).toContain('John%20Doe');
      expect(avatarSrc).toContain('ui-avatars.com');
    });

    it('should fallback to email when name is not available', () => {
      const stateWithoutName = {
        account: {
          firstName: '',
          lastName: '',
          email: 'user@example.com',
          loading: false,
          error: null,
        },
      };
      
      renderHeader(stateWithoutName);
      
      const avatar = screen.getByAltText('User Avatar');
      const avatarSrc = avatar.getAttribute('src');
      
      expect(avatarSrc).toContain('user@example.com');
    });

    it('should fallback to "User" when neither name nor email is available', () => {
      const stateWithoutUserInfo = {
        account: {
          firstName: '',
          lastName: '',
          email: '',
          loading: false,
          error: null,
        },
      };
      
      renderHeader(stateWithoutUserInfo);
      
      const avatar = screen.getByAltText('User Avatar');
      const avatarSrc = avatar.getAttribute('src');
      
      expect(avatarSrc).toContain('User');
    });
  });
});
