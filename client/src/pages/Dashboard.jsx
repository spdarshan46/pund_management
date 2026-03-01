// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiDollarSign,
  FiPieChart,
  FiSettings,
  FiLogOut,
  FiSearch,
  FiHome,
  FiTrendingUp,
  FiCheckCircle,
  FiPlus,
  FiEye,
  FiArrowRight,
  FiRefreshCw,
  FiBell,
  FiUser
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [punds, setPunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchMyPunds();
    const name = localStorage.getItem('user_name') || 'User';
    setUserName(name);
  }, []);

  const fetchMyPunds = async () => {
    setLoading(true);
    try {
      const response = await api.get('/punds/my-all/');
      console.log('API Response:', response.data);
      setPunds(response.data);
    } catch (error) {
      console.error('Error fetching punds:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        handleLogout();
      } else {
        toast.error('Failed to load your Punds');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  // Filter punds based on search
  const filteredPunds = punds.filter(pund => 
    pund.pund_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalPunds = punds.length;
  
  const ownerPunds = punds.filter(p => {
    return p.role && p.role.toLowerCase() === 'owner';
  }).length;
  
  const memberPunds = punds.filter(p => {
    return p.role && p.role.toLowerCase() === 'member';
  }).length;
  
  const activePunds = punds.filter(p => p.pund_active).length;

  console.log('Dashboard Stats:', {
    total: totalPunds,
    owners: ownerPunds,
    members: memberPunds,
    active: activePunds,
    rawData: punds.map(p => ({ name: p.pund_name, role: p.role }))
  });

  const stats = [
    { 
      label: 'Total Punds', 
      value: totalPunds, 
      icon: FiHome, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100'
    },
    { 
      label: 'As Owner', 
      value: ownerPunds, 
      icon: FiTrendingUp, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100'
    },
    { 
      label: 'As Member', 
      value: memberPunds, 
      icon: FiUsers, 
      color: 'text-green-600', 
      bg: 'bg-green-100'
    },
    { 
      label: 'Active Now', 
      value: activePunds, 
      icon: FiCheckCircle, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100'
    },
  ];

  const getRoleBadgeColor = (role) => {
    const roleLower = (role || '').toLowerCase();
    return roleLower === 'owner' 
      ? 'bg-purple-100 text-purple-700 border-purple-200' 
      : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getStatusBadge = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 h-full w-20 bg-white shadow-lg flex flex-col items-center py-8 space-y-8 z-10"
      >
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md">
          P
        </div>

        <nav className="flex flex-col space-y-6 flex-1">
          {[
            { icon: FiHome, tab: 'overview' },
            { icon: FiUsers, tab: 'punds' },
            { icon: FiDollarSign, tab: 'transactions' },
            { icon: FiPieChart, tab: 'analytics' },
            { icon: FiSettings, tab: 'settings' }
          ].map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl text-gray-400 hover:bg-gray-100 transition-all"
            >
              <item.icon className="w-6 h-6" />
            </motion.button>
          ))}
        </nav>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout}
          className="p-3 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <FiLogOut className="w-6 h-6" />
        </motion.button>
      </motion.aside>

      {/* Main Content */}
      <main className="ml-20 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">
              Welcome back, <span className="font-medium text-gray-700">{userName}</span>
            </p>
          </div>

          <div className="flex items-center space-x-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:flex-initial">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search punds..."
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchMyPunds}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
              title="Refresh"
            >
              <FiRefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>

            {/* Create Pund Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">New Pund</span>
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-white rounded-lg shadow-sm relative"
              >
                <FiBell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </motion.button>

              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border p-4 z-20"
                >
                  <h3 className="font-semibold mb-3">Notifications</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">New contribution in "Family Savings"</p>
                    <p className="text-sm text-gray-600">Loan request pending approval</p>
                    <p className="text-sm text-gray-600">EMI due in 2 days</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* User Avatar */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold cursor-pointer shadow-md"
            >
              {userName.charAt(0).toUpperCase()}
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* My Punds Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Punds</h2>
            {punds.length > 3 && (
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View All
                <FiArrowRight className="ml-1" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredPunds.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHome className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching Punds' : 'No Punds yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Try a different search term' : 'Create your first Pund to start saving with your group'}
              </p>
              {!searchTerm && (
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all inline-flex items-center">
                  <FiPlus className="mr-2" />
                  Create New Pund
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPunds.slice(0, 6).map((pund) => (
                <motion.div
                  key={pund.pund_id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => navigate(`/pund/${pund.pund_id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {pund.pund_name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 uppercase">{pund.pund_type}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${getRoleBadgeColor(pund.role)}`}>
                      {pund.role || 'member'}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Pund Status</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(pund.pund_active)}`}>
                        {pund.pund_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Membership</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(pund.membership_active)}`}>
                        {pund.membership_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {/* Penalties - if structure data is available */}
                    {pund.structure && (
                      <>
                        <div className="flex justify-between text-sm border-t pt-2 mt-2">
                          <span className="text-gray-500 font-medium">Saving Penalty</span>
                          <span className="text-red-600 font-bold">₹{pund.structure.missed_saving_penalty || pund.structure.missed_week_penalty || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 font-medium">Loan Penalty</span>
                          <span className="text-red-600 font-bold">₹{pund.structure.missed_loan_penalty || 0}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <button className="w-full mt-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center group-hover:border-blue-200 group-hover:text-blue-600">
                    <FiEye className="mr-2" />
                    View Details
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;