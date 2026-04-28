import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTP, verifyOTP } from '../services/api';
import { useAuth } from '../context/AuthContext';

const roleOptions = [
  { value: 'farmer', label: 'Smallholder Farmer' },
  { value: 'aggregator', label: 'Mandi Oracle / Official' },
  { value: 'retailer', label: 'Consumer' },
  { value: 'consumer', label: 'Govt Auditor' },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, showToast } = useAuth();
  const [step, setStep] = useState('request');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', role: 'farmer', location: '', otp: '' });

  const requestOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await sendOTP(form);
      showToast('OTP sent. Demo code is 1234.');
      setStep('verify');
    } catch (error) {
      // Fallback to demo OTP when backend is unreachable or request fails
      console.warn('sendOTP failed, using demo fallback OTP:', error?.message || error);
      showToast('OTP sent (demo fallback). Demo code is 1234.');
      setStep('verify');
    } finally {
      setLoading(false);
    }
  };

  const demoUsers = {
    farmer: { id: 'demo-farmer', name: 'Demo Farmer', role: 'farmer', phone: '0000000001', location: 'Demo Village', wallet: '0xDEMO' },
    aggregator: { id: 'demo-agg', name: 'Demo Aggregator', role: 'aggregator', phone: '0000000002', location: 'Market', wallet: '0xDEMO' },
    retailer: { id: 'demo-ret', name: 'Demo Retailer', role: 'retailer', phone: '0000000003', location: 'Town', wallet: '0xDEMO' },
    consumer: { id: 'demo-cons', name: 'Demo Auditor', role: 'consumer', phone: '0000000004', location: 'City', wallet: '0xDEMO' },
  };

  const demoLogin = (role) => {
    const user = demoUsers[role] || demoUsers.farmer;
    const token = 'demo-token-' + role;
    login(token, user);
    showToast(`Logged in as ${user.name}`);
    navigate('/dashboard', { replace: true });
  };

  const completeLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await verifyOTP({ phone: form.phone, otp: form.otp });
      login(data.token, data.user);
      showToast(`Welcome back, ${data.user.name}`);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      showToast(error.response?.data?.error || 'OTP verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page center-frame">
      <div className="hero-layout" style={{ minHeight: 'calc(100vh - 40px)' }}>
        <div className="hero-copy animate-in">
          <div className="eyebrow">Secure access</div>
          <h1 className="hero-title">Login with <span>OTP</span>.</h1>
          <p className="hero-subtitle">The demo flow keeps authentication simple while still issuing a JWT session for backend-protected routes.</p>
        </div>
        <form className="glass-card animate-in" onSubmit={step === 'request' ? requestOtp : completeLogin} style={{ padding: 24 }}>
          <div className="stack">
            <div className="section-head">
              <div>
                <h2 className="section-title">{step === 'request' ? 'Request OTP' : 'Verify OTP'}</h2>
                <p className="muted">{step === 'request' ? 'Enter your details to receive the demo code 1234.' : 'Enter the 4-digit code to complete sign-in.'}</p>
              </div>
            </div>

            {step === 'request' ? (
              <>
                <div className="field-grid">
                  <label>Name<input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
                  <label>Phone<input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></label>
                  <label>Role
                    <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                  <label>Location<input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
                </div>
                <button className="button" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
              </>
            ) : (
              <>
                <div className="surface" style={{ padding: 14 }}>
                  Demo OTP: <strong>1234</strong>
                </div>
                <label>OTP
                  <input className="input" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} maxLength={4} required />
                </label>
                <div className="button-row">
                  <button className="button-secondary" type="button" onClick={() => setStep('request')}>Back</button>
                  <button className="button" type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify & enter'}</button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}