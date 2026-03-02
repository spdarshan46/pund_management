// src/pages/PundDetail/components/MembersTab/index.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiPlus, FiUserPlus
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api';

import MemberListItem from './MemberListItem';
import MemberModal from './modals/MemberModal';
import AddMemberModal from './modals/AddMemberModal';
import EditMemberModal from './modals/EditMemberModal';
import RemoveConfirmModal from './modals/RemoveConfirmModal';
import ReactivateConfirmModal from './modals/ReactivateConfirmModal';

const MembersTab = ({ members, totalMembers, pundId, pundData, onRefresh }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showReactivateConfirm, setShowReactivateConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [memberToReactivate, setMemberToReactivate] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [localMembers, setLocalMembers] = useState([]);
  
  console.log('Members data:', members);

  // Update local members when props change
  useEffect(() => {
    if (members && members.length > 0) {
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

  const handleEditMember = (e, member) => {
    e.stopPropagation();
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleAddMember = () => {
    setShowAddModal(true);
  };

  const handleRemoveClick = (e, member) => {
    e.stopPropagation();
    
    const memberId = member.id;
    
    if (!memberId) {
      console.error('Member has no id field:', member);
      toast.error('Cannot remove member: Missing member ID');
      return;
    }
    
    setMemberToRemove({...member, id: memberId});
    setShowRemoveConfirm(true);
  };

  const handleReactivateClick = (e, member) => {
    e.stopPropagation();
    
    const memberId = member.id;
    
    if (!memberId) {
      console.error('Member has no id field:', member);
      toast.error('Cannot reactivate member: Missing member ID');
      return;
    }
    
    setMemberToReactivate({...member, id: memberId});
    setShowReactivateConfirm(true);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    const memberId = memberToRemove.id;
    
    setRemoving(true);
    try {
      console.log('Removing member with member_id:', memberId);
      const response = await api.post(`/punds/${pundId}/remove-member/${memberId}/`);
      console.log('Remove response:', response.data);
      
      toast.success('Member removed successfully');
      setShowRemoveConfirm(false);
      setMemberToRemove(null);
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Remove member error:', error);
      toast.error(error.response?.data?.error || 'Failed to remove member');
    } finally {
      setRemoving(false);
    }
  };

  const handleReactivateMember = async () => {
    if (!memberToReactivate) return;
    
    const memberId = memberToReactivate.id;
    
    setReactivating(true);
    try {
      console.log('Reactivating member with member_id:', memberId);
      const response = await api.post(`/punds/${pundId}/reactivate-member/${memberId}/`);
      console.log('Reactivate response:', response.data);
      
      toast.success('Member reactivated successfully');
      setShowReactivateConfirm(false);
      setMemberToReactivate(null);
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Reactivate member error:', error);
      toast.error(error.response?.data?.error || 'Failed to reactivate member');
    } finally {
      setReactivating(false);
    }
  };

  const handleMemberAdded = () => {
    setShowAddModal(false);
    if (onRefresh) onRefresh();
  };

  const handleMemberEdited = () => {
    setShowEditModal(false);
    if (onRefresh) onRefresh();
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
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Members</h3>
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
              <MemberListItem
                key={member.id || index}
                member={member}
                index={index}
                onView={handleViewMember}
                onEdit={handleEditMember}
                onRemove={handleRemoveClick}
                onReactivate={handleReactivateClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <MemberModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        member={selectedMember}
      />

      <EditMemberModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        member={selectedMember}
        pundId={pundId}
        onSuccess={handleMemberEdited}
      />

      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        pundId={pundId}
        pundName={pundData?.pund_name}
        onSuccess={handleMemberAdded}
      />

      <RemoveConfirmModal
        isOpen={showRemoveConfirm}
        onClose={() => {
          setShowRemoveConfirm(false);
          setMemberToRemove(null);
        }}
        member={memberToRemove}
        onConfirm={handleRemoveMember}
        loading={removing}
      />

      <ReactivateConfirmModal
        isOpen={showReactivateConfirm}
        onClose={() => {
          setShowReactivateConfirm(false);
          setMemberToReactivate(null);
        }}
        member={memberToReactivate}
        onConfirm={handleReactivateMember}
        loading={reactivating}
      />
    </>
  );
};

export default MembersTab;