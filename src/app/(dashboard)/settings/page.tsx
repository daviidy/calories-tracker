'use client';

import { useAuth } from '@/lib/context/AuthContext';
import Image from 'next/image';
import { useProfilePicture } from '@/lib/hooks/useProfilePicture';

const SettingsPage = () => {
  const { user } = useAuth();
  const { gravatarUrl } = useProfilePicture();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h2>
        
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Image
              src={gravatarUrl}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full object-cover"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {user?.email?.split('@')[0]}
            </h3>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 