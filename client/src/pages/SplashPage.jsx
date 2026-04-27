import { useNavigate } from 'react-router-dom';

export default function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="page center-frame">
      <div className="hero-layout">
        <div className="hero-copy animate-in">
          <div className="eyebrow">AgriChain ZK</div>
          <h1 className="hero-title">Farm provenance you can <span>verify</span>.</h1>
          <p className="hero-subtitle">
            A supply-chain command center for farmers, aggregators, retailers, and consumers. Track batches, record events on the chain, and make traceability visible end to end.
          </p>
          <div className="hero-actions">
            <button className="button" type="button" onClick={() => navigate('/onboarding')}>Explore flow</button>
            <button className="button-secondary" type="button" onClick={() => navigate('/auth')}>Sign in</button>
          </div>
          <div className="grid-3" style={{ marginTop: 18 }}>
            <div className="metric-card"><div className="kpi"><strong>4</strong><span>Role dashboards</span></div></div>
            <div className="metric-card"><div className="kpi"><strong>1 chain</strong><span>Single truth source</span></div></div>
            <div className="metric-card"><div className="kpi"><strong>ZK-ready</strong><span>Privacy-first path</span></div></div>
          </div>
        </div>
        <div className="glass-card animate-in" style={{ padding: 24 }}>
          <div className="stack">
            <div className="surface" style={{ padding: 18, background: 'linear-gradient(135deg, rgba(45,125,88,0.14), rgba(231,169,74,0.1))' }}>
              <div className="muted">Live chain snapshot</div>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Batch trail, validated.</strong>
            </div>
            <div className="surface" style={{ padding: 18 }}>
              <div className="badge-row">
                <span className="badge green">Harvested</span>
                <span className="badge cyan">Aggregated</span>
                <span className="badge amber">In Transit</span>
                <span className="badge purple">At Retailer</span>
              </div>
              <p className="muted" style={{ marginTop: 12 }}>
                Each movement creates an immutable block, making provenance and price transitions easy to audit.
              </p>
            </div>
            <div className="surface" style={{ padding: 18 }}>
              <div className="muted">Verified transaction flow</div>
              <div style={{ fontFamily: 'var(--font-mono)', marginTop: 10, lineHeight: 1.8 }}>
                create → buy → ship → sell
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}