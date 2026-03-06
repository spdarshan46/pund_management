// src/pages/ActivateAccount.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail, FiShield, FiUser, FiPhone, FiLock,
  FiArrowRight, FiCheckCircle, FiRefreshCw, FiEye, FiEyeOff,
} from "react-icons/fi";

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.ac-root {
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
  --green:    #059669;
  --green-l:  #ecfdf5;
  --green-b:  #a7f3d0;
  --red:      #dc2626;
  --red-l:    #fef2f2;
  --red-b:    #fecaca;
  --sh:       0 4px 24px rgba(0,0,0,.08);

  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg);
  position: relative;
  overflow: hidden;
}

/* ── dark mode ── */
.ac-root.dark {
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
  --blue-d:   #79b8ff;
  --blue-l:   rgba(56,139,253,.12);
  --blue-b:   rgba(56,139,253,.3);
  --purple:   #a78bfa;
  --green:    #34d399;
  --green-l:  rgba(52,211,153,.1);
  --green-b:  rgba(52,211,153,.25);
  --red:      #f87171;
  --red-l:    rgba(248,113,113,.1);
  --red-b:    rgba(248,113,113,.25);
}

/* background mesh */
.ac-root::before {
  content: '';
  position: fixed; inset: 0; z-index: 0;
  background:
    radial-gradient(ellipse 80% 50% at 10% 10%, rgba(37,99,235,.07) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 90% 90%, rgba(124,58,237,.06) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 50% 50%, rgba(37,99,235,.03) 0%, transparent 70%);
  pointer-events: none;
}

.ac-card {
  background: var(--surf);
  border: 1px solid var(--bd);
  border-radius: 24px;
  width: 100%; max-width: 440px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,.12);
  position: relative; z-index: 1;
}

