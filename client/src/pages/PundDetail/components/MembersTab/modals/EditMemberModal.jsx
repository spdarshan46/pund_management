// src/pages/PundDetail/components/MembersTab/modals/EditMemberModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiX, FiSave, FiMail as FiMailIcon } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../../../services/api';

const EditMemberModal = ({ isOpen, onClose, member, pundId, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '' });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        mobile: member.mobile || ''
      });
    }
  }, [member]);

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
    
    if (!formData.name.trim()) {
      toast.error('Please enter member name');
      return;
    }
    if (formData.mobile && !formData.mobile.match(/^\d{10}$/)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    const userId = member?.id;
    if (!userId) {
      toast.error('Invalid member data: missing user ID');
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch(`/punds/${pundId}/edit-member/${userId}/`, {
        name: formData.name,
        email: formData.email !== member.email ? formData.email : undefined,
        mobile: formData.mobile || undefined
      });
      
      if (response.data.message === "OTP sent to new email. Member must verify to complete change.") {
        setOtpSent(true);
        toast.success('OTP sent to new email for verification');
      } else {
        toast.success('Member updated successfully!');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Edit member error:', error);
      toast.error(error.response?.data?.error || 'Failed to update member');
    } finally {
      setLoading(false);
    }
  };

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
            className="bg-white rounded-xl shadow-2xl w-full max-w-[95%] sm:max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm sm:text-base">Edit Member</h2>
                <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition text-white">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5">
              {otpSent ? (
                <div className="text-center py-4">
                  <FiMailIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Verification Email Sent</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    An OTP has been sent to the new email address.
                  </p>
                  <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs">
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <EditInputField
                    icon={FiUser}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <EditInputField
                    icon={FiMail}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    helper="Changing email will require OTP verification"
                  />
                  <EditInputField
                    icon={FiPhone}
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                  />

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs hover:shadow-md transition disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FiSave className="w-3.5 h-3.5 mr-1" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EditInputField = ({ icon: Icon, name, helper, ...props }) => (
  <div>
    <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1">
      {name === 'name' ? 'Full Name' : name === 'email' ? 'Email Address' : 'Mobile Number'}
      {props.required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
      <input
        {...props}
        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
      />
    </div>
    {helper && <p className="text-[8px] text-gray-400 mt-1">{helper}</p>}
  </div>
);

export default EditMemberModal;