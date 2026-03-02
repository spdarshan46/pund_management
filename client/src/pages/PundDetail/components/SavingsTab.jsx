// src/pages/PundDetail/components/SavingsTab.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronDown, 
  FiChevronUp,
  FiPieChart,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return `Rs. ${numAmount.toLocaleString('en-IN')}`;
};

const parseAmount = (value) => {
  if (!value) return 0;
  return parseFloat(value) || 0;
};

const SavingsTab = ({ role, savingSummary, myFinancials, pundId }) => {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCycle, setExpandedCycle] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    if (role === 'OWNER' && pundId) {
      fetchCycleData();
    }
  }, [role, pundId]);

  const fetchCycleData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/finance/pund/${pundId}/cycle-payments/`);
      console.log('Cycle data:', response.data);
      setCycles(response.data);
    } catch (error) {
      console.error('Error fetching cycle data:', error);
      toast.error('Failed to load cycle data');
    } finally {
      setLoading(false);
    }
  };

  const toggleCycleExpand = (cycleNumber) => {
    setExpandedCycle(expandedCycle === cycleNumber ? null : cycleNumber);
  };

  const getCycleStatusColor = (progress) => {
    if (progress >= 100) return 'text-green-700 bg-green-100';
    if (progress >= 50) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const getPaymentStatusIcon = (isPaid, dueDate) => {
    if (isPaid) return <FiCheckCircle className="w-3 h-3 text-green-600" />;
    if (new Date(dueDate) < new Date()) return <FiXCircle className="w-3 h-3 text-red-600" />;
    return <FiClock className="w-3 h-3 text-yellow-600" />;
  };

  // Owner View
  if (role === 'OWNER') {
    return (
      <div className="space-y-3">
        {/* Summary Cards - Compact */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <p className="text-[10px] text-gray-500">Total Cycles</p>
            <p className="text-sm font-bold text-gray-900">{savingSummary?.total_cycles || 0}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <p className="text-[10px] text-gray-500">Members</p>
            <p className="text-sm font-bold text-gray-900">{savingSummary?.total_members || 0}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <p className="text-[10px] text-gray-500">Expected</p>
            <p className="text-sm font-bold text-gray-900">{formatCurrency(parseAmount(savingSummary?.total_expected_savings))}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <p className="text-[10px] text-gray-500">Collected</p>
            <p className="text-sm font-bold text-green-600">{formatCurrency(parseAmount(savingSummary?.total_paid_savings))}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <p className="text-[10px] text-gray-500">Unpaid</p>
            <p className="text-sm font-bold text-red-600">{formatCurrency(parseAmount(savingSummary?.total_unpaid_savings))}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <p className="text-[10px] text-gray-500">Penalties</p>
            <p className="text-sm font-bold text-orange-600">{formatCurrency(parseAmount(savingSummary?.total_penalties_collected))}</p>
          </div>
        </div>

        {/* Cycles Section with View Toggle */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Cycle Details</h3>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <FiGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="List View"
              >
                <FiList className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-6">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-gray-500">Loading cycles...</p>
            </div>
          ) : cycles.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FiPieChart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-2">No cycles generated yet</p>
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
                Generate First Cycle
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {cycles.map((cycle) => {
                const progress = cycle.progress || 0;
                const statusColor = getCycleStatusColor(progress);
                const totalExpected = parseAmount(cycle.total_expected);
                const totalCollected = parseAmount(cycle.total_collected);
                const totalPenalties = parseAmount(cycle.total_penalties);
                
                return (
                  <motion.div
                    key={cycle.cycle_number}
                    whileHover={{ y: -2 }}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-all"
                  >
                    {/* Card Header */}
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-medium ${statusColor}`}>
                            <FiPieChart className="w-3 h-3" />
                          </div>
                          <h4 className="text-xs font-semibold text-gray-900">Cycle {cycle.cycle_number}</h4>
                        </div>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${statusColor}`}>
                          {progress}%
                        </span>
                      </div>
                      <p className="text-[8px] text-gray-500 mt-1">
                        Due: {cycle.due_date ? new Date(cycle.due_date).toLocaleDateString('en-IN') : 'N/A'}
                      </p>
                    </div>

                    {/* Card Body */}
                    <div className="p-3 space-y-2">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[8px] mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">{cycle.paid_count || 0}/{cycle.total_count || 0}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="bg-blue-50 rounded p-1.5">
                          <p className="text-[8px] text-blue-600">Expected</p>
                          <p className="text-[10px] font-bold text-gray-900 truncate">{formatCurrency(totalExpected)}</p>
                        </div>
                        <div className="bg-green-50 rounded p-1.5">
                          <p className="text-[8px] text-green-600">Collected</p>
                          <p className="text-[10px] font-bold text-green-600 truncate">{formatCurrency(totalCollected)}</p>
                        </div>
                      </div>

                      {/* Penalty Info */}
                      {totalPenalties > 0 && (
                        <div className="bg-red-50 rounded p-1.5 flex justify-between items-center">
                          <span className="text-[8px] text-red-600">Penalties</span>
                          <span className="text-[10px] font-bold text-red-600">{formatCurrency(totalPenalties)}</span>
                        </div>
                      )}

                      {/* Expand Button */}
                      <button
                        onClick={() => toggleCycleExpand(cycle.cycle_number)}
                        className="w-full mt-1 flex items-center justify-center text-gray-400 hover:text-gray-600"
                      >
                        {expandedCycle === cycle.cycle_number ? (
                          <FiChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <FiChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
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
                          <div className="p-3 space-y-2">
                            <p className="text-[10px] font-medium text-gray-700">Member Payments</p>
                            {cycle.payments?.map((payment) => {
                              const amount = parseAmount(payment.amount);
                              const penalty = parseAmount(payment.penalty_amount);
                              const total = amount + penalty;
                              
                              return (
                                <div
                                  key={payment.id}
                                  className="flex items-center justify-between p-1.5 bg-white rounded border border-gray-100"
                                >
                                  <div className="flex items-center space-x-1.5">
                                    <div className="w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center text-white text-[8px] font-bold">
                                      {payment.member_name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-medium text-gray-900">{payment.member_name}</p>
                                      <div className="flex items-center space-x-1">
                                        <span className="text-[7px] text-gray-500">{formatCurrency(amount)}</span>
                                        {penalty > 0 && (
                                          <span className="text-[7px] text-red-600">+{formatCurrency(penalty)}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-[9px] font-medium text-gray-900">
                                      {formatCurrency(total)}
                                    </span>
                                    {getPaymentStatusIcon(payment.is_paid, payment.due_date)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              {cycles.map((cycle) => {
                const progress = cycle.progress || 0;
                const statusColor = getCycleStatusColor(progress);
                const totalExpected = parseAmount(cycle.total_expected);
                const totalCollected = parseAmount(cycle.total_collected);
                const totalPenalties = parseAmount(cycle.total_penalties);
                
                return (
                  <motion.div
                    key={cycle.cycle_number}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Cycle Header */}
                    <div
                      className="bg-gray-50 px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition"
                      onClick={() => toggleCycleExpand(cycle.cycle_number)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-medium ${statusColor}`}>
                          <FiPieChart className="w-3 h-3" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-900">Cycle {cycle.cycle_number}</h4>
                          <p className="text-[8px] text-gray-500">
                            {cycle.due_date ? new Date(cycle.due_date).toLocaleDateString('en-IN') : 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-[8px] text-gray-500">Progress</p>
                          <p className="text-[8px] font-medium">{cycle.paid_count || 0}/{cycle.total_count || 0}</p>
                        </div>
                        <div className="w-16">
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        {expandedCycle === cycle.cycle_number ? (
                          <FiChevronUp className="w-3.5 h-3.5 text-gray-400" />
                        ) : (
                          <FiChevronDown className="w-3.5 h-3.5 text-gray-400" />
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
                          <div className="p-3 space-y-3">
                            {/* Summary Row */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-blue-50 rounded p-1.5">
                                <p className="text-[8px] text-blue-600">Expected</p>
                                <p className="text-[10px] font-bold text-gray-900">{formatCurrency(totalExpected)}</p>
                              </div>
                              <div className="bg-green-50 rounded p-1.5">
                                <p className="text-[8px] text-green-600">Collected</p>
                                <p className="text-[10px] font-bold text-green-600">{formatCurrency(totalCollected)}</p>
                              </div>
                              <div className="bg-red-50 rounded p-1.5">
                                <p className="text-[8px] text-red-600">Penalties</p>
                                <p className="text-[10px] font-bold text-red-600">{formatCurrency(totalPenalties)}</p>
                              </div>
                            </div>

                            {/* Payments List */}
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-medium text-gray-700">Member Payments</p>
                              {cycle.payments?.map((payment) => {
                                const amount = parseAmount(payment.amount);
                                const penalty = parseAmount(payment.penalty_amount);
                                const total = amount + penalty;
                                
                                return (
                                  <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-1.5 bg-gray-50 rounded border border-gray-100"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div className="w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center text-white text-[8px] font-bold">
                                        {payment.member_name?.charAt(0).toUpperCase() || 'U'}
                                      </div>
                                      <div>
                                        <p className="text-[9px] font-medium text-gray-900">{payment.member_name}</p>
                                        <div className="flex items-center space-x-1">
                                          <span className="text-[7px] text-gray-500">{formatCurrency(amount)}</span>
                                          {penalty > 0 && (
                                            <span className="text-[7px] text-red-600">+{formatCurrency(penalty)}</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-[9px] font-medium text-gray-900">
                                        {formatCurrency(total)}
                                      </span>
                                      {getPaymentStatusIcon(payment.is_paid, payment.due_date)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Cycle Total */}
                            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                              <span className="text-[10px] font-medium text-gray-700">Cycle Total</span>
                              <span className="text-xs font-bold text-gray-900">
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
          )}
        </div>

        {/* Verification Box - Compact */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <FiPieChart className="w-3.5 h-3.5 text-blue-600" />
            <p className="text-[10px] text-blue-700">
              <span className="font-semibold">Verification:</span> Expected = Collected + Unpaid
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Member View - Compact
  return (
    <div className="space-y-3">
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">My Savings</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-50 rounded p-2">
            <p className="text-[8px] text-blue-600">Total Paid</p>
            <p className="text-xs font-bold text-gray-900">
              {formatCurrency(parseAmount(myFinancials?.saving_summary?.total_savings_paid))}
            </p>
          </div>
          <div className="bg-yellow-50 rounded p-2">
            <p className="text-[8px] text-yellow-600">Unpaid</p>
            <p className="text-xs font-bold text-gray-900">
              {formatCurrency(parseAmount(myFinancials?.saving_summary?.total_unpaid_savings))}
            </p>
          </div>
          <div className="bg-red-50 rounded p-2">
            <p className="text-[8px] text-red-600">Penalties</p>
            <p className="text-xs font-bold text-gray-900">
              {formatCurrency(parseAmount(myFinancials?.saving_summary?.total_saving_penalty))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsTab;