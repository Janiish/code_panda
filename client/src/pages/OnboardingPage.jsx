import { useNavigate } from 'react-router-dom';

const cards = [
  { title: 'Smallholder Farmer', text: 'Log harvest data into The Farmer Node and publish the first audited block.', tone: 'green' },
  { title: 'Mandi Oracle / Official', text: 'Acquire harvest logs, verify oracle events, and push provenance updates.', tone: 'cyan' },
  { title: 'Consumer + Govt Auditor', text: 'Run a Farm-to-Fork Audit Timeline and inspect every ledger event.', tone: 'amber' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="page center-frame">
      <div className="stack" style={{ gap: 24 }}>
        <div className="section-head">
          <div>
            <div className="eyebrow">How it works</div>
            <h2 className="section-title" style={{ marginTop: 10 }}>A resilient path across the agri supply chain</h2>
          </div>
          <button className="button-secondary" type="button" onClick={() => navigate('/auth')}>Continue to login</button>
        </div>
        <div className="grid-3">
          {cards.map((card) => (
            <div key={card.title} className="feature-card animate-in">
              <div className="badge-row"><span className={`badge ${card.tone}`}>{card.title}</span></div>
              <p style={{ marginTop: 14 }}>{card.text}</p>
            </div>
          ))}
        </div>
        <div className="surface" style={{ padding: 20 }}>
          <strong style={{ fontFamily: 'var(--font-display)' }}>Built for live operations.</strong>
          <p className="muted" style={{ marginTop: 8 }}>The app keeps the backend flow demo-friendly with OTP login, JWT sessions, batch actions, and trace inspection.</p>
        </div>
      </div>
    </div>
  );
}