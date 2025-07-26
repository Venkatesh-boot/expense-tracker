
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { RegistrationFormData } from '../../types/formTypes';
import { useDispatch, useSelector } from 'react-redux';
import { COUNTRY_CODES } from '../../config/country-codes';
import { registerRequest, resetRegistration } from '../../store/registrationSlice';
import type { RootState } from '../../store/store';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegistrationFormData>({
    defaultValues: { countryCode: '+91' } as Partial<RegistrationFormData>
  });
  const { loading, error, success } = useSelector((state: RootState) => state.registration);

  React.useEffect(() => {
    if (success) {
      alert('Registration successful!');
      dispatch(resetRegistration());
      navigate('/otp');
    }
  }, [success, dispatch, navigate]);

  const onSubmit = (data: RegistrationFormData) => {
    if (data.password !== data.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    dispatch(registerRequest(data));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 to-blue-200">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-green-700">Register</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="First Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              {...register('firstName', { required: 'First name is required' })}
            />
            {errors.firstName && <span className="text-red-500 text-sm mt-1 block">{errors.firstName.message}</span>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Last Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              {...register('lastName', { required: 'Last name is required' })}
            />
            {errors.lastName && <span className="text-red-500 text-sm mt-1 block">{errors.lastName.message}</span>}
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <span className="text-red-500 text-sm mt-1 block">{errors.email.message}</span>}
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              {...register('countryCode', { required: true })}
              style={{ maxWidth: 100 }}
            >
              {COUNTRY_CODES.map(({ code, label, flag }) => (
                <option key={code} value={code}>
                  <span role="img" aria-label={label}>{flag}</span> {code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Mobile Number"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              {...register('mobile', { required: 'Mobile number is required' })}
            />
          </div>
          {errors.mobile && <span className="text-red-500 text-sm mt-1 block">{errors.mobile.message}</span>}
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <span className="text-red-500 text-sm mt-1 block">{errors.password.message}</span>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              {...register('confirmPassword', { required: 'Confirm password is required' })}
            />
            {errors.confirmPassword && <span className="text-red-500 text-sm mt-1 block">{errors.confirmPassword.message}</span>}
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          {error && <div className="text-red-500 text-center mt-2">{error}</div>}
        </form>
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <span className="text-green-600 hover:underline cursor-pointer" onClick={() => navigate('/login')}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default RegistrationPage;
