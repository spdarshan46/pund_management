// src/pages/PundDetail/components/MembersTab/modals/RemoveConfirmModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';

const RemoveConfirmModal = ({ isOpen, onClose, member, onConfirm, loading }) => {
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
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-xl max-w-sm w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FiTrash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Remove Member</h3>
            </div>
            
            <p className="text-xs text-gray-600 mb-4">
              Are you sure you want to remove <span className="font-medium">{member.name}</span> from this pund?
            </p>
            
            <p className="text-[10px] text-gray-500 mb-4 bg-yellow-50 p-2 rounded">
              Note: Member must have no active loans to be removed.
            </p>

            <div className="flex space-x-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Remove'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RemoveConfirmModal;