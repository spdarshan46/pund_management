// src/pages/PundDetail/components/MembersTab.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEye, FiPlus, FiUsers, FiUserPlus, FiMail, FiCalendar, FiPhone, 
  FiX, FiCheckCircle, FiXCircle, FiDollarSign, FiCreditCard, FiSend, 
  FiAward, FiUser, FiCopy, FiLink, FiInfo 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../../services/api'; // Make sure this import is correct

// Member Modal Component (View Member)
const MemberModal = ({ isOpen, onClose, member }) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!member) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-[90%] sm:max-w-sm md:max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl border-2 border-white/30">
                    {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                      {member.name || 'Unknown'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${
                        member.role === 'OWNER'
                          ? 'bg-purple-200 text-purple-800'
                          : 'bg-blue-200 text-blue-800'
                      }`}>
                        {member.role || 'MEMBER'}
                      </span>
                      {member.membership_active ? (
                        <span className="text-[10px] sm:text-xs text-white/90 flex items-center">
                          <FiCheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-xs text-white/70 flex items-center">
                          <FiXCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-1.5 hover:bg-white/10 rounded-lg transition text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Member Details */}
            <div className="p-4 sm:p-5 space-y-3">
              {/* Email */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500">Email Address</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 break-all">{member.email}</p>
                </div>
              </div>

              {/* Joined Date */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] sm:text-xs text-gray-500">Joined Date</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    {new Date(member.joined_at || Date.now()).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Mobile  */}
              {member.mobile && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiPhone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] sm:text-xs text-gray-500">Mobile Number</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{member.mobile}</p>
                  </div>
                </div>
              )}

              {/* Member Stats (if available) */}
              {(member.total_savings !== undefined || member.active_loans !== undefined) && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {member.total_savings !== undefined && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                      <FiAward className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mb-1" />
                      <p className="text-[8px] sm:text-[10px] text-blue-600">Total Saved</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">
                        ₹{(member.total_savings || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                  {member.active_loans !== undefined && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                      <FiCreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mb-1" />
                      <p className="text-[8px] sm:text-[10px] text-green-600">Active Loans</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">{member.active_loans || 0}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 sm:py-3 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm hover:bg-gray-100 transition font-medium shadow-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Add Member Modal Component (with API connection)
const AddMemberModal = ({ isOpen, onClose, pundId, pundName, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    mobile: ''
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    if (pundId) {
      const link = `${window.location.origin}/join/${pundId}`;
      setInviteLink(link);
    }
  }, [pundId]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error('Please enter email address');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Please enter member name');
      return;
    }
    if (!formData.mobile.match(/^\d{10}$/)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      // API call to add member
      const response = await api.post(`/punds/${pundId}/add-member/`, {
        email: formData.email,
        name: formData.name,
        mobile: formData.mobile
      });
      
      console.log('Add member response:', response.data);
      toast.success('Member added successfully!');
      
      // Reset form and close modal
      setFormData({ email: '', name: '', mobile: '' });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Add member error:', error);
      
      // Handle specific error messages
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.email) {
        toast.error(error.response.data.email[0]);
      } else if (error.response?.data?.name) {
        toast.error(error.response.data.name[0]);
      } else if (error.response?.data?.mobile) {
        toast.error(error.response.data.mobile[0]);
      } else {
        toast.error('Failed to add member. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Invite link copied!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-[95%] sm:max-w-lg mx-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm sm:text-base">Add New Member</h2>
                <button 
                  onClick={onClose} 
                  className="p-1.5 hover:bg-white/10 rounded-lg transition text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/80 text-[10px] sm:text-xs mt-1">
                {pundName} • Owner
              </p>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Add Member Form */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">Add by Email</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="member@example.com"
                        className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Name of the member"
                        className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                        className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 flex items-start space-x-2">
                    <FiInfo className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] sm:text-xs text-blue-700">
                      Member will receive an email invitation to join the pund.
                      They'll need to create an account if they don't have one.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs sm:text-sm hover:shadow-md transition disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiSend className="w-4 h-4 mr-1.5" />
                        Add Member
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main MembersTab Component
const MembersTab = ({ members, totalMembers, pundId, pundData, onRefresh }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [localMembers, setLocalMembers] = useState([]);
  
  console.log('Members data:', members); // Debug log

  useEffect(() => {
    if (members && members.length > 0) {
      // Filter out owner and only show members
      const filtered = members.filter(member => member.role !== 'OWNER');
      setLocalMembers(filtered);
    } else {
      setLocalMembers([]);
    }
  }, [members]);

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  const handleAddMember = () => {
    setShowAddModal(true);
  };

  const handleMemberAdded = () => {
    // Close the add modal
    setShowAddModal(false);
    
    // Call parent onRefresh if provided to refresh data
    if (onRefresh) {
      onRefresh();
    } else {
      // Fallback: show message to refresh manually
      toast.success('Member added! Please refresh the page to see the updated list.');
    }
  };

  if (!members || members.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 text-center">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
        </div>
        <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">No Members Found</h3>
        <p className="text-[10px] sm:text-xs text-gray-500 mb-3">This pund doesn't have any members yet</p>
        <button
          onClick={handleAddMember}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-[10px] sm:text-xs hover:shadow-md transition-all flex items-center space-x-1 mx-auto"
        >
          <FiUserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Add First Member</span>
        </button>

        {/* Add Member Modal */}
        <AddMemberModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          pundId={pundId}
          pundName={pundData?.pund_name}
          onSuccess={handleMemberAdded}
        />
      </div>
    );
  }

  if (localMembers.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 text-center">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
        </div>
        <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">No Members Found</h3>
        <p className="text-[10px] sm:text-xs text-gray-500 mb-3">Only owner exists in this pund</p>
        <button
          onClick={handleAddMember}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-[10px] sm:text-xs hover:shadow-md transition-all flex items-center space-x-1 mx-auto"
        >
          <FiUserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Add Members</span>
        </button>

        {/* Add Member Modal */}
        <AddMemberModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          pundId={pundId}
          pundName={pundData?.pund_name}
          onSuccess={handleMemberAdded}
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-3 sm:px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <FiUsers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                Members
              </h3>
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[8px] sm:text-[10px] font-medium">
                {localMembers.length}
              </span>
            </div>
            <button
              onClick={handleAddMember}
              className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-[9px] sm:text-[10px] hover:shadow-sm transition-all flex items-center space-x-0.5"
            >
              <FiPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="p-2 sm:p-3">
          <div className="space-y-1.5 sm:space-y-2">
            {localMembers.map((member, index) => (
              <motion.div
                key={member.id || index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ x: 2 }}
                className="group flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer"
                onClick={() => handleViewMember(member)}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-[10px] sm:text-xs shadow-sm">
                    {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-[11px] sm:text-sm font-medium text-gray-900 group-hover:text-blue-600 transition">
                      {member.name || 'Unknown'}
                    </p>
                    <p className="text-[8px] sm:text-[10px] text-gray-500">{member.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full ${
                    member.membership_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {member.membership_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiEye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Member Modal */}
      <MemberModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        member={selectedMember}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        pundId={pundId}
        pundName={pundData?.pund_name}
        onSuccess={handleMemberAdded}
      />
    </>
  );
};

export default MembersTab;