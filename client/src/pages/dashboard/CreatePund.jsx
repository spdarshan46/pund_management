// src/pages/dashboard/CreatePund.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers, FiDollarSign, FiCalendar, FiClock,
  FiInfo, FiCheckCircle, FiArrowLeft, FiPlus,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.cp2-wrap {
  max-width: 560px;
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
  --err:      #dc2626;
  --err-l:    #fef2f2;
  --sh-lg:    0 12px 40px rgba(0,0,0,.10);
}
.db-root.dark .cp2-wrap {
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
  --err:      #f87171;
  --err-l:    rgba(248,113,113,.1);
  --sh-lg:    0 12px 40px rgba(0,0,0,.45);
}

/* ── Back link ── */
.cp2-back {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 500; color: var(--t3);
  background: none; border: none; cursor: pointer;
  font-family: inherit; padding: 0; margin-bottom: 16px;
  transition: color .12s;
}
.cp2-back:hover { color: var(--t1); }

/* ── Card ── */
.cp2-card {
  background: var(--surf);
  border: 1px solid var(--bd);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--sh-lg);
}

/* ── Banner ── */
.cp2-banner {
  background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 60%, #7c3aed 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
}
.cp2-banner::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.12) 0%, transparent 60%);
  pointer-events: none;
}
.cp2-banner-row {
  display: flex; align-items: center; gap: 14px; position: relative; z-index: 1;
}
.cp2-banner-icon {
  width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
  background: rgba(255,255,255,.18);
  border: 2px solid rgba(255,255,255,.3);
  display: flex; align-items: center; justify-content: center;
  color: #fff; backdrop-filter: blur(8px);
}
.cp2-banner-title { font-size: 17px; font-weight: 700; color: #fff; letter-spacing: -.02em; margin-bottom: 3px; }
.cp2-banner-sub   { font-size: 13px; color: rgba(255,255,255,.72); }

/* ── Body ── */
.cp2-body { padding: 24px; }

/* ── Field ── */
.cp2-field { margin-bottom: 20px; }
.cp2-label {
  display: block; font-size: 13px; font-weight: 500;
  color: var(--t2); margin-bottom: 6px;
}
.cp2-req { color: var(--err); margin-left: 2px; }
.cp2-inp-wrap { position: relative; }
.cp2-ico {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: var(--t4); pointer-events: none; display: flex; align-items: center;
}
.cp2-input {
  width: 100%; height: 46px; padding: 0 14px 0 42px;
  font-size: 14px; font-family: inherit; color: var(--t1);
  background: var(--bg); border: 1px solid var(--bd); border-radius: 10px; outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.cp2-input::placeholder { color: var(--t4); }
.cp2-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); background: var(--surf); }
.cp2-input.err { border-color: var(--err); box-shadow: 0 0 0 3px var(--err-l); }
.cp2-err-msg { font-size: 12px; color: var(--err); margin-top: 4px; }

/* ── Type selector ── */
.cp2-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.cp2-type-card {
  position: relative; padding: 16px 14px; border-radius: 12px;
  border: 1.5px solid var(--bd); background: var(--bg);
  cursor: pointer; transition: border-color .15s, background .15s, box-shadow .15s;
}
.cp2-type-card:hover { border-color: var(--bd-2); background: var(--bg-2); }
.cp2-type-card.selected {
  border-color: var(--blue);
  background: var(--blue-l);
  box-shadow: 0 0 0 3px var(--blue-l);
}
.cp2-type-check {
  position: absolute; top: 10px; right: 10px;
  color: var(--blue); display: none;
}
.cp2-type-card.selected .cp2-type-check { display: block; }
.cp2-type-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 10px;
  background: var(--bd); color: var(--t3);
  transition: background .15s, color .15s;
}
.cp2-type-card.selected .cp2-type-icon {
  background: var(--blue); color: #fff;
  box-shadow: 0 2px 8px rgba(37,99,235,.3);
}
.cp2-type-lbl {
  font-size: 13px; font-weight: 700; color: var(--t1); margin-bottom: 3px;
  transition: color .15s;
}
.cp2-type-card.selected .cp2-type-lbl { color: var(--blue); }
.cp2-type-desc { font-size: 11px; color: var(--t3); line-height: 1.4; }
.cp2-type-card.selected .cp2-type-desc { color: var(--blue); opacity: .8; }

/* ── Info box ── */
.cp2-info {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px; border-radius: 12px;
  background: var(--blue-l); border: 1px solid var(--blue-b);
  margin-bottom: 20px;
}
.cp2-info-ico { color: var(--blue); flex-shrink: 0; margin-top: 1px; }
.cp2-info-title { font-size: 13px; font-weight: 600; color: var(--blue); margin-bottom: 6px; }
.cp2-info-list { display: flex; flex-direction: column; gap: 4px; }
.cp2-info-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 12.5px; color: var(--blue); opacity: .85;
}

/* ── Divider ── */
.cp2-divider { height: 1px; background: var(--bd); margin: 20px 0; }

