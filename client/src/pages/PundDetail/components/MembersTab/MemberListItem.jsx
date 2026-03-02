// src/pages/PundDetail/components/MembersTab/MemberListItem.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiEdit2, FiTrash2, FiRefreshCw } from 'react-icons/fi';

const MemberListItem = ({ member, index, onView, onEdit, onRemove, onReactivate }) => {
  const memberId = member.id;
  const isActive = member.membership_active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`group flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-all cursor-pointer ${
        isActive 
          ? 'bg-gray-50 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50' 
          : 'bg-gray-100/50 border-gray-200 opacity-75 hover:border-yellow-200 hover:bg-yellow-50/30'
      }`}
    >
      {/* Left section - click to view */}
      <div 
        className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0"
        onClick={() => onView(member)}
      >
        <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white font-bold text-[10px] sm:text-xs shadow-sm ${
          isActive 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
            : 'bg-gray-500'
        }`}>
          {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="min-w-0">
          <p className={`text-[11px] sm:text-sm font-medium truncate ${
            isActive ? 'text-gray-900' : 'text-gray-500'
          }`}>
            {member.name || 'Unknown'}
          </p>
          <p className="text-[8px] sm:text-[10px] text-gray-500 truncate">{member.email}</p>
        </div>
      </div>
      
      {/* Right section - action buttons */}
      <div className="flex items-center space-x-1 ml-2">
        <span className={`text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full hidden sm:block ${
          isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-200 text-gray-600'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onView(member)}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-all"
            title="View member"
          >
            <FiEye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
          </button>
          
          {isActive ? (
            <>
              <button
                onClick={(e) => onEdit(e, member)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center hover:bg-green-200 transition-all"
                title="Edit member"
              >
                <FiEdit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
              </button>
              
              <button
                onClick={(e) => onRemove(e, member)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center hover:bg-red-200 transition-all"
                title="Remove member"
              >
                <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
              </button>
            </>
          ) : (
            <button
              onClick={(e) => onReactivate(e, member)}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center hover:bg-green-200 transition-all"
              title="Reactivate member"
            >
              <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MemberListItem;