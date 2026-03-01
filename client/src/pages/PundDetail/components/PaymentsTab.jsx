// src/pages/PundDetail/components/PaymentsTab.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDollarSign, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock,
  FiDownload,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiUser,
  FiTrendingUp
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount);
};

// Helper function to safely parse amounts
const parseAmount = (value) => {
  if (value === null || value === undefined) return 0;
  return parseFloat(value) || 0;
};

const PaymentsTab = ({ pundId, pundData }) => {
  const [payments, setPayments] = useState([]);
  const [cycleData, setCycleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({
    totalCycles: 0,
    totalMembers: 0,
    totalExpected: 0,
    totalCollected: 0,
    totalPenalties: 0,
    pendingCount: 0
  });

  useEffect(() => {
    fetchPayments();
  }, [pundId]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Fetch cycle payments data
      let cycleResponse = { data: [] };
      try {
        cycleResponse = await api.get(`/finance/pund/${pundId}/cycle-payments/`);
        console.log('Cycle data from API:', cycleResponse.data);
      } catch (error) {
        console.log('Cycle payments endpoint not available, using mock data');
        // Generate mock cycle data
        cycleResponse.data = generateMockCycleData();
      }
      
      setCycleData(cycleResponse.data);
      
      // Flatten all payments from cycles for the table
      const allPayments = [];
      cycleResponse.data.forEach(cycle => {
        cycle.payments.forEach(payment => {
          allPayments.push({
            ...payment,
            cycle_number: cycle.cycle_number,
            amount: parseAmount(payment.amount),
            penalty_amount: parseAmount(payment.penalty_amount)
          });
        });
      });
      
      setPayments(allPayments);
      
      // Calculate summary from cycle data (more accurate)
      const totalExpected = cycleResponse.data.reduce((sum, cycle) => sum + parseAmount(cycle.total_expected), 0);
      const totalCollected = cycleResponse.data.reduce((sum, cycle) => sum + parseAmount(cycle.total_collected), 0);
      const totalPenalties = cycleResponse.data.reduce((sum, cycle) => sum + parseAmount(cycle.total_penalties), 0);
      
      // Get unique members count
      const uniqueMembers = new Set();
      allPayments.forEach(p => uniqueMembers.add(p.member_id));
      
      const pendingCount = allPayments.filter(p => !p.is_paid).length;
      
      setSummary({
        totalCycles: cycleResponse.data.length,
        totalMembers: uniqueMembers.size,
        totalExpected,
        totalCollected,
        totalPenalties,
        pendingCount
      });
      
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  // Generate mock cycle data for development
  const generateMockCycleData = () => {
    const members = [
      { id: 1, name: 'Rahul', email: 'spdarshan25@gmail.com' },
      { id: 2, name: 'Darshan', email: 'spdarshan252@gmail.com' },
      { id: 3, name: 'Darshandanu', email: 'thanujshetty2@gmail.com' }
    ];
    
    const cycles = [];
    
    // Cycle 1: All paid
    const cycle1Payments = members.map((member, index) => ({
      id: 100 + index,
      member_id: member.id,
      member_name: member.name,
      member_email: member.email,
      amount: 25000,
      penalty_amount: 0,
      is_paid: true,
      due_date: new Date(2026, 1, 15).toISOString().split('T')[0],
      paid_at: new Date(2026, 1, 14).toISOString()
    }));
    
    cycles.push({
      cycle_number: 1,
      total_expected: 75000,
      total_collected: 75000,
      total_penalties: 0,
      paid_count: 3,
      total_count: 3,
      progress: 100,
      due_date: new Date(2026, 1, 15).toISOString().split('T')[0],
      payments: cycle1Payments
    });
    
    // Cycle 2: 2 paid, 1 pending
    const cycle2Payments = members.map((member, index) => ({
      id: 200 + index,
      member_id: member.id,
      member_name: member.name,
      member_email: member.email,
      amount: 25000,
      penalty_amount: index === 2 ? 250 : 0,
      is_paid: index !== 2,
      due_date: new Date(2026, 1, 22).toISOString().split('T')[0],
      paid_at: index !== 2 ? new Date(2026, 1, 21).toISOString() : null
    }));
    
    cycles.push({
      cycle_number: 2,
      total_expected: 75000,
      total_collected: 50000 + 250, // 2 paid + 1 penalty
      total_penalties: 250,
      paid_count: 2,
      total_count: 3,
      progress: 66.67,
      due_date: new Date(2026, 1, 22).toISOString().split('T')[0],
      payments: cycle2Payments
    });
    
    // Cycle 3: All pending
    const cycle3Payments = members.map((member, index) => ({
      id: 300 + index,
      member_id: member.id,
      member_name: member.name,
      member_email: member.email,
      amount: 25000,
      penalty_amount: 0,
      is_paid: false,
      due_date: new Date(2026, 2, 1).toISOString().split('T')[0],
      paid_at: null
    }));
    
    cycles.push({
      cycle_number: 3,
      total_expected: 75000,
      total_collected: 0,
      total_penalties: 0,
      paid_count: 0,
      total_count: 3,
      progress: 0,
      due_date: new Date(2026, 2, 1).toISOString().split('T')[0],
      payments: cycle3Payments
    });
    
    return cycles;
  };

  const handleMarkPaid = async (paymentId) => {
    try {
      const response = await api.post(`/finance/payment/${paymentId}/mark-paid/`);
      toast.success(response.data.message || 'Payment marked as paid');
      fetchPayments(); // Refresh data
    } catch (error) {
      console.error('Error marking payment:', error);
      toast.error(error.response?.data?.error || 'Failed to mark payment');
    }
  };

  const getUniqueCycles = () => {
    return cycleData.map(c => c.cycle_number).sort((a, b) => a - b);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesCycle = selectedCycle === 'all' || payment.cycle_number === parseInt(selectedCycle);
    const matchesSearch = payment.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.member_email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCycle && matchesSearch;
  });

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

  const exportPayments = () => {
    const dataStr = JSON.stringify({
      summary,
      cycles: cycleData,
      payments: filteredPayments,
      generatedAt: new Date().toISOString()
    }, null, 2);
    
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `pund-${pundId}-payments.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Payments exported successfully');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Cycles</p>
          <p className="text-2xl font-bold text-gray-900">{summary.totalCycles}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-bold text-gray-900">{summary.totalMembers}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Expected</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalExpected)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Collected</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalCollected)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-orange-600">{summary.pendingCount}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Cycles</option>
                {getUniqueCycles().map(cycle => (
                  <option key={cycle} value={cycle}>Cycle {cycle}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
              />
            </div>
          </div>

          <button
            onClick={exportPayments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <FiDownload className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cycle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const status = getStatusBadge(payment);
                  const StatusIcon = status.icon;
                  const amount = parseAmount(payment.amount);
                  const penalty = parseAmount(payment.penalty_amount);
                  const totalAmount = amount + penalty;

                  return (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Cycle {payment.cycle_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-3">
                            {payment.member_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{payment.member_name}</p>
                            <p className="text-xs text-gray-500">{payment.member_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {penalty > 0 ? (
                          <span className="text-red-600 font-medium">
                            +{formatCurrency(penalty)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(payment.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {!payment.is_paid && (
                          <button
                            onClick={() => handleMarkPaid(payment.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;