// src/pages/PundDetail/components/Modals/MemberModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiUser, FiAward, FiCalendar, FiPhone } from 'react-icons/fi';

const MemberModal = ({ isOpen, onClose, member }) => {
  if (!member) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                {member.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full inline-block mt-2 ${
                  member.role === 'OWNER'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {member.role}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <FiMail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{member.email}</span>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <FiCalendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Member since: {new Date().toLocaleDateString()}</span>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <FiAward className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">
                  Status: {member.membership_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {member.mobile && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FiPhone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{member.mobile}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MemberModal;