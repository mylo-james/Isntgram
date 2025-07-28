import React, { useState, FormEvent, MouseEvent } from 'react';
import { showErrors } from '../../config';
import { LoginFormData } from '../../types';
import { apiCall } from '../../utils/apiMiddleware';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
    data: LoginFormData = formData
  ): Promise<void> => {
    e.preventDefault();

    try {
      await apiCall('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      window.location.reload();
    } catch (error) {
      console.error('Login error:', error);
      showErrors(['An error occurred during login']);
    }
  };

  const demoLogin = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();

    try {
      await apiCall('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'DemoUser', password: 'Test@1234' }),
      });

      window.location.reload();
    } catch (error) {
      console.error('Demo login error:', error);
      showErrors(['An error occurred during demo login']);
    }
  };

  const handleInputChange =
    (field: keyof LoginFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

  return (
    <div className='w-full space-y-6'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='sr-only' htmlFor='username'>
            Username
          </label>
          <input
            className='w-full px-3 py-3 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50'
            placeholder='Phone number, username, or email'
            name='username'
            id='username'
            value={formData.username}
            onChange={handleInputChange('username')}
            required
          />
        </div>

        <div>
          <label className='sr-only' htmlFor='password'>
            Password
          </label>
          <input
            className='w-full px-3 py-3 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50'
            type='password'
            placeholder='Password'
            name='password'
            id='password'
            value={formData.password}
            onChange={handleInputChange('password')}
            required
          />
        </div>

        <button
          className='w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed'
          type='submit'
        >
          Log In
        </button>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white text-gray-500'>OR</span>
          </div>
        </div>

        <button
          className='w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 px-4 rounded-md transition-colors duration-200 text-sm border border-blue-200'
          onClick={demoLogin}
          type='button'
        >
          Try Our Demo
        </button>
      </form>

      <div className='text-sm text-center'>
        <span className='text-gray-600'>Don't have an account? </span>
        <a
          className='text-blue-500 font-semibold hover:text-blue-700 transition-colors duration-200'
          href='/auth/register'
        >
          Sign up
        </a>
      </div>
    </div>
  );
};

export default LoginForm;