/* ── banner ── */
.ac-banner {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #7c3aed 100%);
  padding: 28px 28px 24px;
  position: relative; overflow: hidden;
}
.ac-banner::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.14) 0%, transparent 55%);
  pointer-events: none;
}
.ac-banner-top {
  display: flex; align-items: center; gap: 14px;
  position: relative; z-index: 1; margin-bottom: 16px;
}
.ac-logo-tile {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(255,255,255,.2); border: 2px solid rgba(255,255,255,.3);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 18px; font-weight: 900;
  letter-spacing: -.04em; backdrop-filter: blur(8px);
}
.ac-brand { color: #fff; }
.ac-brand-name { font-size: 17px; font-weight: 800; letter-spacing: -.02em; }
.ac-brand-sub  { font-size: 12px; opacity: .75; font-weight: 500; }

/* step pills */
.ac-steps {
  display: flex; align-items: center; gap: 0;
  position: relative; z-index: 1;
}
.ac-step {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600; color: rgba(255,255,255,.55);
  transition: color .25s;
}
.ac-step.active { color: #fff; }
.ac-step.done   { color: rgba(255,255,255,.8); }
.ac-step-num {
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  background: rgba(255,255,255,.15);
  border: 1.5px solid rgba(255,255,255,.25);
  transition: .25s;
}
.ac-step.active .ac-step-num {
  background: #fff; color: #2563eb;
  border-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,.2);
}
.ac-step.done .ac-step-num {
  background: rgba(255,255,255,.25);
  border-color: rgba(255,255,255,.4);
  color: #fff;
}
.ac-step-div {
  width: 28px; height: 1.5px;
  background: rgba(255,255,255,.2); margin: 0 4px;
  flex-shrink: 0;
}

/* ── body ── */
.ac-body { padding: 28px; }

.ac-step-title { font-size: 20px; font-weight: 800; color: var(--t1); letter-spacing: -.03em; margin-bottom: 4px; }
.ac-step-desc  { font-size: 13px; color: var(--t3); margin-bottom: 22px; line-height: 1.5; }
.ac-step-desc strong { color: var(--t2); font-weight: 600; }

/* field */
.ac-field { margin-bottom: 14px; }
.ac-label { font-size: 12.5px; font-weight: 600; color: var(--t2); display: block; margin-bottom: 6px; }
.ac-label span { color: var(--red); margin-left: 2px; }
.ac-inp-wrap { position: relative; }
.ac-inp-ico {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: var(--t4); display: flex; align-items: center; pointer-events: none;
  transition: color .15s;
}
.ac-inp-wrap:focus-within .ac-inp-ico { color: var(--blue); }
.ac-inp {
  width: 100%; height: 46px;
  padding: 0 44px;
  border: 1.5px solid var(--bd); border-radius: 12px;
  background: var(--bg); color: var(--t1);
  font-size: 14px; font-family: inherit; font-weight: 500;
  outline: none; transition: .15s; box-sizing: border-box;
}
.ac-inp::placeholder { color: var(--t4); font-weight: 400; }
.ac-inp:focus {
  background: var(--surf);
  border-color: var(--blue);
  box-shadow: 0 0 0 3px var(--blue-l);
}
.ac-eye {
  position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: var(--t4);
  display: flex; align-items: center; padding: 2px; transition: color .15s;
}
.ac-eye:hover { color: var(--t2); }

/* otp inputs */
.ac-otp-row {
  display: grid;
  grid-template-columns: repeat(6, 42px);
  gap: 8px;
  justify-content: center;
  margin-bottom: 6px;
  width: 100%;
}
.ac-otp-box {
  width: 100%; height: 52px; border-radius: 10px;
  border: 1.5px solid var(--bd); background: var(--bg);
  text-align: center; font-size: 20px; font-weight: 800;
  color: var(--t1); font-family: 'JetBrains Mono', 'Fira Code', monospace;
  outline: none; transition: .15s; caret-color: var(--blue);
  padding: 0; box-sizing: border-box;
  -moz-appearance: textfield;
}
.ac-otp-box::-webkit-outer-spin-button,
.ac-otp-box::-webkit-inner-spin-button { -webkit-appearance: none; }
.ac-otp-box:focus {
  background: var(--surf); border-color: var(--blue);
  box-shadow: 0 0 0 3px var(--blue-l);
}
.ac-otp-box.filled {
  background: var(--blue-l); border-color: var(--blue-b);
  color: var(--blue);
}

/* resend */
.ac-resend {
  font-size: 12.5px; color: var(--t3); text-align: center; margin-top: 10px;
}
.ac-resend button {
  background: none; border: none; color: var(--blue); font-weight: 600;
  cursor: pointer; font-size: 12.5px; font-family: inherit; padding: 0;
  transition: opacity .15s;
}
.ac-resend button:hover { opacity: .75; }
.ac-resend button:disabled { color: var(--t4); cursor: default; opacity: 1; }

/* success note */
.ac-note {
  display: flex; align-items: flex-start; gap: 9px;
  padding: 11px 13px; border-radius: 10px; margin-bottom: 18px;
  font-size: 12.5px; line-height: 1.5;
}
.ac-note.green { background: var(--green-l); border: 1px solid var(--green-b); color: var(--green); }
.ac-note.blue  { background: var(--blue-l);  border: 1px solid var(--blue-b);  color: var(--blue); }
.ac-note-ico   { flex-shrink: 0; margin-top: 1px; }

/* submit button */
.ac-btn {
  width: 100%; height: 46px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #1d4ed8, #2563eb 55%, #7c3aed);
  color: #fff; font-size: 14px; font-weight: 700; font-family: inherit;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  gap: 7px; margin-top: 6px;
  box-shadow: 0 4px 14px rgba(37,99,235,.35);
  transition: opacity .15s, box-shadow .15s, transform .12s;
}
.ac-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(37,99,235,.45);
  transform: translateY(-1px);
}
.ac-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }
.ac-spin {
  width: 16px; height: 16px;
  border: 2.5px solid rgba(255,255,255,.35); border-top-color: #fff;
  border-radius: 50%; animation: ac-rot .65s linear infinite;
}
@keyframes ac-rot { to { transform: rotate(360deg); } }

