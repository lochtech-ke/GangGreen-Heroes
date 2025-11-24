import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { featureDeprecationService } from '../../services/featureDeprecation.service';

/**
 * Handles deprecated routes for Track 3
 * Redirects users from deprecated features to Track 3 alternatives
 */
export const DeprecatedRouteHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = featureDeprecationService.getRedirectForDeprecatedRoute(location.pathname);
    
    if (redirect) {
      // Log informational message
      const redirectName = redirect.to.split('/')[1] || 'home';
      console.log(
        `[Track 3] ${redirect.message || 'Redirecting to ' + redirectName}`
      );

      // Redirect to alternative
      navigate(redirect.to, { replace: true });
    } else {
      // No redirect found, go to home
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
};
