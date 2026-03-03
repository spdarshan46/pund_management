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
  FiLoader,
  FiTrendingUp
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

  // Calculate summary
  const totalEMI = sortedInstallments.reduce((sum, inst) => sum + parseFloat(inst.emi_amount || 0), 0);
  const totalPenalty = sortedInstallments.reduce((sum, inst) => sum + parseFloat(inst.penalty_amount || 0), 0);
  const paidEMI = sortedInstallments
    .filter(inst => inst.is_paid)
    .reduce((sum, inst) => sum + parseFloat(inst.emi_amount || 0), 0);
  const paidCount = sortedInstallments.filter(inst => inst.is_paid).length;
  const totalCount = sortedInstallments.length;
  const progress = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  // Get loan info from first installment
  const loanInfo = installments.length > 0 ? installments[0] : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ultra Compact Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiTrendingUp className="w-3.5 h-3.5 text-white/90" />
                  <h2 className="text-white font-medium text-xs">Installments</h2>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition text-white">
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
              {loanInfo && (
                <div className="flex items-center space-x-2 mt-0.5">
                  <FiUser className="w-2.5 h-2.5 text-white/70" />
                  <p className="text-[9px] text-white/70 truncate">
                    {loanInfo.member_email?.split('@')[0] || 'Member'} • #{loanInfo.loan_id}
                  </p>
                </div>
              )}
            </div>

            {/* Ultra Compact Summary Bar */}
            {!loading && installments.length > 0 && (
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-100">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">Progress:</span>
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-600" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="font-medium text-gray-900">{paidCount}/{totalCount}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">Paid:</span>
                    <span className="font-medium text-green-600">{formatCurrency(paidEMI)}</span>
                    {totalPenalty > 0 && (
                      <>
                        <span className="text-gray-400">|</span>
                        <span className="text-orange-600">Pen: {formatCurrency(totalPenalty)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Ultra Compact Body */}
            <div className="p-2 overflow-y-auto max-h-[calc(95vh-100px)]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <FiLoader className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="ml-2 text-xs text-gray-600">Loading...</span>
                </div>
              ) : installments.length === 0 ? (
                <div className="text-center py-8">
                  <FiClock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No installments</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {sortedInstallments.map((inst, idx) => {
                    const emiAmount = parseFloat(inst.emi_amount || 0);
                    const penaltyAmount = parseFloat(inst.penalty_amount || 0);
                    const isOverdue = !inst.is_paid && new Date(inst.due_date) < new Date();
                    
                    return (
                      <div 
                        key={idx} 
                        className={`border rounded-lg p-2.5 ${
                          inst.is_paid 
                            ? 'bg-green-50/50 border-green-100' 
                            : isOverdue 
                              ? 'bg-red-50/50 border-red-100' 
                              : 'bg-white border-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              inst.is_paid ? 'bg-green-100' : isOverdue ? 'bg-red-100' : 'bg-yellow-100'
                            }`}>
                              {inst.is_paid ? (
                                <FiCheckCircle className="w-3 h-3 text-green-600" />
                              ) : (
                                <FiClock className={`w-3 h-3 ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium text-gray-900">#{inst.cycle_number}</span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                                  inst.is_paid 
                                    ? 'bg-green-100 text-green-700' 
                                    : isOverdue 
                                      ? 'bg-red-100 text-red-700' 
                                      : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {inst.is_paid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <div className="flex items-center space-x-0.5">
                                  <FiDollarSign className="w-2.5 h-2.5 text-gray-400" />
                                  <span className="text-[9px] font-medium text-gray-900">{formatCurrency(emiAmount)}</span>
                                </div>
                                {penaltyAmount > 0 && (
                                  <div className="flex items-center space-x-0.5">
                                    <span className="text-[8px] text-red-600">+{formatCurrency(penaltyAmount)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center space-x-1">
                              <FiCalendar className="w-2.5 h-2.5 text-gray-300" />
                              <span className="text-[8px] text-gray-500">{formatDate(inst.due_date)}</span>
                            </div>
                            <span className="text-[9px] font-semibold text-gray-900 mt-0.5">
                              {formatCurrency(emiAmount + penaltyAmount)}
                            </span>
                          </div>
                        </div>
                        
                        {isOwner && !inst.is_paid && (
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => handleMarkPaid(inst.id)}
                              disabled={markingPaid}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-[8px] hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
                            >
                              {markingPaid ? (
                                <>
                                  <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>...</span>
                                </>
                              ) : (
                                <>
                                  <FiCheckCircle className="w-2.5 h-2.5" />
                                  <span>Mark Paid</span>
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

            {/* Ultra Compact Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={onClose} 
                className="w-full px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-[9px] hover:bg-gray-50 transition font-medium"
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

export default InstallmentModal;