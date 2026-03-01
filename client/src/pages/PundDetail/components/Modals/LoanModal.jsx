// src/pages/PundDetail/components/Modals/LoanModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoanModal = ({ isOpen, onClose, onSubmit, submitting }) => {
  const [loanRequest, setLoanRequest] = useState({ principal_amount: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(loanRequest);
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Loan</h3>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Please enter the amount you wish to borrow. The loan will be reviewed by the pund owner.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Principal Amount (₹)
                </label>
                <input
                  type="number"
                  value={loanRequest.principal_amount}
                  onChange={(e) => setLoanRequest({ principal_amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Enter amount"
                  min="1"
                  step="1"
                  required
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoanModal;