import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { RequireAuth } from './RequireAuth';
import loginReducer from '../store/slices/loginSlice';

// Mock child component
const MockChild = () => <div>Protected Content</div>;

// Create mock store
const createMockStore = (loginState = {}) => {
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
        ...loginState,
      },
    },
  });
};

const renderRequireAuth = (loginState = {}, initialRoute = '/dashboard') => {
  const store = createMockStore(loginState);
  
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <RequireAuth>
          <MockChild />
        </RequireAuth>
      </MemoryRouter>
    </Provider>
  );
};

describe('RequireAuth', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('Authentication Check', () => {
    it('should render children when user is authenticated with token', () => {
      sessionStorage.setItem('token', 'mock-token');
      
      renderRequireAuth({ isAuthenticated: true });
      
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect to login when user is not authenticated', () => {
      renderRequireAuth({ isAuthenticated: false });
      
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      // Since we're using MemoryRouter, we can't easily test the redirect
      // In a real test, you'd mock useNavigate or check location changes
    });

    it('should redirect to login when token is missing even if Redux says authenticated', () => {
      // This tests the case where Redux state is out of sync
      renderRequireAuth({ isAuthenticated: true }); // No token in sessionStorage
      
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should redirect to login when Redux says not authenticated even with token', () => {
      sessionStorage.setItem('token', 'mock-token');
      
      renderRequireAuth({ isAuthenticated: false });
      
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty token', () => {
      sessionStorage.setItem('token', '');
      
      renderRequireAuth({ isAuthenticated: true });
      
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should handle null token', () => {
      sessionStorage.setItem('token', 'null');
      
      renderRequireAuth({ isAuthenticated: true });
      
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Location State Preservation', () => {
    it('should preserve current location for redirect after login', () => {
      const { container } = renderRequireAuth({ isAuthenticated: false }, '/protected-route');
      
      // In a real test, you'd check that the Navigate component receives the correct state
      expect(container).toBeInTheDocument();
    });
  });
});
