// src/pages/PundDetail/components/AuditLogsTab.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiClock, FiUser, FiActivity, FiCalendar, FiHash } from 'react-icons/fi';

const AuditLogsTab = ({ auditLogs }) => {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <FiShield className="w-5 h-5 text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">No Audit Logs Yet</h3>
        <p className="text-xs text-gray-500">Financial actions will be recorded here</p>
      </div>
    );
  }

  // Calculate stats
  const totalActions = auditLogs.length;
  const lastAction = auditLogs[0];
  const uniqueActions = new Set(auditLogs.map(log => log.action)).size;

  return (
    <div className="space-y-3">
      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <div className="flex items-center space-x-1 mb-1">
            <FiActivity className="w-3 h-3 text-blue-600" />
            <p className="text-[10px] text-gray-500">Total Actions</p>
          </div>
          <p className="text-sm font-bold text-gray-900">{totalActions}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <div className="flex items-center space-x-1 mb-1">
            <FiCalendar className="w-3 h-3 text-green-600" />
            <p className="text-[10px] text-gray-500">Last Action</p>
          </div>
          <p className="text-xs font-medium text-gray-900 truncate">
            {lastAction?.action || 'N/A'}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {lastAction ? new Date(lastAction.timestamp).toLocaleDateString('en-IN', { 
              day: '2-digit', 
              month: '2-digit', 
              year: '2-digit' 
            }) : ''}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <div className="flex items-center space-x-1 mb-1">
            <FiHash className="w-3 h-3 text-purple-600" />
            <p className="text-[10px] text-gray-500">Unique Actions</p>
          </div>
          <p className="text-sm font-bold text-gray-900">{uniqueActions}</p>
        </div>
      </div>

      {/* Audit Logs List - Compact */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {auditLogs.map((log, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 }}
            className="p-3 hover:bg-gray-50 transition"
          >
            <div className="flex items-start space-x-2">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                  <FiShield className="w-3 h-3 text-white" />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-semibold text-gray-900">{log.action}</p>
                  <span className="text-[10px] text-gray-400 flex items-center">
                    <FiClock className="w-2.5 h-2.5 mr-0.5" />
                    {new Date(log.timestamp).toLocaleDateString('en-IN', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <p className="text-[10px] text-gray-600 mb-1">{log.description}</p>
                
                <div className="flex items-center text-[10px] text-gray-400">
                  <FiUser className="w-2.5 h-2.5 mr-0.5" />
                  <span>by {log.performed_by || 'System'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AuditLogsTab;