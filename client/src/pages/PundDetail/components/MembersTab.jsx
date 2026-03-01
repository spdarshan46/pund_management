// src/pages/PundDetail/components/MembersTab.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiUser, FiMail } from 'react-icons/fi';

const MembersTab = ({ members, totalMembers, onViewMember }) => {
  console.log('Members data:', members); // Debug log

  if (!members || members.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
        <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Found</h3>
        <p className="text-gray-500">This pund doesn't have any members yet</p>
      </div>
    );
  }

  // Filter out owner and only show members
  const memberList = members.filter(member => member.role !== 'OWNER');

  if (memberList.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
        <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Found</h3>
        <p className="text-gray-500">Only owner exists in this pund</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Members ({memberList.length})</h3>
      <div className="space-y-3">
        {memberList.map((member, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.01 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition gap-3"
            onClick={() => onViewMember(member)}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold relative">
                {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{member.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500 truncate">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-end sm:justify-start space-x-3 ml-16 sm:ml-0">
              <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                member.membership_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {member.membership_active ? 'Active' : 'Inactive'}
              </span>
              <FiEye className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MembersTab;