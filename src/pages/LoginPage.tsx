import { useNavigate } from 'react-router-dom';
import { LoginForm, PasswordResetRequest } from '../components/auth';
import { useState } from 'react';

export function LoginPage() {
  const navigate = useNavigate();
  const [showResetForm, setShowResetForm] = useState(false);

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  const handleResetSuccess = () => {
    setShowResetForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {showResetForm ? (
          <PasswordResetRequest
            onSuccess={handleResetSuccess}
            onCancel={() => setShowResetForm(false)}
          />
        ) : (
          <>
            <LoginForm
              onSuccess={handleLoginSuccess}
              onForgotPassword={() => setShowResetForm(true)}
            />
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
