import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSave, FiInfo, FiCalendar, FiClock,
  FiSliders, FiCheckCircle, FiAlertTriangle,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.st-wrap {
  max-width: 680px;
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
  --amber:    #d97706;
  --amber-l:  #fffbeb;
  --amber-b:  #fde68a;
  --red:      #dc2626;
  --err:      #dc2626;
  --err-l:    #fef2f2;
  --sh-lg:    0 12px 40px rgba(0,0,0,.10);
}
.pd-root.dark .st-wrap {
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
  --amber:    #fbbf24;
  --amber-l:  rgba(251,191,36,.1);
  --amber-b:  rgba(251,191,36,.25);
  --err:      #f87171;
  --err-l:    rgba(248,113,113,.1);
  --sh-lg:    0 12px 40px rgba(0,0,0,.45);
}

/* ── Card ── */
.st-card {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 18px; overflow: hidden; box-shadow: var(--sh-lg);
  margin-bottom: 14px;
}
.st-card:last-child { margin-bottom: 0; }

/* ── Banner ── */
.st-banner {
  background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 60%, #7c3aed 100%);
  padding: 22px 24px; position: relative; overflow: hidden;
}
.st-banner::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.12) 0%, transparent 60%);
  pointer-events: none;
}
.st-banner-row { display: flex; align-items: center; gap: 14px; position: relative; z-index: 1; }
.st-banner-icon {
  width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
  background: rgba(255,255,255,.18); border: 2px solid rgba(255,255,255,.3);
  display: flex; align-items: center; justify-content: center;
  color: #fff; backdrop-filter: blur(8px);
}
.st-banner-title { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -.02em; margin-bottom: 3px; }
.st-banner-sub   { font-size: 12.5px; color: rgba(255,255,255,.72); }

/* ── Body ── */
.st-body { padding: 22px; }

/* ── Current structure display ── */
.st-current {
  background: var(--blue-l); border: 1px solid var(--blue-b);
  border-radius: 13px; padding: 16px; margin-bottom: 20px;
}
.st-current-hd {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600; color: var(--blue);
  margin-bottom: 12px;
}
.st-current-date {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; color: var(--t3); margin-bottom: 12px;
  background: var(--surf); border: 1px solid var(--bd);
  padding: 8px 12px; border-radius: 8px;
}
.st-current-date span { color: var(--t2); font-weight: 500; }
.st-current-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
}
@media (min-width: 640px) { .st-current-grid { grid-template-columns: repeat(5, 1fr); } }
.st-current-cell {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 9px; padding: 10px 12px;
}
.st-current-lbl { font-size: 10.5px; color: var(--blue); font-weight: 500; margin-bottom: 4px; }
.st-current-val { font-size: 14px; font-weight: 700; color: var(--t1); }

/* ── Section label ── */
.st-section-lbl {
  font-size: 12.5px; font-weight: 600; color: var(--t2); margin-bottom: 10px;
  display: flex; align-items: center; gap: 7px;
}

/* ── Effective date picker ── */
.st-eff-box {
  background: var(--bg); border: 1px solid var(--bd);
  border-radius: 12px; padding: 16px; margin-bottom: 20px;
}
.st-radio-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 9px; cursor: pointer;
  border: 1.5px solid var(--bd); background: var(--surf);
  margin-bottom: 8px; transition: border-color .15s, background .15s;
}
.st-radio-row:last-child { margin-bottom: 0; }
.st-radio-row.selected { border-color: var(--blue); background: var(--blue-l); }
.st-radio-row input[type="radio"] {
  width: 15px; height: 15px; accent-color: var(--blue); flex-shrink: 0; cursor: pointer;
}
.st-radio-lbl { font-size: 13px; font-weight: 500; color: var(--t2); }
.st-radio-row.selected .st-radio-lbl { color: var(--blue); }
.st-radio-hint { font-size: 11.5px; color: var(--t4); margin-left: auto; }
.st-date-input-wrap { margin-top: 10px; padding-left: 25px; }
.st-date-input {
  width: 100%; height: 42px; padding: 0 14px;
  font-size: 13.5px; font-family: inherit; color: var(--t1);
  background: var(--surf); border: 1px solid var(--bd); border-radius: 9px; outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.st-date-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); }
.st-date-hint { font-size: 11.5px; color: var(--t4); margin-top: 5px; }

