
import React, { useState } from 'react';
import { COUNTRY_CODES } from '../../config/country-codes';

import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginRequest } from '../../store/slices/loginSlice';
import type { LoginState } from '../../store/slices/loginSlice';


type LoginFormData = {
  email: string;
  password: string;
};

interface MobileLoginFormData {
  countryCode: string;
  mobile: string;
}



const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const login = useAppSelector(state => state.login as LoginState);
  const [loginMode, setLoginMode] = useState<'email' | 'mobile'>('email');

  // Forms
  const emailForm = useForm<LoginFormData>();
  const mobileForm = useForm<MobileLoginFormData>({ defaultValues: { countryCode: '+91' } });

  // Submit handlers
  const onEmailSubmit = (data: LoginFormData) => dispatch(loginRequest({ email: data.email, password: data.password }));
  const onMobileSubmit = (data: MobileLoginFormData) => dispatch(loginRequest({ countryCode: data.countryCode, mobile: data.mobile }));

  // Redirect on login
  React.useEffect(() => {
    if (login.isAuthenticated) navigate('/dashboard');
  }, [login.isAuthenticated, navigate]);

  // Error renderer
  const renderError = (error: any) => {
    if (!error) return null;
    let errorObj = error;
    if (typeof error === 'string') {
      try {
        if (error.trim().startsWith('{') && error.trim().endsWith('}')) errorObj = JSON.parse(error);
      } catch {}
    }
    const msg = typeof errorObj === 'string' ? errorObj : errorObj && errorObj.message ? errorObj.message : 'An error occurred. Please try again.';
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center font-semibold">{msg}</div>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 px-2 sm:px-0">
      <div className="w-full max-w-xs sm:max-w-md bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-blue-700">Login</h2>
        <div className="flex justify-center mb-4 sm:mb-6">
          <button
            className={`px-3 sm:px-4 py-2 rounded-l-lg border border-blue-400 ${loginMode === 'email' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
            onClick={() => setLoginMode('email')}
            type="button"
          >
            Email & Password
          </button>
          <button
            className={`px-3 sm:px-4 py-2 rounded-r-lg border border-blue-400 border-l-0 ${loginMode === 'mobile' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
            onClick={() => setLoginMode('mobile')}
            type="button"
          >
            Mobile & OTP
          </button>
        </div>
        {loginMode === 'email' ? (
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4 sm:space-y-6">
            {renderError(login.error)}
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                {...emailForm.register('email', { required: 'Email is required' })}
              />
              {emailForm.formState.errors.email && <span className="text-red-500 text-sm mt-1 block">{emailForm.formState.errors.email.message}</span>}
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                {...emailForm.register('password', { required: 'Password is required' })}
              />
              {emailForm.formState.errors.password && <span className="text-red-500 text-sm mt-1 block">{emailForm.formState.errors.password.message}</span>}
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base" disabled={login.loading}>
              {login.loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={mobileForm.handleSubmit(onMobileSubmit)} className="space-y-4 sm:space-y-6">
            {renderError(login.error)}
            <div className="flex gap-2">
              <select
                className="px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm sm:text-base"
                {...mobileForm.register('countryCode', { required: true })}
                style={{ maxWidth: 100 }}
              >
                {COUNTRY_CODES.map(({ code, label, flag }) => (
                  <option key={code} value={code}>
                    {flag} {code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Mobile Number"
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                {...mobileForm.register('mobile', { required: 'Mobile number is required', pattern: { value: /^\d{10}$/, message: 'Enter a valid 10-digit mobile number' } })}
              />
            </div>
            {mobileForm.formState.errors.mobile && <span className="text-red-500 text-sm mt-1 block">{mobileForm.formState.errors.mobile.message}</span>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base" disabled={login.loading}>
              {login.loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}
        <p className="mt-4 sm:mt-6 text-center text-gray-600 text-sm sm:text-base">
          Don't have an account?{' '}
          <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/register')}>Register</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