/* ── Buttons ── */
.cp2-btn-row { display: flex; gap: 10px; }
.cp2-btn {
  flex: 1; height: 46px;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  font-size: 14px; font-weight: 600; color: #fff;
  background: var(--blue); border: none; border-radius: 10px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 3px 12px rgba(37,99,235,.35);
  transition: background .15s, transform .15s, box-shadow .15s;
}
.cp2-btn:hover:not(:disabled) { background: var(--blue-d); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,.45); }
.cp2-btn:disabled { opacity: .6; cursor: not-allowed; }
.db-root.dark .cp2-btn { box-shadow: 0 3px 12px rgba(88,166,255,.2); }
.cp2-btn-ghost {
  flex: 1; height: 46px;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  font-size: 14px; font-weight: 500; color: var(--t2);
  background: var(--bg); border: 1px solid var(--bd); border-radius: 10px;
  cursor: pointer; font-family: inherit; transition: .15s;
}
.cp2-btn-ghost:hover { background: var(--bg-2); border-color: var(--bd-2); color: var(--t1); }
.cp2-spin {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: cp2-rot .65s linear infinite;
}
@keyframes cp2-rot { to { transform: rotate(360deg); } }
`;

let _cp2In = false;
const Styles = () => {
  useEffect(() => {
    if (_cp2In) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _cp2In = true;
  }, []);
  return null;
};

/* ─── Pund types ─────────────────────────────────────────── */
const PUND_TYPES = [
  { value: 'DAILY',   label: 'Daily',   icon: FiClock,      desc: 'Contribute every day' },
  { value: 'WEEKLY',  label: 'Weekly',  icon: FiCalendar,   desc: 'Contribute every week' },
  { value: 'MONTHLY', label: 'Monthly', icon: FiDollarSign, desc: 'Contribute every month' },
];

const INFO_ITEMS = [
  'You become the owner automatically',
  'Invite members after creation',
  'Set contribution structure to start cycles',
];

/* ═══════════════════════════════════════════════════════════ */
const CreatePund = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', pund_type: 'WEEKLY', description: '' });
  const [errors,   setErrors]  = useState({});

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Pund name is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await api.post('/punds/create/', {
        name:        formData.name,
        pund_type:   formData.pund_type,
        description: formData.description,
      });
      toast.success('Pund created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create pund');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Styles />
      <div className="cp2-wrap">

        {/* Back button */}
        <button className="cp2-back" onClick={() => navigate('/dashboard')}>
          <FiArrowLeft size={15} /> Back to Dashboard
        </button>

        <motion.div className="cp2-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.25, 1, 0.35, 1] }}
        >

          {/* Banner */}
          <div className="cp2-banner">
            <div className="cp2-banner-row">
              <div className="cp2-banner-icon"><FiUsers size={22} /></div>
              <div>
                <div className="cp2-banner-title">Create New Pund</div>
                <div className="cp2-banner-sub">Start a new savings group with your people</div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="cp2-body">
            <form onSubmit={handleSubmit} noValidate>

              {/* Pund name */}
              <div className="cp2-field">
                <label className="cp2-label" htmlFor="cp2-name">
                  Pund name <span className="cp2-req">*</span>
                </label>
                <div className="cp2-inp-wrap">
                  <span className="cp2-ico"><FiUsers size={15} /></span>
                  <input id="cp2-name" type="text" name="name"
                    value={formData.name} onChange={handleChange}
                    placeholder="e.g., Family Savings Circle"
                    autoComplete="off"
                    className={`cp2-input${errors.name ? ' err' : ''}`} />
                </div>
                {errors.name && <p className="cp2-err-msg" role="alert">{errors.name}</p>}
              </div>

              {/* Pund type */}
              <div className="cp2-field">
                <label className="cp2-label">
                  Contribution cycle <span className="cp2-req">*</span>
                </label>
                <div className="cp2-types">
                  {PUND_TYPES.map(type => (
                    <motion.div key={type.value}
                      className={`cp2-type-card${formData.pund_type === type.value ? ' selected' : ''}`}
                      onClick={() => setFormData(p => ({ ...p, pund_type: type.value }))}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FiCheckCircle size={14} className="cp2-type-check" />
                      <div className="cp2-type-icon"><type.icon size={16} /></div>
                      <div className="cp2-type-lbl">{type.label}</div>
                      <div className="cp2-type-desc">{type.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="cp2-divider" />

              {/* Info box */}
              <div className="cp2-info">
                <span className="cp2-info-ico"><FiInfo size={16} /></span>
                <div>
                  <div className="cp2-info-title">After creating your pund</div>
                  <div className="cp2-info-list">
                    {INFO_ITEMS.map((item, i) => (
                      <div key={i} className="cp2-info-item">
                        <FiCheckCircle size={11} /> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="cp2-btn-row">
                <button type="button" className="cp2-btn-ghost" onClick={() => navigate('/dashboard')}>
                  Cancel
                </button>
                <motion.button type="submit" className="cp2-btn" disabled={loading}
                  whileHover={!loading ? { scale: 1.015 } : {}}
                  whileTap={!loading ? { scale: 0.985 } : {}}
                >
                  {loading
                    ? <div className="cp2-spin" />
                    : <><FiPlus size={15} /> Create Pund</>
                  }
                </motion.button>
              </div>

            </form>
          </div>

        </motion.div>
      </div>
    </>
  );
};

export default CreatePund;