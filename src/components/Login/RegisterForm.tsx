import React, { useState, FormEvent, ChangeEvent } from 'react';
import { showErrors } from '../../config';
import { SignupFormData } from '../../types';
import { useApi } from '../../utils/apiComposable';
import type { SignupRequest } from '../../types/api';

interface RegisterFormData extends SignupFormData {
  fullName: string;
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const { signup, isLoading, error, clearError } = useApi();

  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    fullName: '',
    password: '',
    passwordConfirm: '',
    confirmPassword: '',
  });

  const updateState = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
    data: RegisterFormData = formData
  ): Promise<void> => {
    e.preventDefault();
    clearError();

    // Convert legacy form data to new API format
    const signupRequest: SignupRequest = {
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      password: data.password,
      confirmPassword: data.confirmPassword,
      bio: undefined, // Optional field
    };

    try {
      const response = await signup(signupRequest);

      if (response.error) {
        showErrors([response.error]);
      } else {
        // Registration successful, reload the page
        window.location.reload();
      }
    } catch (err) {
      showErrors(['An error occurred during registration']);
    }
  };

  return (
    <div className='flex justify-evenly items-center flex-col h-[70vh] w-full'>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4 w-full'>
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className='flex flex-col justify-between items-center h-[60%] w-4/5 text-sm text-center'
      >
        <label className='sr-only' htmlFor='username'>
          Username
        </label>
        <input
          name='username'
          id='username'
          placeholder='Username'
          onChange={updateState}
          value={formData.username}
          className='w-full px-2 h-8 border border-gray-300 rounded text-left mb-5 focus:border-gray-400 focus:outline-none transition-colors'
          required
          disabled={isLoading}
        />

        <label className='sr-only' htmlFor='email'>
          Email
        </label>
        <input
          name='email'
          id='email'
          type='email'
          placeholder='Email'
          onChange={updateState}
          value={formData.email}
          className='w-full px-2 h-8 border border-gray-300 rounded text-left mb-5 focus:border-gray-400 focus:outline-none transition-colors'
          required
          disabled={isLoading}
        />

        <label className='sr-only' htmlFor='full_name'>
          Full Name
        </label>
        <input
          name='full_name'
          id='full_name'
          placeholder='Full Name'
          onChange={updateState}
          value={formData.fullName}
          className='w-full px-2 h-8 border border-gray-300 rounded text-left mb-5 focus:border-gray-400 focus:outline-none transition-colors'
          required
          disabled={isLoading}
        />

        <label className='sr-only' htmlFor='password'>
          Password
        </label>
        <input
          name='password'
          id='password'
          type='password'
          placeholder='Password'
          onChange={updateState}
          value={formData.password}
          className='w-full px-2 h-8 border border-gray-300 rounded text-left mb-5 focus:border-gray-400 focus:outline-none transition-colors'
          required
          disabled={isLoading}
        />

        <label className='sr-only' htmlFor='confirmPassword'>
          Confirm Password
        </label>
        <input
          name='confirmPassword'
          id='confirmPassword'
          type='password'
          placeholder='Confirm Password'
          onChange={updateState}
          value={formData.confirmPassword}
          className='w-full px-2 h-8 border border-gray-300 rounded text-left mb-5 focus:border-gray-400 focus:outline-none transition-colors'
          required
          disabled={isLoading}
        />

        <button
          type='submit'
          className='w-full bg-blue-500 border-none rounded h-7.5 mb-2.5 text-white hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>

        <div className='text-center'>
          Have an account?
          <a
            href='/auth/login'
            className='text-blue-500 font-bold hover:text-blue-700 transition-colors'
          >
            {' '}
            Login
          </a>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
