
import React, { useState } from 'react';
import { COUNTRY_CODES } from '../../config/country-codes';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';


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
  const [loginMode, setLoginMode] = useState<'email' | 'mobile'>('email');

  // Email/password form
  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors } } = useForm<LoginFormData>();
  // Mobile/OTP form
  const { register: registerMobile, handleSubmit: handleMobileSubmit, formState: { errors: mobileErrors } } = useForm<MobileLoginFormData>({
    defaultValues: { countryCode: '+91' }
  });

  const onEmailSubmit = (data: LoginFormData) => {
    // Add authentication logic here
    // alert(`Email: ${data.email}\nPassword: ${data.password}`);
    navigate('/dashboard');
  };

  const onMobileSubmit = (data: MobileLoginFormData) => {
    // Add mobile OTP logic here
    // alert(`Mobile: ${data.countryCode} ${data.mobile}\nOTP sent!`);
    navigate('/dashboard');
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
          <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4 sm:space-y-6">
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                {...registerEmail('email', { required: 'Email is required' })}
              />
              {emailErrors.email && <span className="text-red-500 text-sm mt-1 block">{emailErrors.email.message}</span>}
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                {...registerEmail('password', { required: 'Password is required' })}
              />
              {emailErrors.password && <span className="text-red-500 text-sm mt-1 block">{emailErrors.password.message}</span>}
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base">Login</button>
          </form>
        ) : (
          <form onSubmit={handleMobileSubmit(onMobileSubmit)} className="space-y-4 sm:space-y-6">
            <div className="flex gap-2">
              <select
                className="px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm sm:text-base"
                {...registerMobile('countryCode', { required: true })}
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
                {...registerMobile('mobile', { required: 'Mobile number is required', pattern: { value: /^\d{10}$/, message: 'Enter a valid 10-digit mobile number' } })}
              />
            </div>
            {mobileErrors.mobile && <span className="text-red-500 text-sm mt-1 block">{mobileErrors.mobile.message}</span>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base">Send OTP</button>
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
