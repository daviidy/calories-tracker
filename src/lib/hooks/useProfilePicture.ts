import { useAuth } from '@/lib/context/AuthContext';
import md5 from 'md5';

export const useProfilePicture = () => {
  const { user } = useAuth();

  // Generate Gravatar URL
  const gravatarUrl = user?.email ? 
    `https://www.gravatar.com/avatar/${md5(user.email.toLowerCase().trim())}?d=mp` : 
    '/default-avatar.png';

  return {
    gravatarUrl
  };
}; 