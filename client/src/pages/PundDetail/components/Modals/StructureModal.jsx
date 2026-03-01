// src/pages/PundDetail/components/Modals/StructureModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const StructureModal = ({ isOpen, onClose, onSubmit, submitting }) => {
  const [structureData, setStructureData] = useState({
    saving_amount: '',
    loan_interest_percentage: '',
    missed_saving_penalty: '',
    missed_loan_penalty: '',
    default_loan_cycles: '6'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(structureData);
  };

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
            <h3 className="text-xl font-bold text-gray-900 mb-4">Set Pund Structure</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saving Amount (₹)
                </label>
                <input
                  type="number"
                  value={structureData.saving_amount}
                  onChange={(e) => setStructureData({ ...structureData, saving_amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Enter amount"
                  min="1"
                  step="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  value={structureData.loan_interest_percentage}
                  onChange={(e) => setStructureData({ ...structureData, loan_interest_percentage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Enter percentage"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Missed Saving Penalty (₹)
                </label>
                <input
                  type="number"
                  value={structureData.missed_saving_penalty}
                  onChange={(e) => setStructureData({ ...structureData, missed_saving_penalty: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Enter penalty amount"
                  min="0"
                  step="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Missed Loan Penalty (₹)
                </label>
                <input
                  type="number"
                  value={structureData.missed_loan_penalty}
                  onChange={(e) => setStructureData({ ...structureData, missed_loan_penalty: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Enter penalty amount"
                  min="0"
                  step="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Loan Cycles
                </label>
                <input
                  type="number"
                  value={structureData.default_loan_cycles}
                  onChange={(e) => setStructureData({ ...structureData, default_loan_cycles: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Enter number of cycles"
                  min="1"
                  step="1"
                  required
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Structure'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StructureModal;