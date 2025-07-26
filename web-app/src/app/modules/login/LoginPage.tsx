
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

type LoginFormData = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = (data: LoginFormData) => {
    // Add authentication logic here
    alert(`Email: ${data.email}\nPassword: ${data.password}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <span className="text-red-500 text-sm mt-1 block">{errors.email.message}</span>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <span className="text-red-500 text-sm mt-1 block">{errors.password.message}</span>}
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">Login</button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/register')}>Register</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
