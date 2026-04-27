import { useState } from 'react';
import { getBatchTrace } from '../services/api';
import { BATCH_STATUS, formatCurrency, formatDate, shortHash } from '../utils/helpers';

export default function Trace({ onNotify, initialBatchId = '' }) {
  const [batchId, setBatchId] = useState(initialBatchId);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (event) => {
    event.preventDefault();
    if (!batchId.trim()) return;
    setLoading(true);
    try {
      const { data } = await getBatchTrace(batchId.trim());
      setResult(data);
      onNotify?.(`Loaded trace for ${batchId.trim()}`);
    } catch (error) {
      setResult(null);
      onNotify?.(error.response?.data?.error || 'Batch not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const batch = result?.batch;

  return (
    <div className="stack animate-in">
      <form className="trace-card" onSubmit={search}>
        <div className="section-head">
          <div>
            <h3 className="section-title">Trace a batch</h3>
            <p className="muted">Search by batch ID to inspect the chain trail.</p>
          </div>
          <span className="pill amber">Consumer view</span>
        </div>
        <div className="button-row">
          <input className="input" style={{ flex: 1 }} value={batchId} onChange={(e) => setBatchId(e.target.value)} placeholder="BATCH-001" />
          <button className="button" type="submit" disabled={loading}>{loading ? 'Searching...' : 'Trace batch'}</button>
        </div>
      </form>

      {batch ? (
        <div className="dashboard-grid">
          <div className="stack">
            <div className="trace-card">
              <div className="trace-head">
                <div>
                  <h3 className="trace-title">{batch.crop} {batch.variety ? `• ${batch.variety}` : ''}</h3>
                  <p className="muted">{batch.batchId}</p>
                </div>
                <span className={`pill ${BATCH_STATUS[batch.status]?.color || 'green'}`}>{BATCH_STATUS[batch.status]?.label || batch.status}</span>
              </div>
              <div className="grid-3" style={{ marginTop: 16 }}>
                <div className="kpi"><strong>{batch.quantity} kg</strong><span>Quantity</span></div>
                <div className="kpi"><strong>{formatCurrency(batch.retailPrice || batch.aggregatorPrice || batch.farmerPrice)}</strong><span>Latest price</span></div>
                <div className="kpi"><strong>{formatDate(batch.harvestDate)}</strong><span>Harvested</span></div>
              </div>
              <div className="badge-row" style={{ marginTop: 14 }}>
                {(batch.certifications || []).map((item) => <span key={item} className="badge green">{item}</span>)}
              </div>
            </div>

            <div className="trace-card">
              <h3 className="trace-title">Chain blocks</h3>
              <div className="timeline" style={{ marginTop: 16 }}>
                {result.blocks.map((block) => (
                  <div key={block._id || block.hash} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <strong>{block.data?.type || 'EVENT'}</strong>
                      <span className="muted">{shortHash(block.hash)} • {formatDate(block.timestamp)}</span>
                      <span>{block.data?.actor || block.data?.role || 'System'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="stack">
            <div className="trace-card">
              <h3 className="trace-title">Producer</h3>
              <p className="muted">{batch.farmerId?.name || 'Unknown farmer'}</p>
              <div className="badge-row" style={{ marginTop: 12 }}>
                <span className="badge">{batch.farmerId?.location || batch.location}</span>
                <span className="badge">{batch.farmerId?.wallet || 'Wallet pending'}</span>
              </div>
            </div>
            <div className="trace-card">
              <h3 className="trace-title">Market path</h3>
              <div className="stack" style={{ marginTop: 14 }}>
                <div className="feature-card"><strong>Farmer</strong><div className="muted">{formatCurrency(batch.farmerPrice)}</div></div>
                <div className="feature-card"><strong>Aggregator</strong><div className="muted">{formatCurrency(batch.aggregatorPrice || 0)}</div></div>
                <div className="feature-card"><strong>Retail</strong><div className="muted">{formatCurrency(batch.retailPrice || 0)}</div></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">Search a batch ID to inspect the provenance trail.</div>
      )}
    </div>
  );
}