.ac-footer {
  padding: 0 28px 22px;
  text-align: center; font-size: 12.5px; color: var(--t3);
}
.ac-footer a { color: var(--blue); font-weight: 600; text-decoration: none; }
.ac-footer a:hover { text-decoration: underline; }
`;

let _acIn = false;
const Styles = () => {
  useEffect(() => {
    if (_acIn) return;
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    _acIn = true;
  }, []);
  return null;
};

/* ─── HELPERS ────────────────────────────────────────────── */
const baseURL = "http://127.0.0.1:8000/users";

const STEPS = [
  { num: 1, label: "Email" },
  { num: 2, label: "Verify" },
  { num: 3, label: "Setup" },
];

function Field({ label, required, icon: Icon, type = "text", value, onChange, placeholder, maxLength }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="ac-field">
      <label className="ac-label">
        {label}{required && <span>*</span>}
      </label>
      <div className="ac-inp-wrap">
        <span className="ac-inp-ico"><Icon size={15} /></span>
        <input
          className="ac-inp"
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          style={isPassword ? { paddingRight: "42px" } : {}}
        />
        {isPassword && (
          <button className="ac-eye" type="button" onClick={() => setShow(s => !s)}>
            {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── OTP INPUT ──────────────────────────────────────────── */
function OTPInput({ value, onChange }) {
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleKey = (e, idx) => {
    const key = e.key;
    if (key === "Backspace") {
      const next = value.slice(0, idx) + value.slice(idx + 1);
      onChange(next);
      if (idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
      return;
    }
    if (!/^\d$/.test(key)) return;
    const next = value.slice(0, idx) + key + value.slice(idx + 1);
    onChange(next.slice(0, 6));
    if (idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  return (
    <div className="ac-otp-row">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          className={`ac-otp-box${d ? " filled" : ""}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onKeyDown={e => handleKey(e, i)}
          onChange={() => {}}
          onFocus={e => e.target.select()}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
