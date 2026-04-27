import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Modal from '../components/Modal';
import CreateBatch from '../features/CreateBatch';
import Trace from '../features/Trace';
import Settings from '../features/Settings';
import { useAuth } from '../context/AuthContext';
import { buyBatch, getAvailableBatches, getBatches, getChainStats, getRecentBlocks, getUsers, shipBatch, sellBatch } from '../services/api';
import { BATCH_STATUS, calcFarmerShare, formatCurrency, formatDate, getCropEmoji, shortHash } from '../utils/helpers';

const navItems = [
  { key: 'overview', label: 'Overview' },
  { key: 'batches', label: 'Batches' },
  { key: 'trace', label: 'Trace' },
  { key: 'settings', label: 'Settings' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, showToast } = useAuth();
  const [activeView, setActiveView] = useState('overview');
  const [batches, setBatches] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [recentBlocks, setRecentBlocks] = useState([]);
  const [chainStats, setChainStats] = useState(null);
  const [retailers, setRetailers] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [shipTarget, setShipTarget] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [batchesRes, blocksRes, statsRes] = await Promise.all([
          getBatches(),
          getRecentBlocks(12),
          getChainStats(),
        ]);
        setBatches(batchesRes.data);
        setRecentBlocks(blocksRes.data);
        setChainStats(statsRes.data);

        if (user?.role === 'aggregator') {
          const [availableRes, retailersRes] = await Promise.all([getAvailableBatches(), getUsers('retailer')]);
          setAvailableBatches(availableRes.data);
          setRetailers(retailersRes.data);
        }
      } catch (error) {
        showToast(error.response?.data?.error || 'Unable to load dashboard data', 'error');
      }
    };

    if (user) {
      load();
    }
  }, [user, showToast]);

  const metrics = useMemo(() => {
    const own = batches.length;
    const harvested = batches.filter((batch) => batch.status === 'HARVESTED').length;
    const sold = batches.filter((batch) => batch.status === 'SOLD').length;
    const traceShare = batches.length ? Math.round(batches.reduce((sum, batch) => sum + calcFarmerShare(batch), 0) / batches.length) : 0;
    return { own, harvested, sold, traceShare };
  }, [batches]);

  if (!user) return <Navigate to="/auth" replace />;

  const refresh = async () => {
    const [batchesRes, blocksRes, statsRes] = await Promise.all([getBatches(), getRecentBlocks(12), getChainStats()]);
    setBatches(batchesRes.data);
    setRecentBlocks(blocksRes.data);
    setChainStats(statsRes.data);
    if (user.role === 'aggregator') {
      const [availableRes, retailersRes] = await Promise.all([getAvailableBatches(), getUsers('retailer')]);
      setAvailableBatches(availableRes.data);
      setRetailers(retailersRes.data);
    }
  };

  const withAction = async (action, successMessage) => {
    setLoadingAction(true);
    try {
      await action();
      await refresh();
      showToast(successMessage);
    } catch (error) {
      showToast(error.response?.data?.error || 'Action failed', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleBuy = (batch) => withAction(() => buyBatch(batch.batchId), `Purchased ${batch.batchId}`);
  const handleSell = (batch) => withAction(() => sellBatch(batch.batchId), `Sold ${batch.batchId}`);
  const handleShip = (batch) => {
    if (!shipTarget) {
      showToast('Select a retailer first', 'error');
      return;
    }
    return withAction(() => shipBatch(batch.batchId, shipTarget), `Shipped ${batch.batchId}`);
  };

  const title = {
    farmer: 'Farmer dashboard',
    aggregator: 'Aggregator dashboard',
    retailer: 'Retailer dashboard',
    consumer: 'Consumer dashboard',
  }[user.role] || 'Dashboard';

  const subtitle = {
    farmer: 'Harvest and provenance',
    aggregator: 'Purchase and logistics',
    retailer: 'Sell to consumers',
    consumer: 'Trace and verify',
  }[user.role] || 'Operations';

  return (
    <div className="page center-frame">
      <div className="shell">
        <aside className="sidebar surface animate-in">
          <div className="brand-block">
            <div className="brand-mark">A</div>
            <div className="brand-copy">
              <strong>AgriChain ZK</strong>
              <span className="muted">{user.role} mode</span>
            </div>
          </div>
          <div className="nav-list">
            {navItems.map((item) => (
              <button key={item.key} className={`nav-pill ${activeView === item.key ? 'active' : ''}`} onClick={() => setActiveView(item.key)} type="button">
                <span>{item.label}</span>
                <span>→</span>
              </button>
            ))}
          </div>
          <button className="button-secondary" type="button" onClick={() => navigate('/trace')}>Open trace page</button>
        </aside>

        <main className="shell-main">
          <NavBar title={title} subtitle={subtitle} actions={user.role === 'consumer' ? <button className="button-secondary" type="button" onClick={() => setActiveView('trace')}>Trace a batch</button> : null} />

          <div className="grid-4">
            <div className="metric-card animate-in"><div className="kpi"><strong>{metrics.own}</strong><span>My batches</span></div></div>
            <div className="metric-card animate-in"><div className="kpi"><strong>{metrics.harvested}</strong><span>Harvested</span></div></div>
            <div className="metric-card animate-in"><div className="kpi"><strong>{metrics.sold}</strong><span>Sold</span></div></div>
            <div className="metric-card animate-in"><div className="kpi"><strong>{chainStats?.totalBlocks || 0}</strong><span>Chain blocks</span></div></div>
          </div>

          {activeView === 'overview' && (
            <div className="dashboard-grid">
              <section className="dashboard-section animate-in">
                <div className="section-head">
                  <div>
                    <h2 className="section-title">{title}</h2>
                    <p className="muted">{subtitle}</p>
                  </div>
                  <span className="pill green">Verified JWT session</span>
                </div>
                <div className="stack">
                  {batches.slice(0, 4).map((batch) => (
                    <article key={batch._id} className="batch-card">
                      <div className="batch-head">
                        <div>
                          <h3 className="batch-title">{getCropEmoji(batch.crop)} {batch.crop}</h3>
                          <div className="muted">{batch.batchId} • {batch.location}</div>
                        </div>
                        <span className={`pill ${BATCH_STATUS[batch.status]?.color || 'green'}`}>{BATCH_STATUS[batch.status]?.label || batch.status}</span>
                      </div>
                      <div className="grid-3">
                        <div className="surface" style={{ padding: 14 }}><strong>{batch.quantity} kg</strong><div className="muted">Quantity</div></div>
                        <div className="surface" style={{ padding: 14 }}><strong>{formatCurrency(batch.farmerPrice)}</strong><div className="muted">Farmer price</div></div>
                        <div className="surface" style={{ padding: 14 }}><strong>{formatDate(batch.harvestDate)}</strong><div className="muted">Harvested</div></div>
                      </div>
                      <div className="button-row">
                        <button className="button-secondary" type="button" onClick={() => setSelectedBatch(batch)}>Inspect</button>
                        {user.role === 'aggregator' && batch.status === 'HARVESTED' && <button className="button" type="button" disabled={loadingAction} onClick={() => handleBuy(batch)}>Buy batch</button>}
                        {user.role === 'retailer' && batch.status === 'AT_RETAILER' && <button className="button" type="button" disabled={loadingAction} onClick={() => handleSell(batch)}>Sell batch</button>}
                      </div>
                    </article>
                  ))}
                  {batches.length === 0 && <div className="empty-state">No batches available yet.</div>}
                </div>
              </section>

              <aside className="stack">
                {user.role === 'farmer' && <CreateBatch onCreated={refresh} onNotify={showToast} />}
                {user.role === 'aggregator' && (
                  <div className="feature-card stack animate-in">
                    <div className="feature-head">
                      <div>
                        <h3 className="feature-title">Available batches</h3>
                        <p className="muted">Pick a harvested batch to enter the chain.</p>
                      </div>
                      <span className="pill cyan">{availableBatches.length} open</span>
                    </div>
                    <div className="stack">
                      {availableBatches.slice(0, 3).map((batch) => (
                        <div key={batch._id} className="surface" style={{ padding: 14 }}>
                          <strong>{batch.batchId}</strong>
                          <div className="muted">{batch.crop} • {batch.quantity} kg</div>
                          <div className="button-row" style={{ marginTop: 10 }}>
                            <button className="button" type="button" disabled={loadingAction} onClick={() => handleBuy(batch)}>Buy</button>
                            <button className="button-secondary" type="button" onClick={() => setSelectedBatch(batch)}>Inspect</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <label>
                      Retailer target
                      <select className="select" value={shipTarget} onChange={(e) => setShipTarget(e.target.value)}>
                        <option value="">Choose retailer</option>
                        {retailers.map((retailer) => <option key={retailer._id} value={retailer._id}>{retailer.name}</option>)}
                      </select>
                    </label>
                    <button className="button" type="button" disabled={loadingAction || !selectedBatch} onClick={() => selectedBatch && handleShip(selectedBatch)}>Ship selected batch</button>
                  </div>
                )}
                {user.role === 'consumer' && <Trace onNotify={showToast} />}
                {user.role === 'retailer' && <Settings onNotify={showToast} />}
              </aside>
            </div>
          )}

          {activeView === 'batches' && (
            <section className="dashboard-section animate-in">
              <div className="section-head">
                <div>
                  <h2 className="section-title">Batch inventory</h2>
                  <p className="muted">Full list scoped to your role.</p>
                </div>
              </div>
              <div className="stack">
                {batches.map((batch) => (
                  <div key={batch._id} className="batch-card">
                    <div className="batch-head">
                      <div>
                        <h3 className="batch-title">{getCropEmoji(batch.crop)} {batch.crop}</h3>
                        <div className="muted">{batch.batchId} • {batch.variety || 'No variety'} • {batch.location}</div>
                      </div>
                      <span className={`pill ${BATCH_STATUS[batch.status]?.color || 'green'}`}>{BATCH_STATUS[batch.status]?.label || batch.status}</span>
                    </div>
                    <div className="grid-4">
                      <div className="surface" style={{ padding: 14 }}><strong>{batch.quantity} kg</strong><div className="muted">Quantity</div></div>
                      <div className="surface" style={{ padding: 14 }}><strong>{formatCurrency(batch.farmerPrice)}</strong><div className="muted">Farmer</div></div>
                      <div className="surface" style={{ padding: 14 }}><strong>{formatCurrency(batch.retailPrice || batch.aggregatorPrice)}</strong><div className="muted">Market price</div></div>
                      <div className="surface" style={{ padding: 14 }}><strong>{calcFarmerShare(batch)}%</strong><div className="muted">Farmer share</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeView === 'trace' && <Trace onNotify={showToast} />}
          {activeView === 'settings' && <Settings onNotify={showToast} />}

          <section className="dashboard-section animate-in">
            <div className="section-head">
              <div>
                <h2 className="section-title">Recent chain blocks</h2>
                <p className="muted">Latest immutable records on the chain.</p>
              </div>
            </div>
            <div className="timeline">
              {recentBlocks.map((block) => (
                <div key={block._id || block.hash} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <strong>{block.data?.type || 'EVENT'}</strong>
                    <span className="muted">{shortHash(block.hash)} • {formatDate(block.timestamp)}</span>
                    <span>{block.data?.batchId}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Modal open={!!selectedBatch} title={selectedBatch ? selectedBatch.batchId : ''} onClose={() => setSelectedBatch(null)}>
        {selectedBatch && (
          <div className="stack">
            <p className="muted">{selectedBatch.crop} • {selectedBatch.quantity} kg • {selectedBatch.location}</p>
            <div className="grid-3">
              <div className="surface" style={{ padding: 14 }}><strong>{formatCurrency(selectedBatch.farmerPrice)}</strong><div className="muted">Farmer</div></div>
              <div className="surface" style={{ padding: 14 }}><strong>{formatCurrency(selectedBatch.aggregatorPrice || 0)}</strong><div className="muted">Aggregator</div></div>
              <div className="surface" style={{ padding: 14 }}><strong>{formatCurrency(selectedBatch.retailPrice || 0)}</strong><div className="muted">Retail</div></div>
            </div>
            <div className="button-row">
              <button className="button-secondary" type="button" onClick={() => navigate(`/trace/${selectedBatch.batchId}`)}>Open trace view</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}