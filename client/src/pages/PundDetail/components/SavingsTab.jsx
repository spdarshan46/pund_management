// src/pages/PundDetail/components/SavingsTab.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEye, 
  FiChevronDown, 
  FiChevronUp,
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { formatCurrency } from '../../../utils/formatters';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const SavingsTab = ({ role, savingSummary, myFinancials, pundId }) => {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCycle, setExpandedCycle] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    if (role === 'OWNER' && pundId) {
      fetchCycleData();
    }
  }, [role, pundId, refreshKey]);

  const fetchCycleData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/finance/pund/${pundId}/cycle-payments/`);
      console.log('Cycle data:', response.data);
      setCycles(response.data);
    } catch (error) {
      console.error('Error fetching cycle data:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseAmount = (value) => {
    if (!value) return 0;
    return parseFloat(value) || 0;
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const toggleCycleExpand = (cycleNumber) => {
    setExpandedCycle(expandedCycle === cycleNumber ? null : cycleNumber);
  };

  const getCycleStatusColor = (progress) => {
    if (progress >= 100) return 'text-green-600 bg-green-100';
    if (progress >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPaymentStatusIcon = (isPaid, dueDate) => {
    if (isPaid) return <FiCheckCircle className="w-4 h-4 text-green-500" />;
    if (new Date(dueDate) < new Date()) return <FiXCircle className="w-4 h-4 text-red-500" />;
    return <FiClock className="w-4 h-4 text-yellow-500" />;
  };

  // Owner View
  if (role === 'OWNER') {
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Savings Overview</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <FiTrendingUp className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <p className="text-sm text-blue-600 mb-1">Total Cycles</p>
              <p className="text-2xl font-bold text-gray-900">{savingSummary?.total_cycles || 0}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <p className="text-sm text-purple-600 mb-1">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{savingSummary?.total_members || 0}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
              <p className="text-sm text-yellow-600 mb-1">Expected</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(parseAmount(savingSummary?.total_expected_savings))}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <p className="text-sm text-green-600 mb-1">Collected</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(parseAmount(savingSummary?.total_paid_savings))}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
              <p className="text-sm text-red-600 mb-1">Unpaid</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(parseAmount(savingSummary?.total_unpaid_savings))}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <p className="text-sm text-orange-600 mb-1">Penalties</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(parseAmount(savingSummary?.total_penalties_collected))}</p>
            </div>
          </div>
        </motion.div>

        {/* Cycles Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Cycle Details</h3>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-sm rounded-md transition ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm rounded-md transition ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading cycle data...</p>
            </div>
          ) : cycles.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <FiPieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Cycles Generated</h4>
              <p className="text-gray-500 mb-4">Generate your first cycle to start tracking savings</p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Generate Cycle
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View - Cycle Summary Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cycles.map((cycle) => {
                const progress = cycle.progress;
                const statusColor = getCycleStatusColor(progress);
                const totalExpected = parseAmount(cycle.total_expected);
                const totalCollected = parseAmount(cycle.total_collected);
                const totalPenalties = parseAmount(cycle.total_penalties);
                
                return (
                  <motion.div
                    key={cycle.cycle_number}
                    whileHover={{ y: -4 }}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => toggleCycleExpand(cycle.cycle_number)}
                  >
                    {/* Card Header */}
                    <div className="p-5 border-b border-gray-200 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-bold text-gray-900">Cycle {cycle.cycle_number}</h4>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                          {progress}% Complete
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Due: {cycle.due_date ? new Date(cycle.due_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{cycle.paid_count}/{cycle.total_count} paid</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <p className="text-xs text-blue-600">Expected</p>
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(totalExpected)}</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                          <p className="text-xs text-green-600">Collected</p>
                          <p className="text-sm font-bold text-green-600">{formatCurrency(totalCollected)}</p>
                        </div>
                      </div>

                      {/* Penalty Info */}
                      {totalPenalties > 0 && (
                        <div className="p-2 bg-red-50 rounded-lg flex justify-between items-center">
                          <span className="text-xs text-red-600">Penalties</span>
                          <span className="text-sm font-bold text-red-600">{formatCurrency(totalPenalties)}</span>
                        </div>
                      )}

                      {/* Expand Indicator */}
                      <div className="flex justify-center text-gray-400">
                        {expandedCycle === cycle.cycle_number ? (
                          <FiChevronUp className="w-5 h-5" />
                        ) : (
                          <FiChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedCycle === cycle.cycle_number && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-gray-200 bg-gray-50"
                        >
                          <div className="p-5">
                            <h5 className="font-medium text-gray-900 mb-3">Member Payments</h5>
                            <div className="space-y-2">
                              {cycle.payments.map((payment) => {
                                const amount = parseAmount(payment.amount);
                                const penalty = parseAmount(payment.penalty_amount);
                                const total = amount + penalty;
                                
                                return (
                                  <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                        {payment.member_name?.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{payment.member_name}</p>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                          <span>{formatCurrency(amount)}</span>
                                          {penalty > 0 && (
                                            <span className="text-red-600">+{formatCurrency(penalty)}</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span className="text-sm font-medium text-gray-900">
                                        {formatCurrency(total)}
                                      </span>
                                      {getPaymentStatusIcon(payment.is_paid, payment.due_date)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Cycle Total */}
                            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                              <span className="font-medium text-gray-900">Cycle Total</span>
                              <span className="text-lg font-bold text-gray-900">
                                {formatCurrency(totalCollected)} / {formatCurrency(totalExpected)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* List View - Traditional Table */
            <div className="space-y-4">
              {cycles.map((cycle) => {
                const progress = cycle.progress;
                const statusColor = getCycleStatusColor(progress);
                const totalExpected = parseAmount(cycle.total_expected);
                const totalCollected = parseAmount(cycle.total_collected);
                const totalPenalties = parseAmount(cycle.total_penalties);
                
                return (
                  <motion.div
                    key={cycle.cycle_number}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    {/* Cycle Header */}
                    <div
                      className="bg-gray-50 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition"
                      onClick={() => toggleCycleExpand(cycle.cycle_number)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusColor}`}>
                          <FiPieChart className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Cycle {cycle.cycle_number}</h4>
                          <p className="text-sm text-gray-500">
                            Due: {cycle.due_date ? new Date(cycle.due_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Progress</p>
                          <p className="font-medium">{cycle.paid_count}/{cycle.total_count} paid</p>
                        </div>
                        <div className="w-32">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        {expandedCycle === cycle.cycle_number ? (
                          <FiChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedCycle === cycle.cycle_number && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-gray-200"
                        >
                          <div className="p-6">
                            {/* Summary Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-600">Expected</p>
                                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalExpected)}</p>
                              </div>
                              <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-xs text-green-600">Collected</p>
                                <p className="text-lg font-bold text-green-600">{formatCurrency(totalCollected)}</p>
                              </div>
                              <div className="p-3 bg-red-50 rounded-lg">
                                <p className="text-xs text-red-600">Penalties</p>
                                <p className="text-lg font-bold text-red-600">{formatCurrency(totalPenalties)}</p>
                              </div>
                            </div>

                            {/* Payments Table */}
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penalty</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {cycle.payments.map((payment) => {
                                  const amount = parseAmount(payment.amount);
                                  const penalty = parseAmount(payment.penalty_amount);
                                  const total = amount + penalty;
                                  
                                  return (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-3">
                                        <div className="flex items-center space-x-3">
                                          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                            {payment.member_name?.charAt(0).toUpperCase()}
                                          </div>
                                          <div>
                                            <p className="font-medium text-gray-900">{payment.member_name}</p>
                                            <p className="text-xs text-gray-500">{payment.member_email}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-sm">{formatCurrency(amount)}</td>
                                      <td className="px-4 py-3 text-sm">
                                        {penalty > 0 ? (
                                          <span className="text-red-600 font-medium">+{formatCurrency(penalty)}</span>
                                        ) : '-'}
                                      </td>
                                      <td className="px-4 py-3 text-sm font-medium">{formatCurrency(total)}</td>
                                      <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                          payment.is_paid 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                          {getPaymentStatusIcon(payment.is_paid, payment.due_date)}
                                          <span className="ml-1">{payment.is_paid ? 'Paid' : 'Pending'}</span>
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Verification Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200"
        >
          <div className="flex items-center space-x-3">
            <FiDollarSign className="w-6 h-6 text-blue-600" />
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Verification:</span> Expected ({formatCurrency(parseAmount(savingSummary?.total_expected_savings))}) = 
              Paid ({formatCurrency(parseAmount(savingSummary?.total_paid_savings))}) + 
              Unpaid ({formatCurrency(parseAmount(savingSummary?.total_unpaid_savings))})
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Member View (unchanged)
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Savings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-600 mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(parseAmount(myFinancials?.saving_summary?.total_savings_paid))}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl">
            <p className="text-sm text-yellow-600 mb-1">Unpaid</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(parseAmount(myFinancials?.saving_summary?.total_unpaid_savings))}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <p className="text-sm text-red-600 mb-1">Penalties</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(parseAmount(myFinancials?.saving_summary?.total_saving_penalty))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsTab;