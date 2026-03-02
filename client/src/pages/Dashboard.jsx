// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, Routes, Route, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUser,
  FiLogOut,
  FiPlus,
  FiSearch,
  FiMenu,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiEye,
  FiCreditCard,
  FiList,
  FiLock,
  FiChevronRight
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../services/api';

// Import sub-pages
import MyPunds from './dashboard/MyPunds';
import MyLoans from './dashboard/MyLoans';
import Profile from './dashboard/Profile';
import ChangePassword from './dashboard/ChangePassword';
import CreatePund from './dashboard/CreatePund'; // Add this import

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [punds, setPunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchMyPunds();
    const name = localStorage.getItem('user_name') || 'User';
    const email = localStorage.getItem('user_email') || '';
    setUserName(name);
    setUserEmail(email);
  }, []);

  const fetchMyPunds = async () => {
    setLoading(true);
    try {
      const response = await api.get('/punds/my-all/');
      const pundsData = Array.isArray(response.data) ? response.data : [];
      setPunds(pundsData);
    } catch (error) {
      console.error('Error fetching punds:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Calculate stats
  const totalPunds = Array.isArray(punds) ? punds.length : 0;
  const ownerPunds = Array.isArray(punds) 
    ? punds.filter(p => p.role?.toLowerCase() === 'owner').length : 0;
  const memberPunds = Array.isArray(punds) 
    ? punds.filter(p => p.role?.toLowerCase() === 'member').length : 0;
  const activePunds = Array.isArray(punds) 
    ? punds.filter(p => p.pund_active).length : 0;

  const menuItems = [
    { path: '/dashboard', label: 'Home', icon: FiHome, exact: true },
    { path: '/dashboard/punds', label: 'My Punds', icon: FiList, badge: totalPunds },
    { path: '/dashboard/loans', label: 'My Loans', icon: FiCreditCard },
    { path: '/dashboard/profile', label: 'Profile', icon: FiUser },
    { path: '/dashboard/change-password', label: 'Change Password', icon: FiLock },
  ];

  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return 'Dashboard';
    if (location.pathname === '/dashboard/punds') return 'My Punds';
    if (location.pathname === '/dashboard/loans') return 'My Loans';
    if (location.pathname === '/dashboard/profile') return 'Profile';
    if (location.pathname === '/dashboard/change-password') return 'Change Password';
    if (location.pathname === '/dashboard/pund/create') return 'Create Pund';
    return 'Dashboard';
  };

  const handlePundClick = (pundId) => {
    navigate(`/pund/${pundId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Fixed on desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-200 ease-in-out
        w-64 bg-white shadow-lg flex flex-col
      `}>
        {/* Logo with PundX */}
        <div className="p-4 border-b border-gray-100">
          <Link to="/dashboard" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">PundX</span>
            <span className="text-xs text-gray-400">v2.5</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-xs truncate">{userName}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <item.icon className={`w-4 h-4 ${
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className="text-xs">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-600 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-2 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all text-xs"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content - With left margin on desktop */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Header with PundX */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between">
              {/* Left side with menu and title */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <FiMenu className="w-4 h-4 text-gray-600" />
                </button>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    PundX
                  </span>
                  <span className="text-sm font-semibold text-gray-400 mx-1">/</span>
                  <h1 className="text-sm font-semibold text-gray-900">
                    {getPageTitle()}
                  </h1>
                </div>
              </div>

              {/* Right side - New Pund button (hidden on create page) */}
              {location.pathname !== '/dashboard/pund/create' && (
                <Link to="/dashboard/pund/create">
                  <button className="flex items-center space-x-1 px-2 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs shadow-sm hover:shadow">
                    <FiPlus className="w-3 h-3" />
                    <span className="hidden sm:inline">New</span>
                  </button>
                </Link>
              )}
            </div>

            {/* Search - Only on Home and Punds pages */}
            {(location.pathname === '/dashboard' || location.pathname === '/dashboard/punds') && (
              <div className="mt-2">
                <div className="relative">
                  <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search punds..."
                    className="w-full pl-7 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-3">
          <Routes>
            <Route index element={
              <HomePage 
                userName={userName}
                stats={{ totalPunds, ownerPunds, memberPunds, activePunds }}
                punds={punds.slice(0, 3)}
                searchTerm={searchTerm}
                onViewAll={() => navigate('/dashboard/punds')}
                onPundClick={handlePundClick}
              />
            } />
            <Route path="punds" element={<MyPunds punds={punds} searchTerm={searchTerm} onPundClick={handlePundClick} />} />
            <Route path="loans" element={<MyLoans />} />
            <Route path="profile" element={<Profile userName={userName} userEmail={userEmail} />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="pund/create" element={<CreatePund />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

// Home Page Component (keep as is)
const HomePage = ({ userName, stats, punds, searchTerm, onViewAll, onPundClick }) => {
  const statCards = [
    { label: 'Total Punds', value: stats.totalPunds, icon: FiHome, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'As Owner', value: stats.ownerPunds, icon: FiTrendingUp, bg: 'bg-purple-50', color: 'text-purple-600' },
    { label: 'As Member', value: stats.memberPunds, icon: FiUsers, bg: 'bg-green-50', color: 'text-green-600' },
    { label: 'Active Now', value: stats.activePunds, icon: FiAward, bg: 'bg-amber-50', color: 'text-amber-600' },
  ];

  const filteredPunds = punds.filter(p => 
    p.pund_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    const roleLower = (role || '').toLowerCase();
    return roleLower === 'owner' 
      ? 'bg-purple-100 text-purple-700' 
      : 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Hi, <span className="text-blue-600">{userName}</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Here's your overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-3"
          >
            <div className={`w-7 h-7 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
            </div>
            <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
            <p className="text-[10px] text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Punds */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-900">Recent Punds</h3>
          <button 
            onClick={onViewAll}
            className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center"
          >
            View All
            <FiChevronRight className="ml-0.5 w-2.5 h-2.5" />
          </button>
        </div>

        {filteredPunds.length === 0 ? (
          <div className="text-center py-4">
            <FiHome className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500 mb-2">No punds yet</p>
            <Link to="/dashboard/pund/create">
              <button className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs shadow-sm hover:shadow">
                Create Pund
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPunds.map((pund) => (
              <div
                key={pund.pund_id}
                onClick={() => onPundClick(pund.pund_id)}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                    {pund.pund_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-xs">{pund.pund_name}</p>
                    <p className="text-[10px] text-gray-500">{pund.pund_type || 'General'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getRoleBadgeColor(pund.role)}`}>
                    {pund.role || 'Member'}
                  </span>
                  <FiEye className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;