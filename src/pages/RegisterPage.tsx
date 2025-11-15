import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/auth';
import { ChatWidget } from '../components/chatbot';

export function RegisterPage() {
  const navigate = useNavigate();
  const [onboardingState, setOnboardingState] = useState<{
    isActive: boolean;
    userId: string | null;
    userEmail: string | null;
  }>({
    isActive: false,
    userId: null,
    userEmail: null,
  });

  const handleRegisterSuccess = (userId: string, email: string) => {
    // Set onboarding state to trigger chatbot
    setOnboardingState({
      isActive: true,
      userId,
      userEmail: email,
    });

    // Note: Dashboard redirect will be delayed until onboarding is complete
    // This will be handled by the ChatWidget component in future tasks
  };

  const handleOnboardingComplete = () => {
    // Called when user completes the onboarding chatbot flow
    setOnboardingState({
      isActive: false,
      userId: null,
      userEmail: null,
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <RegisterForm onSuccess={handleRegisterSuccess} />
        
        {/* Chatbot Widget for Onboarding */}
        <ChatWidget
          isOpen={onboardingState.isActive}
          onToggle={() => {}} // Disabled during onboarding
          autoStartOnboarding={onboardingState.isActive}
          userId={onboardingState.userId || undefined}
          userEmail={onboardingState.userEmail || undefined}
          onOnboardingComplete={handleOnboardingComplete}
          position="bottom-right"
          hasCompletedProfile={false} // New users haven't completed profile yet
        />

        {!onboardingState.isActive && (
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign in
              </button>
            </p>
            <p className="text-gray-600 mt-2">
              <button
                onClick={() => navigate('/')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                ← Back to Home
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