/* ── Form fields grid ── */
.st-form-grid {
  display: grid; grid-template-columns: 1fr; gap: 14px;
}
@media (min-width: 560px) { .st-form-grid { grid-template-columns: repeat(2, 1fr); } }

.st-field { margin-bottom: 0; }
.st-label {
  display: block; font-size: 13px; font-weight: 500;
  color: var(--t2); margin-bottom: 5px;
}
.st-req { color: var(--err); margin-left: 2px; }
.st-inp-wrap { position: relative; }
.st-ico {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: var(--t4); pointer-events: none; display: flex; align-items: center;
}
.st-input {
  width: 100%; height: 44px; padding: 0 14px 0 40px;
  font-size: 14px; font-family: inherit; color: var(--t1);
  background: var(--bg); border: 1px solid var(--bd); border-radius: 10px; outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
  -moz-appearance: textfield;
}
.st-input::-webkit-inner-spin-button,
.st-input::-webkit-outer-spin-button { -webkit-appearance: none; }
.st-input::placeholder { color: var(--t4); }
.st-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); background: var(--surf); }
.st-input.err { border-color: var(--err); box-shadow: 0 0 0 3px var(--err-l); }
.st-field-hint { font-size: 11.5px; color: var(--t4); margin-top: 4px; }
.st-err-msg { font-size: 12px; color: var(--err); margin-top: 4px; }

/* Full-width field */
.st-field-full { grid-column: 1 / -1; }

/* ── Info / warning box ── */
.st-info {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px; border-radius: 12px; margin: 18px 0 0;
  background: var(--amber-l); border: 1px solid var(--amber-b);
}
.st-info-ico { color: var(--amber); flex-shrink: 0; margin-top: 1px; }
.st-info-title { font-size: 13px; font-weight: 600; color: var(--amber); margin-bottom: 4px; }
.st-info-body  { font-size: 12.5px; color: var(--amber); opacity: .85; line-height: 1.5; }

/* ── Divider ── */
.st-divider { height: 1px; background: var(--bd); margin: 20px 0; }

/* ── Submit row ── */
.st-submit-row { display: flex; justify-content: flex-end; margin-top: 20px; }
.st-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 0 22px; height: 44px;
  font-size: 14px; font-weight: 600; color: #fff;
  background: var(--blue); border: none; border-radius: 10px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 3px 12px rgba(37,99,235,.35);
  transition: background .15s, transform .15s, box-shadow .15s;
}
.st-btn:hover:not(:disabled) { background: var(--blue-d); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,.45); }
.st-btn:disabled { opacity: .6; cursor: not-allowed; }
.st-spin {
  width: 17px; height: 17px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: st-rot .65s linear infinite;
}
@keyframes st-rot { to { transform: rotate(360deg); } }

