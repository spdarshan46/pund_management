// src/pages/PundDetail/components/MembersTab/index.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiPlus, FiUserPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api';

import MemberListItem        from './MemberListItem';
import MemberModal           from './modals/MemberModal';
import AddMemberModal        from './modals/AddMemberModal';
import EditMemberModal       from './modals/EditMemberModal';
import RemoveConfirmModal    from './modals/RemoveConfirmModal';
import ReactivateConfirmModal from './modals/ReactivateConfirmModal';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.mt-wrap {
  --bg:       #f3f4f6;
  --bg-2:     #e9eaec;
  --surf:     #ffffff;
  --t1:       #111827;
  --t2:       #374151;
  --t3:       #6b7280;
  --t4:       #9ca3af;
  --bd:       #e5e7eb;
  --bd-2:     #d1d5db;
  --blue:     #2563eb;
  --blue-d:   #1d4ed8;
  --blue-l:   #eff6ff;
  --blue-b:   #bfdbfe;
  --sh:       0 1px 3px rgba(0,0,0,.07);
  --sh-lg:    0 10px 32px rgba(0,0,0,.09);
}
.pd-root.dark .mt-wrap {
  --bg:       #0d1117;
  --bg-2:     #21262d;
  --surf:     #161b22;
  --t1:       #f0f6fc;
  --t2:       #c9d1d9;
  --t3:       #8b949e;
  --t4:       #6e7681;
  --bd:       #30363d;
  --bd-2:     #21262d;
  --blue:     #58a6ff;
  --blue-d:   #79c0ff;
  --blue-l:   rgba(56,139,253,.12);
  --blue-b:   rgba(56,139,253,.3);
  --sh:       0 1px 3px rgba(0,0,0,.5);
  --sh-lg:    0 10px 32px rgba(0,0,0,.4);
}

/* ── Card ── */
.mt-card {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 16px; overflow: hidden; box-shadow: var(--sh);
}

/* ── Header ── */
.mt-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-bottom: 1px solid var(--bd);
  background: var(--bg);
}
.mt-hd-left  { display: flex; align-items: center; gap: 9px; }
.mt-hd-title { font-size: 14px; font-weight: 700; color: var(--t1); }
.mt-count {
  font-size: 11px; font-weight: 700; padding: 2px 9px;
  border-radius: 100px; background: var(--blue-l); color: var(--blue);
}
.mt-add-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; font-size: 13px; font-weight: 600; color: #fff;
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
  border: none; border-radius: 9px; cursor: pointer; font-family: inherit;
  box-shadow: 0 2px 8px rgba(37,99,235,.28);
  transition: opacity .15s, transform .15s, box-shadow .15s;
}
.mt-add-btn:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(37,99,235,.38); }

/* ── Members list body ── */
.mt-body { padding: 14px; display: flex; flex-direction: column; gap: 8px; }

/* ── Empty state ── */
.mt-empty {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 16px; padding: 52px 24px; text-align: center;
  box-shadow: var(--sh);
}
.mt-empty-ico {
  width: 56px; height: 56px; border-radius: 50%; flex-shrink: 0;
  background: var(--blue-l); border: 1px solid var(--blue-b);
  display: flex; align-items: center; justify-content: center;
  color: var(--blue); margin: 0 auto 14px;
}
.mt-empty-title { font-size: 15px; font-weight: 600; color: var(--t1); margin-bottom: 6px; }
.mt-empty-sub   { font-size: 13px; color: var(--t3); margin-bottom: 18px; }
.mt-empty-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 20px; font-size: 13.5px; font-weight: 600; color: #fff;
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
  border: none; border-radius: 10px; cursor: pointer; font-family: inherit;
  box-shadow: 0 3px 12px rgba(37,99,235,.30);
  transition: opacity .15s, transform .15s;
}
.mt-empty-btn:hover { opacity: .9; transform: translateY(-1px); }
`;

let _mtIn = false;
const Styles = () => {
  useEffect(() => {
    if (_mtIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _mtIn = true;
  }, []);
  return null;
};

/* ═══════════════════════════════════════════════════════════ */
const MembersTab = ({ members, totalMembers, pundId, pundData, onRefresh }) => {
  const [selectedMember,         setSelectedMember]         = useState(null);
  const [showMemberModal,        setShowMemberModal]        = useState(false);
  const [showEditModal,          setShowEditModal]          = useState(false);
  const [showAddModal,           setShowAddModal]           = useState(false);
  const [showRemoveConfirm,      setShowRemoveConfirm]      = useState(false);
  const [showReactivateConfirm,  setShowReactivateConfirm]  = useState(false);
  const [memberToRemove,         setMemberToRemove]         = useState(null);
  const [memberToReactivate,     setMemberToReactivate]     = useState(null);
  const [removing,               setRemoving]               = useState(false);
  const [reactivating,           setReactivating]           = useState(false);
  const [localMembers,           setLocalMembers]           = useState([]);

  useEffect(() => {
    if (members && members.length > 0) {
      setLocalMembers(members.filter(m => m.role !== 'OWNER'));
    } else {
      setLocalMembers([]);
    }
  }, [members]);

  /* ── handlers ── */
  const handleViewMember       = (m)    => { setSelectedMember(m); setShowMemberModal(true); };
  const handleEditMember       = (e, m) => { e.stopPropagation(); setSelectedMember(m); setShowEditModal(true); };
  const handleAddMember        = ()     => setShowAddModal(true);
  const handleMemberAdded      = ()     => { setShowAddModal(false); if (onRefresh) onRefresh(); };
  const handleMemberEdited     = ()     => { setShowEditModal(false); if (onRefresh) onRefresh(); };

  const handleRemoveClick = (e, m) => {
    e.stopPropagation();
    if (!m.id) { toast.error('Cannot remove member: Missing member ID'); return; }
    setMemberToRemove({ ...m, id: m.id });
    setShowRemoveConfirm(true);
  };

  const handleReactivateClick = (e, m) => {
    e.stopPropagation();
    if (!m.id) { toast.error('Cannot reactivate member: Missing member ID'); return; }
    setMemberToReactivate({ ...m, id: m.id });
    setShowReactivateConfirm(true);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemoving(true);
    try {
      await api.post(`/punds/${pundId}/remove-member/${memberToRemove.id}/`);
      toast.success('Member removed successfully');
      setShowRemoveConfirm(false); setMemberToRemove(null);
      if (onRefresh) onRefresh();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to remove member');
    } finally { setRemoving(false); }
  };

  const handleReactivateMember = async () => {
    if (!memberToReactivate) return;
    setReactivating(true);
    try {
      await api.post(`/punds/${pundId}/reactivate-member/${memberToReactivate.id}/`);
      toast.success('Member reactivated successfully');
      setShowReactivateConfirm(false); setMemberToReactivate(null);
      if (onRefresh) onRefresh();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to reactivate member');
    } finally { setReactivating(false); }
  };

  /* ── Shared modals block ── */
  const Modals = () => (
    <>
      <MemberModal
        isOpen={showMemberModal} onClose={() => setShowMemberModal(false)}
        member={selectedMember}
      />
      <EditMemberModal
        isOpen={showEditModal} onClose={() => setShowEditModal(false)}
        member={selectedMember} pundId={pundId} onSuccess={handleMemberEdited}
      />
      <AddMemberModal
        isOpen={showAddModal} onClose={() => setShowAddModal(false)}
        pundId={pundId} pundName={pundData?.pund_name} onSuccess={handleMemberAdded}
      />
      <RemoveConfirmModal
        isOpen={showRemoveConfirm}
        onClose={() => { setShowRemoveConfirm(false); setMemberToRemove(null); }}
        member={memberToRemove} onConfirm={handleRemoveMember} loading={removing}
      />
      <ReactivateConfirmModal
        isOpen={showReactivateConfirm}
        onClose={() => { setShowReactivateConfirm(false); setMemberToReactivate(null); }}
        member={memberToReactivate} onConfirm={handleReactivateMember} loading={reactivating}
      />
    </>
  );

  /* ── Empty states ── */
  if (!members || members.length === 0 || localMembers.length === 0) {
    const sub = (!members || members.length === 0)
      ? "This pund doesn't have any members yet"
      : "Only the owner exists in this pund";
    const btnLabel = (!members || members.length === 0) ? 'Add First Member' : 'Add Members';

    return (
      <>
        <Styles />
        <div className="mt-wrap">
          <div className="mt-empty">
            <div className="mt-empty-ico"><FiUsers size={22} /></div>
            <div className="mt-empty-title">No Members Found</div>
            <div className="mt-empty-sub">{sub}</div>
            <button className="mt-empty-btn" onClick={handleAddMember}>
              <FiUserPlus size={15} /> {btnLabel}
            </button>
          </div>
          <Modals />
        </div>
      </>
    );
  }

  /* ── Main list ── */
  return (
    <>
      <Styles />
      <div className="mt-wrap">
        <motion.div className="mt-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: [0.25, 1, 0.35, 1] }}
        >
          {/* Header */}
          <div className="mt-hd">
            <div className="mt-hd-left">
              <FiUsers size={15} style={{ color: 'var(--blue)' }} />
              <span className="mt-hd-title">Members</span>
              <span className="mt-count">{localMembers.length}</span>
            </div>
            <button className="mt-add-btn" onClick={handleAddMember}>
              <FiPlus size={13} /> Add
            </button>
          </div>

          {/* List */}
          <div className="mt-body">
            {localMembers.map((member, idx) => (
              <motion.div key={member.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.26, ease: [0.25, 1, 0.35, 1] }}
              >
                <MemberListItem
                  member={member}
                  index={idx}
                  onView={handleViewMember}
                  onEdit={handleEditMember}
                  onRemove={handleRemoveClick}
                  onReactivate={handleReactivateClick}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <Modals />
      </div>
    </>
  );
};

export default MembersTab;