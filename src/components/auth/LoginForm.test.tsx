import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { authService } from '../../services/auth.service';

vi.mock('../../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
  },
}));

describe('LoginForm', () => {
  it('should render login form with all fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show validation error for empty fields', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('should call authService.login with correct credentials', async () => {
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockResolvedValue({ user: { id: '123' } as any, error: null });

    const onSuccess = vi.fn();
    render(<LoginForm onSuccess={onSuccess} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should display error message on login failure', async () => {
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockResolvedValue({
      user: null,
      error: new Error('Invalid credentials'),
    });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('should call onForgotPassword when forgot password is clicked', () => {
    const onForgotPassword = vi.fn();
    render(<LoginForm onForgotPassword={onForgotPassword} />);

    const forgotPasswordButton = screen.getByText(/forgot password/i);
    fireEvent.click(forgotPasswordButton);

    expect(onForgotPassword).toHaveBeenCalled();
  });

  it('should disable form during submission', async () => {
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ user: null, error: null }), 100))
    );

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });
});