/* Footer hint */
.st-footer-hint {
  text-align: center; font-size: 12px; color: var(--t4); margin-top: 14px;
}
`;

let _stIn = false;
const Styles = () => {
  useEffect(() => {
    if (_stIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _stIn = true;
  }, []);
  return null;
};

/* ─── helpers ─────────────────────────────────────────────── */
const fmt = (v) => `₹${(parseFloat(v) || 0).toLocaleString('en-IN')}`;
const fmtDate = (s) => {
  if (!s) return 'N/A';
  const [y, m, d] = s.split('-');
  return y && m && d ? `${d}/${m}/${y}` : s;
};
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const nextWeekStr = () => {
  const d = new Date(); d.setDate(d.getDate() + 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/* ─── field config ── */
const FIELDS = [
  { name: 'saving_amount', label: 'Saving amount', icon: '₹', placeholder: 'e.g. 1000', min: '1', step: '1', hint: '' },
  { name: 'missed_saving_penalty', label: 'Missed saving penalty', icon: '₹', placeholder: 'e.g. 100', min: '0', step: '1', hint: '' },
  { name: 'loan_interest_percentage', label: 'Loan Interest', icon: '%', placeholder: 'e.g. 10', min: '0', step: '0.1', hint: 'Per cycle' },
  { name: 'missed_loan_penalty', label: 'Missed loan penalty', icon: '₹', placeholder: 'e.g. 100', min: '0', step: '1', hint: '' },
];

/* ═══════════════════════════════════════════════════════════ */
const StructureTab = ({ pundData, onSubmit }) => {
  const [data, setData] = useState({
    saving_amount: pundData?.structure?.saving_amount || '',
    loan_interest_percentage: pundData?.structure?.loan_interest_percentage || '',
    missed_saving_penalty: pundData?.structure?.missed_saving_penalty || '',
    missed_loan_penalty: pundData?.structure?.missed_loan_penalty || '',
    default_loan_cycles: pundData?.structure?.default_loan_cycles || '10',
    effective_from: '',
  });
  const [effectiveOpt, setEffectiveOpt] = useState('manual');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!data.saving_amount || parseFloat(data.saving_amount) <= 0) errs.saving_amount = 'Enter a valid amount (> 0)';
    if (data.loan_interest_percentage === '' || parseFloat(data.loan_interest_percentage) < 0) errs.loan_interest_percentage = 'Enter a valid rate (≥ 0)';
    if (data.missed_saving_penalty === '' || parseFloat(data.missed_saving_penalty) < 0) errs.missed_saving_penalty = 'Enter a valid penalty (≥ 0)';
    if (data.missed_loan_penalty === '' || parseFloat(data.missed_loan_penalty) < 0) errs.missed_loan_penalty = 'Enter a valid penalty (≥ 0)';
    if (!data.default_loan_cycles || parseInt(data.default_loan_cycles) < 1) errs.default_loan_cycles = 'Enter at least 1 cycle';
    if (effectiveOpt === 'manual' && !data.effective_from) errs.effective_from = 'Please select a date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      saving_amount: parseFloat(data.saving_amount),
      loan_interest_percentage: parseFloat(data.loan_interest_percentage),
      missed_saving_penalty: parseFloat(data.missed_saving_penalty),
      missed_loan_penalty: parseFloat(data.missed_loan_penalty),
      default_loan_cycles: parseInt(data.default_loan_cycles),
    };
    if (effectiveOpt === 'manual' && data.effective_from) payload.effective_from = data.effective_from;
    setSubmitting(true);
    await onSubmit(payload);
    setSubmitting(false);
  };

  const hasStructure = !!pundData?.structure;

  return (
    <>
      <Styles />
      <div className="st-wrap">

        {/* ── Main form card ── */}
        <motion.div className="st-card"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.25, 1, .35, 1] }}
        >
          {/* Banner */}
          <div className="st-banner">
            <div className="st-banner-row">
              <div className="st-banner-icon"><FiSliders size={20} /></div>
              <div>
                <div className="st-banner-title">
                  {hasStructure ? 'Update Pund Structure' : 'Set Pund Structure'}
                </div>
                <div className="st-banner-sub">Configure the financial rules for this pund</div>
              </div>
            </div>
          </div>

          <div className="st-body">

            {/* ── Current structure ── */}
            {hasStructure && (
              <div className="st-current">
                <div className="st-current-hd">
                  <FiInfo size={14} /> Current Active Structure
                </div>

                {pundData.structure.effective_from && (
                  <div className="st-current-date">
                    <FiCalendar size={13} />
                    Effective from: <span>{fmtDate(pundData.structure.effective_from)}</span>
                  </div>
                )}

                <div className="st-current-grid">
                  {[
                    { lbl: 'Saving Amount', val: fmt(pundData.structure.saving_amount) },
                    { lbl: 'Saving Penalty', val: fmt(pundData.structure.missed_saving_penalty) },
                    { lbl: 'Loan Interest', val: `${pundData.structure.loan_interest_percentage}%` },
                    { lbl: 'Loan Penalty', val: fmt(pundData.structure.missed_loan_penalty) },
                    { lbl: 'Loan Cycles', val: pundData.structure.default_loan_cycles },
                  ].map((c, i) => (
                    <div key={i} className="st-current-cell">
                      <div className="st-current-lbl">{c.lbl}</div>
                      <div className="st-current-val">{c.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Effective date ── */}
            <div className="st-section-lbl">
              <FiClock size={13} /> Effective date
            </div>
            <div className="st-eff-box">
              {/* Auto option */}
              <label className={`st-radio-row${effectiveOpt === 'auto' ? ' selected' : ''}`}>
                <input type="radio" checked={effectiveOpt === 'auto'}
                  onChange={() => { setEffectiveOpt('auto'); setData(p => ({ ...p, effective_from: '' })); setErrors(p => ({ ...p, effective_from: '' })); }} />
                <span className="st-radio-lbl">Auto — 7 days from now</span>
                <span className="st-radio-hint">{fmtDate(nextWeekStr())}</span>
              </label>

              {/* Manual option */}
              <label className={`st-radio-row${effectiveOpt === 'manual' ? ' selected' : ''}`}
                style={{ flexWrap: 'wrap', gap: 8 }}
              >
                <input type="radio" checked={effectiveOpt === 'manual'}
                  onChange={() => setEffectiveOpt('manual')} />
                <span className="st-radio-lbl">Manual — pick a date</span>

                <AnimatePresence>
                  {effectiveOpt === 'manual' && (
                    <motion.div className="st-date-input-wrap" style={{ width: '100%' }}
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                    >
                      <input type="date" name="effective_from"
                        value={data.effective_from} onChange={handleChange}
                        className={`st-date-input${errors.effective_from ? ' err' : ''}`}
                      />
                      {errors.effective_from
                        ? <p className="st-err-msg" role="alert">{errors.effective_from}</p>
                        : <p className="st-date-hint">Select a future date for the structure to take effect</p>
                      }
                    </motion.div>
                  )}
                </AnimatePresence>
              </label>
            </div>

            {/* ── Form fields ── */}
            <div className="st-section-lbl">
              <FiSliders size={13} /> Financial parameters
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="st-form-grid">
                {FIELDS.map(f => (
                  <div key={f.name} className="st-field">
                    <label className="st-label" htmlFor={`st-${f.name}`}>
                      {f.label} <span className="st-req">*</span>
                    </label>
                    <div className="st-inp-wrap">
                      <span className="st-ico" style={{ fontSize: 13, fontWeight: 700 }}>{f.icon}</span>
                      <input id={`st-${f.name}`} type="number" name={f.name}
                        value={data[f.name]} onChange={handleChange}
                        placeholder={f.placeholder} min={f.min} step={f.step}
                        className={`st-input${errors[f.name] ? ' err' : ''}`}
                      />
                    </div>
                    {errors[f.name]
                      ? <p className="st-err-msg" role="alert">{errors[f.name]}</p>
                      : f.hint && <p className="st-field-hint">{f.hint}</p>
                    }
                  </div>
                ))}

                {/* Default loan cycles — full width */}
                <div className="st-field st-field-full">
                  <label className="st-label" htmlFor="st-cycles">
                    Default loan cycles <span className="st-req">*</span>
                  </label>
                  <div className="st-inp-wrap">
                    <span className="st-ico" style={{ fontSize: 12, fontWeight: 700 }}>#</span>
                    <input id="st-cycles" type="number" name="default_loan_cycles"
                      value={data.default_loan_cycles} onChange={handleChange}
                      placeholder="e.g. 10" min="1" step="1"
                      className={`st-input${errors.default_loan_cycles ? ' err' : ''}`}
                    />
                  </div>
                  {errors.default_loan_cycles
                    ? <p className="st-err-msg" role="alert">{errors.default_loan_cycles}</p>
                    : <p className="st-field-hint">Number of cycles for loan repayment (default: 10)</p>
                  }
                </div>
              </div>

              {/* Warning info */}
              <div className="st-info">
                <span className="st-info-ico"><FiAlertTriangle size={15} /></span>
                <div>
                  <div className="st-info-title">Before you save</div>
                  <div className="st-info-body">
                    New structure will be effective from{' '}
                    <strong>
                      {effectiveOpt === 'auto' ? fmtDate(nextWeekStr()) : (data.effective_from ? fmtDate(data.effective_from) : 'the selected date')}
                    </strong>.
                    The current structure remains active until then, and existing cycles continue under current rules.
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="st-submit-row">
                <motion.button type="submit" className="st-btn" disabled={submitting}
                  whileHover={!submitting ? { scale: 1.015 } : {}}
                  whileTap={!submitting ? { scale: 0.985 } : {}}
                >
                  {submitting
                    ? <div className="st-spin" />
                    : <><FiSave size={14} /> {hasStructure ? 'Update structure' : 'Save structure'}</>
                  }
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Footer hint */}
        <p className="st-footer-hint">All amounts are in Indian Rupees (₹). Interest rate is applied per cycle.</p>
      </div>
    </>
  );
};

export default StructureTab;