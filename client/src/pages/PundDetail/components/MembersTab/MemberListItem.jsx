// src/pages/PundDetail/components/MembersTab/MemberListItem.jsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiEdit2, FiTrash2, FiRefreshCw } from 'react-icons/fi';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.mli-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 13px; border-radius: 12px; border: 1px solid var(--bd);
  cursor: pointer; transition: background .15s, border-color .15s, box-shadow .15s;
  background: var(--bg);
}
.mli-row.active:hover   { background: var(--blue-l); border-color: var(--blue-b); box-shadow: 0 2px 8px rgba(37,99,235,.08); }
.mli-row.inactive       { opacity: .72; }
.mli-row.inactive:hover { background: var(--amber-l); border-color: var(--amber-b); }

/* left */
.mli-left  { display: flex; align-items: center; gap: 11px; flex: 1; min-width: 0; }
.mli-avatar {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: #fff;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
}
.mli-avatar.inactive { background: var(--bg-2); color: var(--t3); }
.mli-name  { font-size: 13.5px; font-weight: 600; color: var(--t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
.mli-email { font-size: 11.5px; color: var(--t3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mli-info  { min-width: 0; flex: 1; }

/* right */
.mli-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: 10px; }
.mli-status {
  font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 100px;
}
.mli-status.active   { background: var(--green-l); color: var(--green); }
.mli-status.inactive { background: var(--bg-2);    color: var(--t3); }

/* action buttons */
.mli-btn {
  width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .12s, transform .12s;
}
.mli-btn:hover { transform: translateY(-1px); }
.mli-btn.view    { background: var(--blue-l);   color: var(--blue); }
.mli-btn.view:hover  { background: var(--blue-b); }
.mli-btn.edit    { background: var(--green-l);  color: var(--green); }
.mli-btn.edit:hover  { background: var(--green-b); }
.mli-btn.remove  { background: var(--red-l);    color: var(--red); }
.mli-btn.remove:hover { background: var(--red-b); }
.mli-btn.reactivate { background: var(--green-l); color: var(--green); }
.mli-btn.reactivate:hover { background: var(--green-b); }
`;

let _mliIn = false;
const Styles = () => {
  useEffect(() => {
    if (_mliIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _mliIn = true;
  }, []);
  return null;
};

/* ═══════════════════════════════════════════════════════════ */
const MemberListItem = ({ member, index, onView, onEdit, onRemove, onReactivate }) => {
  const isActive = member.membership_active;
  const initial  = (member.name || member.email || 'U').charAt(0).toUpperCase();

  return (
    <>
      <Styles />
      <motion.div
        className={`mli-row ${isActive ? 'active' : 'inactive'}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.26, ease: [0.25, 1, 0.35, 1] }}
      >
        {/* Left — click to view */}
        <div className="mli-left" onClick={() => onView(member)}>
          <div className={`mli-avatar${isActive ? '' : ' inactive'}`}>{initial}</div>
          <div className="mli-info">
            <div className="mli-name">{member.name || 'Unknown'}</div>
            <div className="mli-email">{member.email}</div>
          </div>
        </div>

        {/* Right — status + actions */}
        <div className="mli-right">
          <span className={`mli-status ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>

          {/* View */}
          <button className="mli-btn view" onClick={() => onView(member)} title="View member">
            <FiEye size={14} />
          </button>

          {isActive ? (
            <>
              {/* Edit */}
              <button className="mli-btn edit" onClick={e => onEdit(e, member)} title="Edit member">
                <FiEdit2 size={13} />
              </button>
              {/* Remove */}
              <button className="mli-btn remove" onClick={e => onRemove(e, member)} title="Remove member">
                <FiTrash2 size={13} />
              </button>
            </>
          ) : (
            /* Reactivate */
            <button className="mli-btn reactivate" onClick={e => onReactivate(e, member)} title="Reactivate member">
              <FiRefreshCw size={13} />
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default MemberListItem;