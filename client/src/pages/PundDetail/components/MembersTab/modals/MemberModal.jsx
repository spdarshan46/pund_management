// src/pages/PundDetail/components/MembersTab/modals/MemberModal.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, FiCalendar, FiPhone, FiX, FiCheckCircle, FiXCircle, 
  FiAward, FiCreditCard 
} from 'react-icons/fi';

const MemberModal = ({ isOpen, onClose, member }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!member) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-[90%] sm:max-w-sm md:max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl border-2 border-white/30">
                    {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                      {member.name || 'Unknown'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${
                        member.role === 'OWNER'
                          ? 'bg-purple-200 text-purple-800'
                          : 'bg-blue-200 text-blue-800'
                      }`}>
                        {member.role || 'MEMBER'}
                      </span>
                      {member.membership_active ? (
                        <span className="text-[10px] sm:text-xs text-white/90 flex items-center">
                          <FiCheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-xs text-white/70 flex items-center">
                          <FiXCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition text-white">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Member Details */}
            <div className="p-4 sm:p-5 space-y-3">
              {/* Email */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500">Email Address</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 break-all">{member.email}</p>
                </div>
              </div>

              {/* Joined Date */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] sm:text-xs text-gray-500">Joined Date</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    {new Date(member.joined_at || Date.now()).toLocaleDateString('en-IN', {
                      day: '2-digit', month: '2-digit', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Mobile */}
              {member.mobile && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiPhone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] sm:text-xs text-gray-500">Mobile Number</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{member.mobile}</p>
                  </div>
                </div>
              )}

              {/* Member Stats */}
              {(member.total_savings !== undefined || member.active_loans !== undefined) && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {member.total_savings !== undefined && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                      <FiAward className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mb-1" />
                      <p className="text-[8px] sm:text-[10px] text-blue-600">Total Saved</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">
                        ₹{(member.total_savings || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                  {member.active_loans !== undefined && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                      <FiCreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mb-1" />
                      <p className="text-[8px] sm:text-[10px] text-green-600">Active Loans</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">{member.active_loans || 0}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 sm:py-3 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm hover:bg-gray-100 transition font-medium shadow-sm"
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