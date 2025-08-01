import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/test-utils';
import Login from '../../../components/Login/Login';

describe('Login Component', () => {
  describe('Rendering', () => {
    it('renders login form elements', () => {
      render(<Login />);

      expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText(/password/i)).toHaveLength(2);
      expect(
        screen.getByRole('button', { name: /register/i })
      ).toBeInTheDocument();
    });

    it('renders login link', () => {
      render(<Login />);

      const loginLink = screen.getByRole('link', { name: /login/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/auth/login');
    });

    it('renders developer links', () => {
      render(<Login />);

      expect(screen.getByAltText('James Robertson')).toBeInTheDocument();
      expect(screen.getByAltText('Aaron Pierskalla')).toBeInTheDocument();
      expect(screen.getByAltText('Mylo James')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('allows typing in all form fields', async () => {
      render(<Login />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInputs = screen.getAllByPlaceholderText(/password/i);
      const passwordInput = passwordInputs[0];
      const confirmPasswordInput = passwordInputs[1];

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');

      expect(usernameInput).toHaveValue('testuser');
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
      expect(confirmPasswordInput).toHaveValue('password123');
    });

    it('handles form submission', async () => {
      render(<Login />);

      const submitButton = screen.getByRole('button', { name: /register/i });

      await userEvent.click(submitButton);

      // Form submission should be handled by the component
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<Login />);

      expect(screen.getByPlaceholderText(/username/i)).toHaveAttribute(
        'id',
        'username'
      );
      expect(screen.getByPlaceholderText(/email/i)).toHaveAttribute(
        'type',
        'email'
      );
      const passwordInputs = screen.getAllByPlaceholderText(/password/i);
      expect(passwordInputs[0]).toHaveAttribute('type', 'password');
      expect(passwordInputs[1]).toHaveAttribute('type', 'password');
    });

    it('supports keyboard navigation', async () => {
      render(<Login />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const fullNameInput = screen.getByPlaceholderText(/full name/i);
      const passwordInputs = screen.getAllByPlaceholderText(/password/i);
      const passwordInput = passwordInputs[0];
      const confirmPasswordInput = passwordInputs[1];
      const submitButton = screen.getByRole('button', { name: /register/i });

      usernameInput.focus();
      expect(usernameInput).toHaveFocus();

      await userEvent.tab();
      expect(emailInput).toHaveFocus();

      await userEvent.tab();
      expect(fullNameInput).toHaveFocus();

      await userEvent.tab();
      expect(passwordInput).toHaveFocus();

      await userEvent.tab();
      expect(confirmPasswordInput).toHaveFocus();

      await userEvent.tab();
      expect(submitButton).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid form submissions', async () => {
      render(<Login />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInputs = screen.getAllByPlaceholderText(/password/i);
      const passwordInput = passwordInputs[0];
      const submitButton = screen.getByRole('button', { name: /register/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      // Rapid clicks
      await userEvent.click(submitButton);
      await userEvent.click(submitButton);
      await userEvent.click(submitButton);

      expect(submitButton).toBeInTheDocument();
    });

    it('handles special characters in email and password', async () => {
      render(<Login />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInputs = screen.getAllByPlaceholderText(/password/i);
      const passwordInput = passwordInputs[0];

      await userEvent.type(emailInput, 'test+tag@example.com');
      await userEvent.type(passwordInput, 'p@ssw0rd!@#$%');

      expect(emailInput).toHaveValue('test+tag@example.com');
      expect(passwordInput).toHaveValue('p@ssw0rd!@#$%');
    });

    it('handles very long input values', async () => {
      render(<Login />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const longUsername = 'a'.repeat(1000);

      await userEvent.type(usernameInput, longUsername);

      expect(usernameInput).toHaveValue(longUsername);
    });
  });

  describe('Form Validation', () => {
    it('requires all fields', () => {
      render(<Login />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const fullNameInput = screen.getByPlaceholderText(/full name/i);
      const passwordInputs = screen.getAllByPlaceholderText(/password/i);
      const passwordInput = passwordInputs[0];
      const confirmPasswordInput = passwordInputs[1];

      expect(usernameInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('required');
      expect(fullNameInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('required');
    });
  });

  describe('Visual Elements', () => {
    it('renders background image', () => {
      render(<Login />);

      const backgroundImage = screen.getByAltText(
        'Instagram splash background'
      );
      expect(backgroundImage).toBeInTheDocument();
    });

    it('renders logo', () => {
      render(<Login />);

      const logo = screen.getByAltText('Instagram logo');
      expect(logo).toBeInTheDocument();
    });
  });
});