const ActivateAccount = () => {
  const [step, setStep]       = useState(1);
  const [email, setEmail]     = useState("");
  const [otp, setOtp]         = useState("");
  const [name, setName]       = useState("");
  const [mobile, setMobile]   = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [dark, setDark]       = useState(
    () => document.documentElement.classList.contains("dark") ||
          document.body.classList.contains("dark") ||
          window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );

  /* sync dark with app theme */
  useEffect(() => {
    const check = () => setDark(
      document.documentElement.classList.contains("dark") ||
      document.body.classList.contains("dark")
    );
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    obs.observe(document.body,            { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  /* countdown for resend */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const startTimer = () => setResendTimer(30);

  const wrap = async (fn) => {
    setError("");
    setLoading(true);
    try { await fn(); }
    catch (err) { setError(err.response?.data?.error || "Something went wrong"); }
    finally { setLoading(false); }
  };

  const sendOTP = () => wrap(async () => {
    await axios.post(`${baseURL}/send-otp/`, { email });
    setStep(2);
    startTimer();
  });

  const resendOTP = () => wrap(async () => {
    await axios.post(`${baseURL}/send-otp/`, { email });
    startTimer();
    setOtp("");
  });

  const verifyOTP = () => wrap(async () => {
    await axios.post(`${baseURL}/verify-otp/`, { email, otp });
    setStep(3);
  });

  const activateAccount = () => wrap(async () => {
    await axios.post(`${baseURL}/register/`, { email, name, mobile, password });
    window.location.href = "/login";
  });

  const slideVariants = {
    enter:  { x: 32, opacity: 0 },
    center: { x: 0,  opacity: 1 },
    exit:   { x: -32, opacity: 0 },
  };

  return (
    <>
      <Styles />
      <div className={`ac-root${dark ? " dark" : ""}`}>
        <motion.div className="ac-card"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.38, ease: [0.25, 1, 0.35, 1] }}
        >
          {/* Banner */}
          <div className="ac-banner">
            <div className="ac-banner-top">
              <div className="ac-logo-tile">P</div>
              <div className="ac-brand">
                <div className="ac-brand-name">PUNDX</div>
                <div className="ac-brand-sub">Account Activation</div>
              </div>
            </div>

            {/* Step pills */}
            <div className="ac-steps">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.num}>
                  <div className={`ac-step ${step === s.num ? "active" : step > s.num ? "done" : ""}`}>
                    <div className="ac-step-num">
                      {step > s.num ? <FiCheckCircle size={12} /> : s.num}
                    </div>
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && <div className="ac-step-div" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Body */}
          <AnimatePresence mode="wait">
            <motion.div key={step} className="ac-body"
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.22, ease: [0.25, 1, 0.35, 1] }}
            >
              {/* Step 1 — Email */}
              {step === 1 && (
                <>
                  <div className="ac-step-title">Enter your email</div>
                  <div className="ac-step-desc">
                    We'll send a one-time password to verify your identity.
                  </div>
                  <Field
                    label="Email Address" required
                    icon={FiMail} type="email"
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </>
              )}

              {/* Step 2 — OTP */}
              {step === 2 && (
                <>
                  <div className="ac-step-title">Verify your email</div>
                  <div className="ac-step-desc">
                    Enter the 6-digit OTP sent to <strong>{email}</strong>
                  </div>
                  <div className="ac-note green">
                    <span className="ac-note-ico"><FiCheckCircle size={13} /></span>
                    OTP sent successfully. Check your inbox or spam folder.
                  </div>
                  <div className="ac-field">
                    <label className="ac-label">One-Time Password <span>*</span></label>
                    <OTPInput value={otp} onChange={setOtp} />
                  </div>
                  <div className="ac-resend">
                    Didn't receive it?{" "}
                    <button onClick={resendOTP} disabled={resendTimer > 0 || loading}>
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                    </button>
                  </div>
                </>
              )}

              {/* Step 3 — Details */}
              {step === 3 && (
                <>
                  <div className="ac-step-title">Complete your profile</div>
                  <div className="ac-step-desc">
                    Almost there — fill in your details to activate your account.
                  </div>
                  <div className="ac-note blue">
                    <span className="ac-note-ico"><FiShield size={13} /></span>
                    Email verified for <strong>{email}</strong>
                  </div>
                  <Field label="Full Name" required icon={FiUser}
                    value={name} onChange={e => setName(e.target.value)}
                    placeholder="...Darshan" />
                  <Field label="Mobile Number" required icon={FiPhone}
                    value={mobile} onChange={e => setMobile(e.target.value)}
                    placeholder="9876543210" maxLength={10} />
                  <Field label="Create Password" required icon={FiLock} type="password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters" />
                </>
              )}

              {/* Error */}
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontSize: 12.5, color: "#dc2626",
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: 8, padding: "9px 12px", marginBottom: 12,
                  }}
                >
                  {error}
                </motion.div>
              )}

              {/* CTA */}
              <motion.button className="ac-btn" disabled={loading}
                onClick={step === 1 ? sendOTP : step === 2 ? verifyOTP : activateAccount}
                whileHover={!loading ? { scale: 1.015 } : {}}
                whileTap={!loading ? { scale: 0.985 } : {}}
              >
                {loading
                  ? <div className="ac-spin" />
                  : step === 1 ? <><FiArrowRight size={15} /> Send OTP</>
                  : step === 2 ? <><FiShield size={15} /> Verify OTP</>
                  : <><FiCheckCircle size={15} /> Activate Account</>
                }
              </motion.button>
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <div className="ac-footer">
            Already have an account? <a href="/login">Sign in</a>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ActivateAccount;