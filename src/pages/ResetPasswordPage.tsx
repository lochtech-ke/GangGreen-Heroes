import { useNavigate } from 'react-router-dom';
import { PasswordResetConfirm } from '../components/auth';

export function ResetPasswordPage() {
  const navigate = useNavigate();

  const handleResetSuccess = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <PasswordResetConfirm onSuccess={handleResetSuccess} />
    </div>
  );
}
