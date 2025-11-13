import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from './RegisterForm';
import { authService } from '../../services/auth.service';

vi.mock('../../services/auth.service', () => ({
  authService: {
    register: vi.fn(),
  },
}));

describe('RegisterForm', () => {
  it('should render registration form with all required fields', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/account type/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should show validation error for empty required fields', async () => {
    render(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for short password', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'short' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for password mismatch', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'different123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('should call authService.register with correct data', async () => {
    const mockRegister = vi.mocked(authService.register);
    mockRegister.mockResolvedValue({ user: { id: '123' } as any, error: null });

    const onSuccess = vi.fn();
    render(<RegisterForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
          full_name: 'Test User',
          role: 'individual',
        })
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should show organization field when organization role is selected', () => {
    render(<RegisterForm />);

    const roleSelect = screen.getByLabelText(/account type/i);
    fireEvent.change(roleSelect, { target: { value: 'organization' } });

    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument();
  });

  it('should require organization name for organization accounts', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/account type/i), {
      target: { value: 'organization' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/organization name is required for organization accounts/i)
      ).toBeInTheDocument();
    });
  });

  it('should display error message on registration failure', async () => {
    const mockRegister = vi.mocked(authService.register);
    mockRegister.mockResolvedValue({
      user: null,
      error: new Error('Email already exists'),
    });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'existing@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });
});
