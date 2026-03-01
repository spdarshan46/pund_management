// src/pages/PundDetail/components/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEye,
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiRefreshCw,
  FiSettings,
  FiDownload,
  FiPlus,
  FiInfo,
  FiMenu
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const Header = ({
  pundData,
  role,
  activeTab,
  setActiveTab,
  onGenerateCycle,
  onSetStructure,
  onExportReport,
  onRequestLoan,
  generatingCycle,
  hasStructure
}) => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiEye },
    { id: 'savings', label: 'Savings', icon: FiDollarSign },
    { id: 'loans', label: 'Loans', icon: FiTrendingUp },
    ...(role === 'OWNER' ? [{ id: 'members', label: 'Members', icon: FiUsers }] : []),
    ...(role === 'OWNER' ? [{ id: 'audit', label: 'Audit', icon: FiFileText }] : [])
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{pundData.pund_name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs sm:text-sm text-gray-500">{pundData.pund_type}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${pundData.pund_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                  }`}>
                  {pundData.pund_active ? 'Active' : 'Inactive'}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${role === 'OWNER'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                  }`}>
                  {role}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 sm:space-x-3">
            {role === 'OWNER' && (
              <>
                <button
                  onClick={onGenerateCycle}
                  disabled={generatingCycle || !hasStructure}
                  className={`px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm ${!hasStructure
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                    } text-white transition relative group`}
                  title={!hasStructure ? 'Owner must set structure first' : ''}
                >
                  {generatingCycle ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <FiRefreshCw className="w-4 h-4 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">Generate Cycle</span>
                </button>
                <button
                  onClick={onSetStructure}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
                >
                  <FiSettings className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Set Structure</span>
                </button>
                <button
                  onClick={onExportReport}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Export Report"
                >
                  <FiDownload className="w-5 h-5 text-gray-600" />
                </button>
              </>
            )}
            {role === 'MEMBER' && (
              <button
                onClick={onRequestLoan}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Request Loan
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiMenu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tabs - Desktop */}
        <div className="hidden sm:flex space-x-6 mt-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition whitespace-nowrap ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tabs - Mobile */}
        {showMobileMenu && (
          <div className="sm:hidden mt-4 space-y-2 border-t pt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowMobileMenu(false);
                }}
                className={`flex items-center space-x-2 w-full px-4 py-3 rounded-lg transition ${activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;