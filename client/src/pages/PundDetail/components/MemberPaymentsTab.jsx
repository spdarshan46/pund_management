// src/pages/PundDetail/components/MemberPaymentsTab.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDollarSign, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock,
  FiCalendar,
  FiTrendingUp,
  FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import { formatCurrency } from '../../../utils/formatters';

const MemberPaymentsTab = ({ pundId, userEmail }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalPenalty: 0,
    paidCount: 0,
    pendingCount: 0,
    nextDueDate: null
  });

  useEffect(() => {
    fetchMyPayments();
  }, [pundId]);

  const fetchMyPayments = async () => {
    setLoading(true);
    try {
      // Fetch cycle payments data
      const response = await api.get(`/finance/pund/${pundId}/cycle-payments/`);
      console.log('Cycle data for member:', response.data);
      
      // Get current user email from localStorage
      const currentUserEmail = localStorage.getItem('user_email') || userEmail;
      
      // Extract only current user's payments
      const myPayments = [];
      let totalPaid = 0;
      let totalPending = 0;
      let totalPenalty = 0;
      let paidCount = 0;
      let pendingCount = 0;
      let nextDue = null;

      response.data.forEach(cycle => {
        cycle.payments.forEach(payment => {
          // Check if this payment belongs to current user
          if (payment.member_email === currentUserEmail) {
            const amount = parseFloat(payment.amount) || 0;
            const penalty = parseFloat(payment.penalty_amount) || 0;
            const total = amount + penalty;
            
            myPayments.push({
              ...payment,
              cycle_number: cycle.cycle_number,
              amount,
              penalty_amount: penalty,
              total,
              due_date: new Date(payment.due_date)
            });

            if (payment.is_paid) {
              totalPaid += total;
              paidCount++;
            } else {
              totalPending += amount;
              pendingCount++;
              if (!nextDue || new Date(payment.due_date) < nextDue) {
                nextDue = new Date(payment.due_date);
              }
            }
            totalPenalty += penalty;
          }
        });
      });

      // Sort payments by cycle number
      myPayments.sort((a, b) => a.cycle_number - b.cycle_number);
      
      setPayments(myPayments);
      setSummary({
        totalPaid,
        totalPending,
        totalPenalty,
        paidCount,
        pendingCount,
        nextDueDate: nextDue
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load your payments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (payment) => {
    if (payment.is_paid) {
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: FiCheckCircle,
        label: 'Paid'
      };
    } else if (new Date(payment.due_date) < new Date()) {
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: FiXCircle,
        label: 'Overdue'
      };
    } else {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: FiClock,
        label: 'Pending'
      };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your payment history...</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
        <FiAlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Found</h3>
        <p className="text-gray-500">You haven't made any payments in this pund yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5"
        >
          <p className="text-sm text-green-600 mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalPaid)}</p>
          <p className="text-xs text-green-600 mt-1">{summary.paidCount} payments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5"
        >
          <p className="text-sm text-yellow-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalPending)}</p>
          <p className="text-xs text-yellow-600 mt-1">{summary.pendingCount} payments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5"
        >
          <p className="text-sm text-orange-600 mb-1">Penalties</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalPenalty)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5"
        >
          <p className="text-sm text-blue-600 mb-1">Next Due</p>
          <p className="text-2xl font-bold text-gray-900">
            {summary.nextDueDate ? summary.nextDueDate.toLocaleDateString() : 'No pending'}
          </p>
        </motion.div>
      </div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cycle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penalty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment, index) => {
                const status = getStatusBadge(payment);
                const StatusIcon = status.icon;

                return (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Cycle {payment.cycle_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.penalty_amount > 0 ? (
                        <span className="text-red-600 font-medium">
                          +{formatCurrency(payment.penalty_amount)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {formatCurrency(payment.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.due_date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '-'}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default MemberPaymentsTab;