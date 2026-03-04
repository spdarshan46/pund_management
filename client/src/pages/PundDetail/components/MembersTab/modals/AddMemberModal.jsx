// src/pages/PundDetail/components/MembersTab/modals/AddMemberModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, FiUser, FiPhone, FiX, FiSend, FiInfo, FiCopy, FiLink 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../../../services/api';

const AddMemberModal = ({ isOpen, onClose, pundId, pundName, onSuccess }) => {
  const [formData, setFormData] = useState({ email: '', name: '', mobile: '' });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    if (pundId) {
      setInviteLink(`${window.location.origin}/join/${pundId}`);
    }
  }, [pundId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      const response = await api.post(`/punds/${pundId}/add-member/`, formData);
      console.log('Add member response:', response.data);
      toast.success('Member added successfully!');
      
      setFormData({ email: '', name: '', mobile: '' });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Add member error:', error);
      toast.error(error.response?.data?.error || 'Failed to add member');
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
                <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition text-white">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/80 text-[10px] sm:text-xs mt-1">{pundName} • Owner</p>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Add Member Form */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">Add by Email</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <InputField
                    icon={FiMail}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="member@example.com"
                    required
                  />
                  <InputField
                    icon={FiUser}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name of the member"
                    required
                  />
                  <InputField
                    icon={FiPhone}
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    required
                  />

                  <div className="bg-blue-50 rounded-lg p-3 flex items-start space-x-2">
                    <FiInfo className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] sm:text-xs text-blue-700">
                      Member will receive an email invitation to join the pund.
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

const InputField = ({ icon: Icon, ...props }) => (
  <div>
    <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1">
      {props.name === 'email' ? 'Email Address' : props.name === 'name' ? 'Full Name' : 'Mobile Number'}
      {props.required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
      <input
        {...props}
        className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
      />
    </div>
  </div>
);

export default AddMemberModal;