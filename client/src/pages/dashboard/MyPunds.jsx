// src/pages/dashboard/MyPunds.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiGrid, FiList, FiChevronRight, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const MyPunds = ({ punds: initialPunds, searchTerm: initialSearch = '', onPundClick }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [viewMode, setViewMode] = useState('grid');
  
  // initialPunds already contains the correct member_count from your API
  const punds = initialPunds || [];

  const filteredPunds = punds.filter(p => 
    p.pund_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    const roleLower = (role || '').toLowerCase();
    return roleLower === 'owner' 
      ? 'bg-purple-100 text-purple-700' 
      : 'bg-blue-100 text-blue-700';
  };

  const getStatusBadge = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <h1 className="text-base font-semibold text-gray-900">My Punds ({filteredPunds.length})</h1>
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full sm:w-48 pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <FiGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <FiList className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Punds List */}
      {filteredPunds.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiHome className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {searchTerm ? 'No matching Punds' : 'No Punds yet'}
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            {searchTerm ? 'Try a different search term' : 'Create your first Pund to start saving'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/dashboard/pund/create')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs shadow-sm hover:shadow"
            >
              Create New Pund
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredPunds.map((pund) => (
            <motion.div
              key={pund.pund_id}
              whileHover={{ y: -2 }}
              className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-sm"
              onClick={() => onPundClick(pund.pund_id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{pund.pund_name}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 uppercase">{pund.pund_type || 'GENERAL'}</p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getRoleBadgeColor(pund.role)}`}>
                  {pund.role || 'MEMBER'}
                </span>
              </div>
              
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${getStatusBadge(pund.pund_active)}`}>
                    {pund.pund_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Members</span>
                  <span className="font-medium text-gray-900">
                    {pund.member_count || 0}
                  </span>
                </div>
              </div>

              <button className="w-full px-2 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow transition flex items-center justify-center text-[10px]">
                <FiEye className="mr-1 w-3 h-3" />
                More Info
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y">
          {filteredPunds.map((pund) => (
            <div
              key={pund.pund_id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer transition"
              onClick={() => onPundClick(pund.pund_id)}
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {pund.pund_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-900">{pund.pund_name}</h3>
                  <p className="text-[10px] text-gray-500">{pund.pund_type || 'General'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getRoleBadgeColor(pund.role)}`}>
                  {pund.role ?? 'member'}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusBadge(pund.pund_active)}`}>
                  {pund.pund_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-[10px] font-medium text-gray-900">
                  {pund.member_count ?? 0} members
                </span>
                <FiChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPunds;