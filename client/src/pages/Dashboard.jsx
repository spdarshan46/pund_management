// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCreditCard,
  FiPieChart,
  FiSettings,
  FiLogOut,
  FiBell,
  FiSearch,
  FiHome,
  FiUser,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock data
  const portfolioData = [
    { name: 'Jan', value: 45000 },
    { name: 'Feb', value: 52000 },
    { name: 'Mar', value: 49000 },
    { name: 'Apr', value: 58000 },
    { name: 'May', value: 63000 },
    { name: 'Jun', value: 59000 },
    { name: 'Jul', value: 72000 },
    { name: 'Aug', value: 81000 },
    { name: 'Sep', value: 78000 },
    { name: 'Oct', value: 85000 },
    { name: 'Nov', value: 92000 },
    { name: 'Dec', value: 101000 },
  ];

  const expenseData = [
    { category: 'Housing', amount: 2200, color: '#3b82f6' },
    { category: 'Food', amount: 800, color: '#ef4444' },
    { category: 'Transport', amount: 400, color: '#10b981' },
    { category: 'Entertainment', amount: 300, color: '#f59e0b' },
    { category: 'Shopping', amount: 500, color: '#8b5cf6' },
    { category: 'Utilities', amount: 350, color: '#ec4899' },
  ];

  const recentTransactions = [
    { id: 1, description: 'Grocery Store', amount: -125.50, date: '2024-01-15', category: 'Food' },
    { id: 2, description: 'Salary Deposit', amount: 4500.00, date: '2024-01-14', category: 'Income' },
    { id: 3, description: 'Netflix Subscription', amount: -15.99, date: '2024-01-13', category: 'Entertainment' },
    { id: 4, description: 'Uber Ride', amount: -24.50, date: '2024-01-12', category: 'Transport' },
    { id: 5, description: 'Amazon Purchase', amount: -89.99, date: '2024-01-11', category: 'Shopping' },
  ];

  const investments = [
    { name: 'AAPL', shares: 50, price: 175.50, change: 2.5 },
    { name: 'GOOGL', shares: 30, price: 140.20, change: -1.2 },
    { name: 'MSFT', shares: 45, price: 380.30, change: 1.8 },
    { name: 'AMZN', shares: 25, price: 155.80, change: 3.2 },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 h-full w-20 bg-white shadow-lg flex flex-col items-center py-8 space-y-8"
      >
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
          F
        </div>

        <nav className="flex flex-col space-y-6 flex-1">
          {[FiHome, FiTrendingUp, FiPieChart, FiCreditCard, FiSettings].map((Icon, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-3 rounded-xl transition-colors ${
                activeTab === ['overview', 'investments', 'analytics', 'cards', 'settings'][index]
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(['overview', 'investments', 'analytics', 'cards', 'settings'][index])}
            >
              <Icon className="w-6 h-6" />
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
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back, John Doe</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

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
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border p-4"
                >
                  <h3 className="font-semibold mb-3">Notifications</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Your monthly report is ready</p>
                    <p className="text-sm text-gray-600">Investment portfolio updated</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* User Avatar */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold cursor-pointer"
            >
              JD
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Total Balance', value: 124567, icon: FiDollarSign, color: 'text-green-600', bg: 'bg-green-100', change: '+12.5%' },
            { label: 'Monthly Income', value: 8420, icon: FiTrendingUp, color: 'text-blue-600', bg: 'bg-blue-100', change: '+8.2%' },
            { label: 'Monthly Expenses', value: 5230, icon: FiTrendingDown, color: 'text-red-600', bg: 'bg-red-100', change: '-3.1%' },
            { label: 'Investments', value: 45320, icon: FiPieChart, color: 'text-purple-600', bg: 'bg-purple-100', change: '+15.3%' },
          ].map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className={`text-sm font-semibold ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stat.value)}</p>
            </Card>
          ))}
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Portfolio Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={portfolioData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Expense Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Recent Transactions and Investments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.amount > 0 ? (
                          <FiTrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <FiTrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{transaction.date} • {transaction.category}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Investment Portfolio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <h3 className="text-lg font-semibold mb-4">Investment Portfolio</h3>
              <div className="space-y-4">
                {investments.map((investment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div>
                      <p className="font-medium">{investment.name}</p>
                      <p className="text-sm text-gray-500">{investment.shares} shares @ ${investment.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(investment.shares * investment.price)}</p>
                      <p className={`text-sm ${
                        investment.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {investment.change > 0 ? '+' : ''}{investment.change}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;