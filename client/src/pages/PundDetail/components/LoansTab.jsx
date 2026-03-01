// src/pages/PundDetail/components/LoansTab.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { formatCurrency } from '../../../utils/formatters';
import { toast } from 'react-hot-toast';

const LoansTab = ({ role, loans, myLoans, pundData, onApproveLoan, approvingLoan }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APPROVED':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          icon: FiCheckCircle,
          label: 'Approved'
        };
      case 'PENDING':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          icon: FiClock,
          label: 'Pending'
        };
      case 'REJECTED':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          icon: FiAlertCircle,
          label: 'Rejected'
        };
      case 'CLOSED':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: FiCheckCircle,
          label: 'Closed'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: FiClock,
          label: status
        };
    }
  };

  const calculateProgress = (loan) => {
    if (!loan) return 0;
    const totalPayable = parseFloat(loan.total_payable || loan.principal * 1.1);
    const remaining = parseFloat(loan.remaining);
    const paid = totalPayable - remaining;
    return (paid / totalPayable) * 100;
  };

  const handleViewDetails = (loanId) => {
    console.log('Navigating to loan details:', loanId);
    // Force navigation to loan detail page
    navigate(`/loan/${loanId}`);
  };

  // Member View - My Loans
  if (role === 'MEMBER') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Loans</h3>
          
          {!myLoans || myLoans.length === 0 ? (
            <div className="text-center py-12">
              <FiTrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">You haven't taken any loans yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myLoans.map((loan, index) => {
                const status = getStatusBadge(loan.status);
                const StatusIcon = status.icon;
                const progress = calculateProgress(loan);
                const totalPayable = parseFloat(loan.total_payable || loan.principal * 1.1);
                const interest = totalPayable - parseFloat(loan.principal);
                const paidAmount = totalPayable - parseFloat(loan.remaining);
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Loan Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{loan.pund}</h4>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text} flex items-center`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </span>
                        </div>

                        {/* Loan Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500">Principal</p>
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(loan.principal)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Interest</p>
                            <p className="text-sm font-semibold text-blue-600">{formatCurrency(interest)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total Payable</p>
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(totalPayable)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Remaining</p>
                            <p className="text-sm font-semibold text-orange-600">{formatCurrency(loan.remaining)}</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {loan.status === 'APPROVED' && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">Repayment Progress</span>
                              <span className="font-medium">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-gradient-to-r from-green-500 to-green-600"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => handleViewDetails(loan.loan_id)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center justify-center min-w-[120px]"
                      >
                        <FiEye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                    </div>

                    {/* Payment Summary */}
                    <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Principal Borrowed:</span>
                        <span className="ml-2 font-medium text-gray-900">{formatCurrency(loan.principal)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Interest Accrued:</span>
                        <span className="ml-2 font-medium text-blue-600">{formatCurrency(interest)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Paid So Far:</span>
                        <span className="ml-2 font-medium text-green-600">{formatCurrency(paidAmount)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Owner View - keep existing code...
  return (
    <div className="space-y-6">
      {/* Owner view implementation */}
    </div>
  );
};

export default LoansTab;