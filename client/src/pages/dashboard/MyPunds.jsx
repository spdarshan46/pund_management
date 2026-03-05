// src/pages/dashboard/MyPunds.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiEye, FiGrid, FiList,
  FiChevronRight, FiHome, FiPlus, FiUsers,
} from 'react-icons/fi';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.mp-wrap {
  max-width: 960px;
  margin: 0 auto;

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
  --purple:   #7c3aed;
  --purple-l: #f5f3ff;
  --green:    #059669;
  --green-l:  #ecfdf5;
  --gray-l:   #f3f4f6;
  --sh:       0 1px 3px rgba(0,0,0,.07);
  --sh-lg:    0 10px 32px rgba(0,0,0,.10);
}
.db-root.dark .mp-wrap {
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
  --purple:   #a78bfa;
  --purple-l: rgba(139,92,246,.12);
  --green:    #34d399;
  --green-l:  rgba(52,211,153,.1);
  --gray-l:   rgba(255,255,255,.05);
  --sh:       0 1px 3px rgba(0,0,0,.5);
  --sh-lg:    0 10px 32px rgba(0,0,0,.4);
}

/* ── Toolbar ── */
.mp-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap; margin-bottom: 18px;
}
.mp-heading {
  font-size: 18px; font-weight: 700; color: var(--t1); letter-spacing: -.025em;
}
.mp-toolbar-right { display: flex; align-items: center; gap: 8px; }

/* Search */
.mp-search-wrap { position: relative; }
.mp-search-ico {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  color: var(--t4); pointer-events: none; display: flex; align-items: center;
}
.mp-search-inp {
  height: 36px; padding: 0 12px 0 32px; width: 200px;
  font-size: 13px; font-family: inherit; color: var(--t1);
  background: var(--surf); border: 1px solid var(--bd); border-radius: 9px; outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.mp-search-inp::placeholder { color: var(--t4); }
.mp-search-inp:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); }

/* View toggle */
.mp-toggle {
  display: flex; align-items: center; gap: 2px;
  background: var(--surf); border: 1px solid var(--bd); border-radius: 9px; padding: 3px;
}
.mp-toggle-btn {
  width: 30px; height: 30px; border-radius: 7px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--t4); background: transparent;
  transition: background .12s, color .12s;
}
.mp-toggle-btn.active { background: var(--blue-l); color: var(--blue); }
.mp-toggle-btn:hover:not(.active) { background: var(--bg-2); color: var(--t2); }

/* ── Empty state ── */
.mp-empty {
  background: var(--surf); border: 1px solid var(--bd); border-radius: 18px;
  padding: 56px 24px; text-align: center; box-shadow: var(--sh);
}
.mp-empty-ico {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--bg-2); border: 1px solid var(--bd);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; color: var(--t4);
}
.mp-empty-title { font-size: 15px; font-weight: 600; color: var(--t1); margin-bottom: 6px; }
.mp-empty-sub   { font-size: 13px; color: var(--t3); margin-bottom: 20px; }
.mp-create-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 20px; font-size: 13px; font-weight: 600; color: #fff;
  background: var(--blue); border: none; border-radius: 10px;
  cursor: pointer; font-family: inherit; text-decoration: none;
  box-shadow: 0 3px 12px rgba(37,99,235,.35);
  transition: background .15s, transform .15s;
}
.mp-create-btn:hover { background: var(--blue-d); transform: translateY(-1px); }

/* ══ GRID MODE ══ */
.mp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}
.mp-card {
  background: var(--surf); border: 1px solid var(--bd); border-radius: 16px;
  padding: 18px; cursor: pointer; box-shadow: var(--sh);
  transition: box-shadow .2s, border-color .2s, transform .2s;
  display: flex; flex-direction: column;
}
.mp-card:hover { box-shadow: var(--sh-lg); border-color: var(--bd-2); transform: translateY(-3px); }

.mp-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
.mp-card-avatar {
  width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 800; color: #fff;
  box-shadow: 0 2px 10px rgba(37,99,235,.3);
}
.mp-card-name { font-size: 14px; font-weight: 700; color: var(--t1); margin-bottom: 3px; word-break: break-word; }
.mp-card-type { font-size: 11px; font-weight: 600; color: var(--t3); letter-spacing: .04em; text-transform: uppercase; }

/* info rows inside card */
.mp-card-info { flex: 1; display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.mp-card-info-row {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 12.5px;
}
.mp-card-info-lbl { color: var(--t3); font-weight: 500; }

/* Card view btn */
.mp-card-btn {
  width: 100%; height: 36px;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 13px; font-weight: 600; color: #fff;
  background: var(--blue); border: none; border-radius: 9px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 2px 8px rgba(37,99,235,.28);
  transition: background .15s, box-shadow .15s;
}
.mp-card-btn:hover { background: var(--blue-d); box-shadow: 0 4px 14px rgba(37,99,235,.4); }

/* ══ LIST MODE ══ */
.mp-list {
  background: var(--surf); border: 1px solid var(--bd); border-radius: 16px;
  overflow: hidden; box-shadow: var(--sh);
}
.mp-list-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 16px; cursor: pointer;
  border-bottom: 1px solid var(--bd);
  transition: background .12s, padding-left .12s;
}
.mp-list-row:last-child { border-bottom: none; }
.mp-list-row:hover { background: var(--bg); padding-left: 20px; }
.mp-list-row-l { display: flex; align-items: center; gap: 12px; }
.mp-list-avatar {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; color: #fff;
  box-shadow: 0 2px 8px rgba(37,99,235,.25);
}
.mp-list-name { font-size: 13.5px; font-weight: 600; color: var(--t1); margin-bottom: 2px; }
.mp-list-type { font-size: 11px; color: var(--t3); text-transform: uppercase; font-weight: 500; letter-spacing: .04em; }
.mp-list-row-r { display: flex; align-items: center; gap: 8px; }

/* ── Shared badges ── */
.mp-badge { font-size: 11.5px; font-weight: 600; padding: 3px 10px; border-radius: 100px; }
.mp-role-owner  { background: var(--purple-l); color: var(--purple); }
.mp-role-member { background: var(--blue-l);   color: var(--blue); }
.mp-status-active   { background: var(--green-l); color: var(--green); }
.mp-status-inactive { background: var(--gray-l);  color: var(--t3); }

.mp-members-tag {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 500; color: var(--t3);
}

/* Skeleton */
.mp-skel-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 12px; }
.mp-skel-card {
  background: var(--surf); border: 1px solid var(--bd); border-radius: 16px;
  padding: 18px; box-shadow: var(--sh);
}
.mp-skel-line {
  height: 13px; border-radius: 7px; background: var(--bd);
  animation: mp-pulse 1.4s ease-in-out infinite; margin-bottom: 9px;
}
@keyframes mp-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
`;

let _mpIn = false;
const Styles = () => {
  useEffect(() => {
    if (_mpIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _mpIn = true;
  }, []);
  return null;
};

/* ─── Badge helpers ─────────────────────────────────────── */
const RoleBadge = ({ role }) => {
  const r = (role || 'member').toLowerCase();
  return (
    <span className={`mp-badge ${r === 'owner' ? 'mp-role-owner' : 'mp-role-member'}`}>
      {role || 'Member'}
    </span>
  );
};
const StatusBadge = ({ active }) => (
  <span className={`mp-badge ${active ? 'mp-status-active' : 'mp-status-inactive'}`}>
    {active ? 'Active' : 'Inactive'}
  </span>
);

/* ═══════════════════════════════════════════════════════════ */
const MyPunds = ({ punds: initialPunds = [], searchTerm: initialSearch = '', onPundClick }) => {
  const navigate = useNavigate();
  const [search,   setSearch]   = useState(initialSearch);
  const [viewMode, setViewMode] = useState('grid');

  const filtered = (initialPunds || []).filter(p =>
    p.pund_name?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Empty ── */
  const EmptyState = () => (
    <div className="mp-empty">
      <div className="mp-empty-ico"><FiHome size={22} /></div>
      <div className="mp-empty-title">
        {search ? 'No matching punds' : 'No punds yet'}
      </div>
      <div className="mp-empty-sub">
        {search ? 'Try a different search term' : 'Create your first pund to start saving together'}
      </div>
      {!search && (
        <button className="mp-create-btn" onClick={() => navigate('/dashboard/pund/create')}>
          <FiPlus size={14} /> Create New Pund
        </button>
      )}
    </div>
  );

  return (
    <>
      <Styles />
      <div className="mp-wrap">

        {/* Toolbar */}
        <div className="mp-toolbar">
          <h1 className="mp-heading">My Punds{filtered.length > 0 && <span style={{ color: 'var(--t3)', fontWeight: 600, fontSize: 15, marginLeft: 8 }}>({filtered.length})</span>}</h1>
          <div className="mp-toolbar-right">
            {/* Search */}
            <div className="mp-search-wrap">
              <span className="mp-search-ico"><FiSearch size={13} /></span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search punds…"
                className="mp-search-inp"
                aria-label="Search punds"
              />
            </div>
            {/* View toggle */}
            <div className="mp-toggle">
              <button
                className={`mp-toggle-btn${viewMode === 'grid' ? ' active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <FiGrid size={14} />
              </button>
              <button
                className={`mp-toggle-btn${viewMode === 'list' ? ' active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <FiList size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div key="empty"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.26 }}
            >
              <EmptyState />
            </motion.div>

          ) : viewMode === 'grid' ? (
            <motion.div key="grid" className="mp-grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            >
              {filtered.map((pund, i) => (
                <motion.div key={pund.pund_id} className="mp-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05, ease: [0.25, 1, 0.35, 1] }}
                  onClick={() => onPundClick(pund.pund_id)}
                >
                  {/* Top row */}
                  <div className="mp-card-top">
                    <div className="mp-card-avatar">
                      {pund.pund_name?.charAt(0).toUpperCase()}
                    </div>
                    <RoleBadge role={pund.role} />
                  </div>

                  {/* Name + type */}
                  <div style={{ marginBottom: 14 }}>
                    <div className="mp-card-name">{pund.pund_name}</div>
                    <div className="mp-card-type">{pund.pund_type || 'General'}</div>
                  </div>

                  {/* Info rows */}
                  <div className="mp-card-info">
                    <div className="mp-card-info-row">
                      <span className="mp-card-info-lbl">Status</span>
                      <StatusBadge active={pund.pund_active} />
                    </div>
                    <div className="mp-card-info-row">
                      <span className="mp-card-info-lbl">Members</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>
                        <FiUsers size={12} style={{ color: 'var(--t4)' }} />
                        {pund.member_count || 0}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button className="mp-card-btn"
                    onClick={e => { e.stopPropagation(); onPundClick(pund.pund_id); }}>
                    <FiEye size={13} /> View Details
                  </button>
                </motion.div>
              ))}
            </motion.div>

          ) : (
            /* ── LIST MODE ── */
            <motion.div key="list" className="mp-list"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            >
              {filtered.map((pund, i) => (
                <motion.div key={pund.pund_id} className="mp-list-row"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.26, delay: i * 0.04, ease: [0.25, 1, 0.35, 1] }}
                  onClick={() => onPundClick(pund.pund_id)}
                >
                  <div className="mp-list-row-l">
                    <div className="mp-list-avatar">
                      {pund.pund_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="mp-list-name">{pund.pund_name}</div>
                      <div className="mp-list-type">{pund.pund_type || 'General'}</div>
                    </div>
                  </div>

                  <div className="mp-list-row-r">
                    <RoleBadge role={pund.role} />
                    <StatusBadge active={pund.pund_active} />
                    <span className="mp-members-tag">
                      <FiUsers size={11} /> {pund.member_count ?? 0}
                    </span>
                    <FiChevronRight size={15} style={{ color: 'var(--t4)' }} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
};

export default MyPunds;