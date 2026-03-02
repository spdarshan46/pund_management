// src/pages/PundDetail/components/Modals/InstallmentModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiCheckCircle, 
  FiClock, 
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiLoader
} from 'react-icons/fi';

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹ 0';
  const numAmount = parseFloat(amount) || 0;
  return `₹ ${numAmount.toLocaleString('en-IN')}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

const InstallmentModal = ({ isOpen, onClose, installments = [], loading = false, onMarkPaid, isOwner = false, markingPaid = false }) => {
  if (!isOpen) return null;

  const handleMarkPaid = (installmentId) => {
    if (onMarkPaid) onMarkPaid(installmentId);
  };

  // Sort installments by cycle number
  const sortedInstallments = [...installments].sort((a, b) => 
    (a.cycle_number || 0) - (b.cycle_number || 0)
  );

  // Get loan info from first installment
  const loanInfo = installments.length > 0 ? installments[0] : null;

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
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm sm:text-base">Loan Installments</h2>
                <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition text-white">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              {loanInfo && (
                <div className="flex items-center space-x-2 mt-1">
                  <FiUser className="w-3 h-3 text-white/80" />
                  <p className="text-[10px] text-white/80">
                    {loanInfo.member_email?.split('@')[0] || 'Member'} • Loan #{loanInfo.loan_id}
                  </p>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="ml-2 text-sm text-gray-600">Loading installments...</span>
                </div>
              ) : installments.length === 0 ? (
                <div className="text-center py-12">
                  <FiClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No installments found for this loan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedInstallments.map((inst, idx) => {
                    const emiAmount = parseFloat(inst.emi_amount || 0);
                    const penaltyAmount = parseFloat(inst.penalty_amount || 0);
                    const totalAmount = emiAmount + penaltyAmount;
                    
                    return (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              inst.is_paid ? 'bg-green-100' : 'bg-yellow-100'
                            }`}>
                              {inst.is_paid ? (
                                <FiCheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <FiClock className="w-5 h-5 text-yellow-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Cycle #{inst.cycle_number}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <div className="flex items-center space-x-1">
                                  <FiDollarSign className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-600">EMI: {formatCurrency(emiAmount)}</span>
                                </div>
                                {penaltyAmount > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-[10px] text-red-600">Penalty:</span>
                                    <span className="text-xs font-medium text-red-600">{formatCurrency(penaltyAmount)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-start sm:items-end">
                            <div className="flex items-center space-x-1 mb-1">
                              <FiCalendar className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">Due: {formatDate(inst.due_date)}</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">Total: {formatCurrency(totalAmount)}</p>
                          </div>
                        </div>
                        {isOwner && !inst.is_paid && (
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => handleMarkPaid(inst.id)}
                              disabled={markingPaid}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                            >
                              {markingPaid ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Marking...</span>
                                </>
                              ) : (
                                <>
                                  <FiCheckCircle className="w-4 h-4" />
                                  <span>Mark as Paid</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <button onClick={onClose} className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-100 transition font-medium">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallmentModal;