import { useNavigate } from 'react-router-dom';

const cards = [
  { title: 'Farmer', text: 'Create harvest batches and publish the first block.', tone: 'green' },
  { title: 'Aggregator', text: 'Purchase available produce, ship to retailers, and keep the chain honest.', tone: 'cyan' },
  { title: 'Consumer', text: 'Search a batch ID and see every transaction in one timeline.', tone: 'amber' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="page center-frame">
      <div className="stack" style={{ gap: 24 }}>
        <div className="section-head">
          <div>
            <div className="eyebrow">How it works</div>
            <h2 className="section-title" style={{ marginTop: 10 }}>A simple path across the supply chain</h2>
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