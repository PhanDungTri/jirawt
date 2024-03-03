import { isUnauthorizedError } from '@errors/unauthorized-error';
import { showUnauthorizedErrorNotification } from '@utils/notification';
import { useLocation } from 'wouter';

export const useUnauthorziedHandler = () => {
  const [location, setLocation] = useLocation();

  const handleUnauthorizedError = (e: unknown) => {
    if (isUnauthorizedError(e)) {
      showUnauthorizedErrorNotification();

      if (location !== '/') {
        setLocation('/');
      }
    }
  };

  return handleUnauthorizedError;
};
