// src/pages/PundDetail/components/LoansTab.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEye,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiTrendingUp,
  FiChevronDown,
  FiChevronUp,
  FiDollarSign,
  FiPercent,
  FiCalendar,
  FiUser
} from 'react-icons/fi';
import { formatCurrency } from '../../../utils/formatters';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const LoansTab = ({ role, loans, myLoans, pundData, onApproveLoan, approvingLoan }) => {
  const navigate = useNavigate();
  const [expandedLoan, setExpandedLoan] = useState(null);
  const [loanDetails, setLoanDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  // In the member view section, update the progress calculation
  const progress = loan.progress || 0; // Use the progress from API
  const paidInstallments = loan.paid_installments || 0;
  const totalInstallments = loan.total_installments || 0;
  const getStatusBadge = (status) => {
    switch (status) {
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

  const fetchLoanDetails = async (loanId) => {
    if (loanDetails[loanId]) {
      setExpandedLoan(expandedLoan === loanId ? null : loanId);
      return;
    }

    setLoadingDetails(prev => ({ ...prev, [loanId]: true }));
    try {
      const response = await api.get(`/finance/loan/${loanId}/detail/`);
      setLoanDetails(prev => ({ ...prev, [loanId]: response.data }));
      setExpandedLoan(loanId);
    } catch (error) {
      console.error('Error fetching loan details:', error);
      toast.error('Failed to load loan details');
    } finally {
      setLoadingDetails(prev => ({ ...prev, [loanId]: false }));
    }
  };

  const handleMarkInstallment = async (loanId, installmentId) => {
    try {
      const response = await api.post(`/finance/installment/${installmentId}/mark-paid/`);
      toast.success(response.data.message || 'Installment marked as paid');

      // Refresh loan details
      const detailsResponse = await api.get(`/finance/loan/${loanId}/detail/`);
      setLoanDetails(prev => ({ ...prev, [loanId]: detailsResponse.data }));
    } catch (error) {
      console.error('Error marking installment:', error);
      toast.error(error.response?.data?.error || 'Failed to mark installment');
    }
  };

  const calculateProgress = (loan) => {
    const totalPayable = parseFloat(loan.total_payable || loan.principal * 1.1);
    const paid = parseFloat(loan.paid_amount || 0);
    return (paid / totalPayable) * 100;
  };

  // Owner View - All Loan Requests
  if (role === 'OWNER') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Management</h3>

          {loans.length === 0 ? (
            <div className="text-center py-12">
              <FiTrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No loan requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => {
                const status = getStatusBadge(loan.status);
                const StatusIcon = status.icon;
                const progress = calculateProgress(loan);
                const isExpanded = expandedLoan === loan.loan_id;
                const details = loanDetails[loan.loan_id];
                const loading = loadingDetails[loan.loan_id];

                return (
                  <motion.div
                    key={loan.loan_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200"
                  >
                    {/* Loan Header - Always visible */}
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-100 transition"
                      onClick={() => fetchLoanDetails(loan.loan_id)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.bg}`}>
                            <StatusIcon className={`w-5 h-5 ${status.text}`} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">{loan.member}</h4>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                                {status.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              Principal: {formatCurrency(loan.principal)} |
                              Remaining: {formatCurrency(loan.remaining)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          {/* Progress Bar */}
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">Progress</span>
                              <span className="font-medium">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            {loan.status === 'PENDING' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const defaultCycles = pundData?.structure?.default_loan_cycles || 6;
                                  const cycles = prompt('Enter number of cycles for repayment:', defaultCycles);
                                  if (cycles) {
                                    const cyclesNum = parseInt(cycles);
                                    if (isNaN(cyclesNum) || cyclesNum <= 0) {
                                      toast.error('Please enter a valid number');
                                      return;
                                    }
                                    onApproveLoan(loan.loan_id, cyclesNum);
                                  }
                                }}
                                disabled={approvingLoan}
                                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                              >
                                {approvingLoan ? 'Approving...' : 'Approve'}
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/loan/${loan.loan_id}`);
                              }}
                              className="p-2 hover:bg-gray-200 rounded-lg transition"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4 text-gray-600" />
                            </button>
                            {isExpanded ? (
                              <FiChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <FiChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details - Installments */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-gray-200 bg-white"
                        >
                          <div className="p-4">
                            {loading ? (
                              <div className="text-center py-4">
                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                              </div>
                            ) : details ? (
                              <div className="space-y-4">
                                {/* Loan Summary */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-blue-600">Interest</p>
                                    <p className="text-sm font-bold">{details.interest_percentage}%</p>
                                  </div>
                                  <div className="p-2 bg-purple-50 rounded-lg">
                                    <p className="text-xs text-purple-600">Total Payable</p>
                                    <p className="text-sm font-bold">{formatCurrency(details.total_payable)}</p>
                                  </div>
                                  <div className="p-2 bg-orange-50 rounded-lg">
                                    <p className="text-xs text-orange-600">Remaining</p>
                                    <p className="text-sm font-bold">{formatCurrency(details.remaining_amount)}</p>
                                  </div>
                                  <div className="p-2 bg-green-50 rounded-lg">
                                    <p className="text-xs text-green-600">Status</p>
                                    <p className="text-sm font-bold">{details.status}</p>
                                  </div>
                                </div>

                                {/* Installments Table */}
                                <h5 className="font-medium text-gray-900">Installment Schedule</h5>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cycle</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Due Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">EMI</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Penalty</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {details.installments.map((inst, idx) => {
                                        const total = parseFloat(inst.emi_amount) + parseFloat(inst.penalty_amount);
                                        const isOverdue = !inst.is_paid && new Date(inst.due_date) < new Date();

                                        return (
                                          <tr key={idx} className={isOverdue ? 'bg-red-50' : ''}>
                                            <td className="px-4 py-2 text-sm">Cycle {inst.cycle_number}</td>
                                            <td className="px-4 py-2 text-sm">
                                              {new Date(inst.due_date).toLocaleDateString()}
                                              {isOverdue && <span className="ml-2 text-xs text-red-600">(Overdue)</span>}
                                            </td>
                                            <td className="px-4 py-2 text-sm">{formatCurrency(inst.emi_amount)}</td>
                                            <td className="px-4 py-2 text-sm">
                                              {parseFloat(inst.penalty_amount) > 0 ? (
                                                <span className="text-red-600">+{formatCurrency(inst.penalty_amount)}</span>
                                              ) : '-'}
                                            </td>
                                            <td className="px-4 py-2 text-sm font-medium">{formatCurrency(total)}</td>
                                            <td className="px-4 py-2">
                                              <span className={`px-2 py-0.5 text-xs rounded-full ${inst.is_paid
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {inst.is_paid ? 'Paid' : 'Pending'}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2">
                                              {!inst.is_paid && (
                                                <button
                                                  onClick={() => handleMarkInstallment(loan.loan_id, inst.id)}
                                                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                                >
                                                  Mark Paid
                                                </button>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <p className="text-center text-gray-500 py-2">No installment data available</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Member View - My Loans
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Loans</h3>

        {myLoans.length === 0 ? (
          <div className="text-center py-12">
            <FiTrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">You haven't taken any loans yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myLoans.map((loan) => {
              const status = getStatusBadge(loan.status);
              const StatusIcon = status.icon;
              const progress = loan.progress || 0;
              const isExpanded = expandedLoan === loan.loan_id;
              const details = loanDetails[loan.loan_id];
              const loading = loadingDetails[loan.loan_id];

              return (
                <motion.div
                  key={loan.loan_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200"
                >
                  {/* Loan Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => fetchLoanDetails(loan.loan_id)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.bg}`}>
                          <StatusIcon className={`w-5 h-5 ${status.text}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">{loan.pund}</h4>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Principal: {formatCurrency(loan.principal)} |
                            Remaining: {formatCurrency(loan.remaining)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        {/* Progress Bar */}
                        <div className="w-32">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium">{progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>{paidInstallments}/{totalInstallments} installments</span>
                          </div>
                        </div>

                        {/* Expand/Collapse */}
                        {isExpanded ? (
                          <FiChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-200 bg-white"
                      >
                        <div className="p-4">
                          {loading ? (
                            <div className="text-center py-4">
                              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                          ) : details ? (
                            <div className="space-y-4">
                              {/* Loan Summary */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                  <p className="text-xs text-blue-600">Interest</p>
                                  <p className="text-sm font-bold">{details.interest_percentage}%</p>
                                </div>
                                <div className="p-2 bg-purple-50 rounded-lg">
                                  <p className="text-xs text-purple-600">Total Payable</p>
                                  <p className="text-sm font-bold">{formatCurrency(details.total_payable)}</p>
                                </div>
                                <div className="p-2 bg-orange-50 rounded-lg">
                                  <p className="text-xs text-orange-600">Remaining</p>
                                  <p className="text-sm font-bold">{formatCurrency(details.remaining_amount)}</p>
                                </div>
                                <div className="p-2 bg-green-50 rounded-lg">
                                  <p className="text-xs text-green-600">Paid</p>
                                  <p className="text-sm font-bold">
                                    {formatCurrency(parseFloat(details.total_payable) - parseFloat(details.remaining_amount))}
                                  </p>
                                </div>
                              </div>

                              {/* Installments Table */}
                              <h5 className="font-medium text-gray-900">Installment Schedule</h5>
                              <div className="overflow-x-auto">
                                <table className="min-w-full">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cycle</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Due Date</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">EMI</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Penalty</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {details.installments.map((inst, idx) => {
                                      const total = parseFloat(inst.emi_amount) + parseFloat(inst.penalty_amount);
                                      const isOverdue = !inst.is_paid && new Date(inst.due_date) < new Date();

                                      return (
                                        <tr key={idx} className={isOverdue ? 'bg-red-50' : ''}>
                                          <td className="px-4 py-2 text-sm">Cycle {inst.cycle_number}</td>
                                          <td className="px-4 py-2 text-sm">
                                            {new Date(inst.due_date).toLocaleDateString()}
                                            {isOverdue && <span className="ml-2 text-xs text-red-600">(Overdue)</span>}
                                          </td>
                                          <td className="px-4 py-2 text-sm">{formatCurrency(inst.emi_amount)}</td>
                                          <td className="px-4 py-2 text-sm">
                                            {parseFloat(inst.penalty_amount) > 0 ? (
                                              <span className="text-red-600">+{formatCurrency(inst.penalty_amount)}</span>
                                            ) : '-'}
                                          </td>
                                          <td className="px-4 py-2 text-sm font-medium">{formatCurrency(total)}</td>
                                          <td className="px-4 py-2">
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${inst.is_paid
                                              ? 'bg-green-100 text-green-700'
                                              : 'bg-yellow-100 text-yellow-700'
                                              }`}>
                                              {inst.is_paid ? 'Paid' : 'Pending'}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-2">No installment data available</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoansTab;