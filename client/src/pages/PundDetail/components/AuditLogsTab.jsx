import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiShield, FiClock, FiUser, FiActivity,
  FiCalendar, FiHash,
} from 'react-icons/fi';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.al-wrap {
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
  --blue-l:   #eff6ff;
  --blue-b:   #bfdbfe;
  --purple:   #7c3aed;
  --purple-l: #f5f3ff;
  --green:    #059669;
  --green-l:  #ecfdf5;
  --sh:       0 1px 3px rgba(0,0,0,.07);
  --sh-lg:    0 10px 32px rgba(0,0,0,.09);
}
.pd-root.dark .al-wrap {
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
  --blue-l:   rgba(56,139,253,.12);
  --blue-b:   rgba(56,139,253,.3);
  --purple:   #a78bfa;
  --purple-l: rgba(139,92,246,.12);
  --green:    #34d399;
  --green-l:  rgba(52,211,153,.1);
  --sh:       0 1px 3px rgba(0,0,0,.5);
  --sh-lg:    0 10px 32px rgba(0,0,0,.4);
}

/* ── Empty state ── */
.al-empty {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 18px; padding: 56px 24px; text-align: center;
  box-shadow: var(--sh);
}
.al-empty-ico {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--bg-2); border: 1px solid var(--bd);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; color: var(--t4);
}
.al-empty-title { font-size: 15px; font-weight: 600; color: var(--t1); margin-bottom: 6px; }
.al-empty-sub   { font-size: 13px; color: var(--t3); }

/* ── Stat row ── */
.al-stats {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 10px; margin-bottom: 14px;
}
.al-stat {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 12px; padding: 13px; box-shadow: var(--sh);
}
.al-stat-hd {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: var(--t3); font-weight: 500; margin-bottom: 7px;
}
.al-stat-ico {
  width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.al-stat-ico.blue   { background: var(--blue-l);   color: var(--blue); }
.al-stat-ico.green  { background: var(--green-l);  color: var(--green); }
.al-stat-ico.purple { background: var(--purple-l); color: var(--purple); }
.al-stat-val { font-size: 16px; font-weight: 700; color: var(--t1); }
.al-stat-sub { font-size: 11px; color: var(--t4); margin-top: 2px; }

/* ── Log list card ── */
.al-card {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 16px; overflow: hidden; box-shadow: var(--sh);
}

/* ── Log row ── */
.al-row {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px; border-bottom: 1px solid var(--bd);
  transition: background .12s;
}
.al-row:last-child { border-bottom: none; }
.al-row:hover { background: var(--bg); }

.al-row-ico {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,.25);
}

.al-row-body { flex: 1; min-width: 0; }
.al-row-top {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 10px; margin-bottom: 4px;
}
.al-action  { font-size: 13px; font-weight: 600; color: var(--t1); }
.al-time {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; color: var(--t4); white-space: nowrap; flex-shrink: 0;
}
.al-desc { font-size: 12.5px; color: var(--t3); margin-bottom: 6px; line-height: 1.5; }
.al-by {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; color: var(--t4);
}
.al-by-name { color: var(--t3); font-weight: 500; }
`;

let _alIn = false;
const Styles = () => {
  useEffect(() => {
    if (_alIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _alIn = true;
  }, []);
  return null;
};

const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });

/* ═══════════════════════════════════════════════════════════ */
const AuditLogsTab = ({ auditLogs }) => (
  <>
    <Styles />
    <div className="al-wrap">

      {/* ── Empty ── */}
      {(!auditLogs || auditLogs.length === 0) ? (
        <div className="al-empty">
          <div className="al-empty-ico"><FiShield size={22} /></div>
          <div className="al-empty-title">No audit logs yet</div>
          <div className="al-empty-sub">Financial actions will be recorded here</div>
        </div>
      ) : (
        <>
          {/* ── Stats ── */}
          <div className="al-stats">
            <motion.div className="al-stat"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
            >
              <div className="al-stat-hd">
                <div className="al-stat-ico blue"><FiActivity size={11} /></div>
                Total Actions
              </div>
              <div className="al-stat-val">{auditLogs.length}</div>
            </motion.div>

            <motion.div className="al-stat"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.28 }}
            >
              <div className="al-stat-hd">
                <div className="al-stat-ico green"><FiCalendar size={11} /></div>
                Last Action
              </div>
              <div className="al-stat-val" style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {auditLogs[0]?.action || 'N/A'}
              </div>
              <div className="al-stat-sub">
                {auditLogs[0] ? new Date(auditLogs[0].timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' }) : ''}
              </div>
            </motion.div>

            <motion.div className="al-stat"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.28 }}
            >
              <div className="al-stat-hd">
                <div className="al-stat-ico purple"><FiHash size={11} /></div>
                Unique Actions
              </div>
              <div className="al-stat-val">{new Set(auditLogs.map(l => l.action)).size}</div>
            </motion.div>
          </div>

          {/* ── Log list ── */}
          <div className="al-card">
            {auditLogs.map((log, i) => (
              <motion.div key={i} className="al-row"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.24 }}
              >
                <div className="al-row-ico"><FiShield size={15} /></div>
                <div className="al-row-body">
                  <div className="al-row-top">
                    <span className="al-action">{log.action}</span>
                    <span className="al-time">
                      <FiClock size={10} /> {fmtDate(log.timestamp)}
                    </span>
                  </div>
                  <div className="al-desc">{log.description}</div>
                  <div className="al-by">
                    <FiUser size={11} />
                    by <span className="al-by-name">{log.performed_by || 'System'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

    </div>
  </>
);

export default AuditLogsTab;
