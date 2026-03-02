import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInfo, FiAlertCircle, FiX, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return `₹ ${numAmount.toLocaleString('en-IN')}`;
};

const LoanModal = ({ isOpen, onClose, onSubmit, submitting, availableFund = 0 }) => {
  const [loanRequest, setLoanRequest] = useState({ principal_amount: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setLoanRequest({ principal_amount: '' });
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setLoanRequest({ principal_amount: value });
    
    // Real-time validation
    const amount = parseFloat(value);
    if (!value) {
      setError('');
      setSuccess('');
    } else if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      setSuccess('');
    } else if (amount > availableFund) {
      setError(`Requested amount exceeds available fund by ${formatCurrency(amount - availableFund)}`);
      setSuccess('');
    } else {
      setError('');
      setSuccess(`You can request up to ${formatCurrency(availableFund)}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(loanRequest.principal_amount);
    
    // Validation checks
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount > availableFund) {
      toast.error(`Insufficient funds! Available balance is ${formatCurrency(availableFund)}`);
      return;
    }

    onSubmit(loanRequest);
  };

  const setMaxAmount = () => {
    setLoanRequest({ principal_amount: availableFund.toString() });
    setError('');
    setSuccess(`Maximum amount ${formatCurrency(availableFund)} selected`);
  };

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
            className="bg-white rounded-xl shadow-2xl w-full max-w-[95%] sm:max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm sm:text-base">Request Loan</h3>
                <button 
                  onClick={onClose} 
                  className="p-1.5 hover:bg-white/10 rounded-lg transition text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5">
              {/* Available Fund Display */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiDollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] sm:text-xs font-medium text-blue-700">Available Fund</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-blue-800">
                    {formatCurrency(availableFund)}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1">
                    Loan Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={loanRequest.principal_amount}
                    onChange={handleAmountChange}
                    className={`w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-1 ${
                      error 
                        ? 'border-red-300 focus:ring-red-500/20' 
                        : loanRequest.principal_amount && !error
                        ? 'border-green-300 focus:ring-green-500/20'
                        : 'border-gray-200 focus:ring-blue-500/20'
                    }`}
                    placeholder={`Enter amount (max ${formatCurrency(availableFund)})`}
                    min="1"
                    max={availableFund}
                    step="1"
                    required
                  />
                  
                  {/* Live Validation Message */}
                  {error && (
                    <p className="mt-1 text-[8px] text-red-600 flex items-center">
                      <FiAlertCircle className="w-3 h-3 mr-1" />
                      {error}
                    </p>
                  )}
                  
                  {/* Success Message */}
                  {success && !error && loanRequest.principal_amount && (
                    <p className="mt-1 text-[8px] text-green-600 flex items-center">
                      <FiCheckCircle className="w-3 h-3 mr-1" />
                      {success}
                    </p>
                  )}
                </div>

                {/* Max Amount Button */}
                {availableFund > 0 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={setMaxAmount}
                      className="text-[8px] text-blue-600 hover:text-blue-700 underline"
                    >
                      Request maximum amount
                    </button>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-[8px] sm:text-[10px] text-yellow-700">
                    <span className="font-medium">Note:</span> Your loan request will be reviewed by the pund owner. 
                    Approval depends on available fund and your repayment capacity.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-[10px] sm:text-xs hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !!error || !loanRequest.principal_amount || parseFloat(loanRequest.principal_amount) > availableFund}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-[10px] sm:text-xs hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoanModal;