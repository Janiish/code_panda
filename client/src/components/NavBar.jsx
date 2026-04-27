import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar({ title, subtitle, actions }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="surface topbar animate-in">
      <div>
        <div className="muted" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.74rem' }}>{subtitle}</div>
        <h2 className="section-title" style={{ marginTop: 6 }}>{title}</h2>
      </div>
      <div className="user-chip">
        <div className="avatar">{user?.avatar || '🌱'}</div>
        <div>
          <strong>{user?.name || 'AgriChain User'}</strong>
          <div className="muted" style={{ fontSize: '0.9rem' }}>{user?.role || 'guest'}</div>
        </div>
        <div className="button-row">
          {actions}
          <button className="button-ghost" type="button" onClick={() => navigate('/trace')}>
            Trace
          </button>
          <button className="button-danger" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}