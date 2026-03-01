// src/pages/LoanDetail.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiPercent,
  FiUser,
  FiHome
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

const LoanDetail = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState(false);

  useEffect(() => {
    console.log('LoanDetail mounted with loanId:', loanId);
    if (loanId) {
      fetchLoanDetails();
    }
  }, [loanId]);

  const fetchLoanDetails = async () => {
    setLoading(true);
    try {
      console.log('Fetching loan details for ID:', loanId);
      const response = await api.get(`/finance/loan/${loanId}/detail/`);
      console.log('Loan details response:', response.data);
      setLoan(response.data);
    } catch (error) {
      console.error('Error fetching loan:', error);
      toast.error('Failed to load loan details');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkInstallment = async (installmentId) => {
    setMarkingPaid(true);
    try {
      const response = await api.post(`/finance/installment/${installmentId}/mark-paid/`);
      toast.success(response.data.message || 'Installment marked as paid');
      fetchLoanDetails(); // Refresh data
    } catch (error) {
      console.error('Error marking installment:', error);
      toast.error(error.response?.data?.error || 'Failed to mark installment');
    } finally {
      setMarkingPaid(false);
    }
  };

  const getStatusIcon = (isPaid, dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    
    if (isPaid) {
      return <FiCheckCircle className="w-5 h-5 text-green-500" />;
    } else if (due < today) {
      return <FiXCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <FiClock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (isPaid, dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    
    if (isPaid) return 'Paid';
    if (due < today) return 'Overdue';
    return 'Pending';
  };

  const getStatusColor = (isPaid, dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    
    if (isPaid) return 'text-green-600 bg-green-100';
    if (due < today) return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const calculateProgress = () => {
    if (!loan) return 0;
    const totalPaid = loan.installments
      .filter(inst => inst.is_paid)
      .reduce((sum, inst) => sum + parseFloat(inst.emi_amount) + parseFloat(inst.penalty_amount || 0), 0);
    const totalPayable = parseFloat(loan.total_payable);
    return (totalPaid / totalPayable) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading loan details...</p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loan not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const totalPaid = loan.installments
    .filter(inst => inst.is_paid)
    .reduce((sum, inst) => sum + parseFloat(inst.emi_amount) + parseFloat(inst.penalty_amount || 0), 0);
  const remaining = parseFloat(loan.remaining_amount);
  const paidCount = loan.installments.filter(inst => inst.is_paid).length;
  const totalCount = loan.installments.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Loan Details</h1>
                <p className="text-sm text-gray-500">Loan ID: {loanId}</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">
                {paidCount} of {totalCount} Installments Paid
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Principal Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(loan.principal)}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Interest Rate</p>
            <p className="text-2xl font-bold text-gray-900">{loan.interest_percentage}%</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Payable</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(loan.total_payable)}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Remaining</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(remaining)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Repayment Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Paid: {formatCurrency(totalPaid)}</span>
              <span className="text-gray-600">Remaining: {formatCurrency(remaining)}</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{Math.round(progress)}% Complete</span>
              <span>{paidCount} of {totalCount} Installments</span>
            </div>
          </div>
        </div>

        {/* Installments Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Installment Schedule</h3>
          
          {loan.installments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No installments found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cycle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EMI Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Penalty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loan.installments.map((inst, index) => {
                    const totalAmount = parseFloat(inst.emi_amount) + parseFloat(inst.penalty_amount || 0);
                    const statusColor = getStatusColor(inst.is_paid, inst.due_date);
                    const statusText = getStatusText(inst.is_paid, inst.due_date);
                    
                    return (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Cycle {inst.cycle_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(inst.emi_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {inst.penalty_amount > 0 ? (
                            <span className="text-red-600 font-medium">
                              +{formatCurrency(inst.penalty_amount)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {formatCurrency(totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(inst.due_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {getStatusIcon(inst.is_paid, inst.due_date)}
                            <span className="ml-1">{statusText}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {!inst.is_paid && (
                            <button
                              onClick={() => handleMarkInstallment(inst.id)}
                              disabled={markingPaid}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                              {markingPaid ? 'Marking...' : 'Mark Paid'}
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDetail;