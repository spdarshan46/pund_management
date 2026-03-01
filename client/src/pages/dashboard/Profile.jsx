// src/pages/dashboard/Profile.jsx
import React from 'react';
import { FiUser, FiMail } from 'react-icons/fi';

const Profile = ({ userName, userEmail }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-base font-semibold text-gray-900 mb-3">Profile</h1>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{userName}</h2>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
            <FiUser className="w-3.5 h-3.5 text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-500">Name</p>
              <p className="text-xs font-medium text-gray-900">{userName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
            <FiMail className="w-3.5 h-3.5 text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-500">Email</p>
              <p className="text-xs font-medium text-gray-900">{userEmail}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;