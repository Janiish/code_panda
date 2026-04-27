import { useAuth } from '../context/AuthContext';

export default function Settings({ onNotify }) {
  const { user } = useAuth();

  return (
    <div className="feature-card stack animate-in">
      <div className="feature-head">
        <div>
          <h3 className="feature-title">Settings</h3>
          <p className="muted">Profile and session controls.</p>
        </div>
        <span className="pill purple">Account</span>
      </div>
      <div className="grid-2">
        <div className="surface" style={{ padding: 16 }}>
          <strong>{user?.name}</strong>
          <div className="muted">{user?.phone}</div>
          <div className="muted">{user?.location || 'No location set'}</div>
        </div>
        <div className="surface" style={{ padding: 16 }}>
          <strong>{user?.role}</strong>
          <div className="muted">Wallet: {user?.wallet || 'Not generated'}</div>
          <div className="muted">Status: Verified access</div>
        </div>
      </div>
      <div className="button-row">
        <button className="button-secondary" type="button" onClick={() => onNotify?.('Profile sync is read-only in this build.')}>Sync profile</button>
        <button className="button-ghost" type="button" onClick={() => onNotify?.('Notifications are routed through in-app toast only.')}>Notification rules</button>
      </div>
    </div>
  );
}