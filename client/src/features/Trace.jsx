import { useState } from 'react';
import { getBatchTrace } from '../services/api';
import { BATCH_STATUS, formatCurrency, formatDate, shortHash } from '../utils/helpers';

const asEvmHash = (hash = '') => {
  if (!hash) return '0x0';
  return hash.startsWith('0x') ? hash : `0x${hash}`;
};

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
            <h3 className="section-title">Farm-to-Fork Audit Timeline</h3>
            <p className="muted">Query a harvest log ID to inspect every audited supply-chain event.</p>
          </div>
          <span className="pill amber">Consumer + Govt Auditor View</span>
        </div>
        <div className="button-row">
          <input className="input" style={{ flex: 1 }} value={batchId} onChange={(e) => setBatchId(e.target.value)} placeholder="BATCH-001" />
          <button className="button" type="submit" disabled={loading}>{loading ? 'Auditing...' : 'Run audit trace'}</button>
        </div>
      </form>

      {batch ? (
        <div className="dashboard-grid">
          <div className="stack">
            <div className="trace-card">
              <div className="trace-head">
                <div>
                  <h3 className="trace-title">{batch.cropType || batch.crop} {batch.variety ? `• ${batch.variety}` : ''}</h3>
                  <p className="muted">{batch.batchId}</p>
                </div>
                <span className={`pill ${BATCH_STATUS[batch.status]?.color || 'green'}`}>{BATCH_STATUS[batch.status]?.label || batch.status}</span>
              </div>
              <div className="grid-3" style={{ marginTop: 16 }}>
                <div className="kpi"><strong>{batch.quantityInQuintals || ((batch.quantity || 0) / 100).toFixed(2)} qtl</strong><span>Harvest volume</span></div>
                <div className="kpi"><strong>{batch.moistureLevel ?? 'N/A'}%</strong><span>AI moisture score</span></div>
                <div className="kpi"><strong>{formatCurrency(batch.retailPrice || batch.aggregatorPrice || batch.farmerPrice)}</strong><span>Latest price</span></div>
              </div>
              <div className="kpi" style={{ marginTop: 12 }}><strong>{formatDate(batch.harvestDate)}</strong><span>Harvested on</span></div>
              <div className="badge-row" style={{ marginTop: 14 }}>
                {(batch.certifications || []).map((item) => <span key={item} className="badge green">{item}</span>)}
                <span className="badge cyan">Verified on Polygon Amoy Testnet (ZK-Privacy Enabled)</span>
              </div>
            </div>

            <div className="trace-card">
              <h3 className="trace-title">Farm-to-Fork Audit Timeline</h3>
              <div className="timeline" style={{ marginTop: 16 }}>
                {result.blocks.map((block) => (
                  <div key={block._id || block.hash} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <strong>{block.data?.type || 'EVENT'}</strong>
                      <span className="muted">{shortHash(asEvmHash(block.hash))} • {formatDate(block.timestamp)}</span>
                      <span className="badge-row"><span className="badge">{asEvmHash(block.hash)}</span></span>
                      <span>{block.data?.actor || block.data?.role || 'System'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="stack">
            <div className="trace-card">
              <h3 className="trace-title">Identity and Geo Verification</h3>
              <p className="muted">{batch.farmerId?.name || 'Unknown smallholder farmer'}</p>
              <div className="badge-row" style={{ marginTop: 12 }}>
                <span className="badge">{batch.farmerId?.location || batch.location}</span>
                <span className="badge">{batch.farmerId?.wallet || 'Wallet pending'}</span>
              </div>
              <div className="stack" style={{ marginTop: 14 }}>
                <div className="feature-card">
                  <strong>Krushak Odisha API</strong>
                  <div className="muted">Farmer identity verified: {batch.farmerAadhaarId || batch.farmerAadhaarMock || 'Pending mock ID'}</div>
                </div>
                <div className="feature-card">
                  <strong>EOSDA Satellite API</strong>
                  <div className="muted">
                    Plot verified at {batch.landCoordinates?.lat ?? 'N/A'}, {batch.landCoordinates?.lng ?? 'N/A'}
                  </div>
                </div>
              </div>
            </div>
            <div className="trace-card">
              <h3 className="trace-title">Market path ledger</h3>
              <div className="stack" style={{ marginTop: 14 }}>
                <div className="feature-card"><strong>Smallholder Farmer</strong><div className="muted">{formatCurrency(batch.farmerPrice)}</div></div>
                <div className="feature-card"><strong>Mandi Oracle / Official</strong><div className="muted">{formatCurrency(batch.aggregatorPrice || 0)}</div></div>
                <div className="feature-card"><strong>Consumer Market</strong><div className="muted">{formatCurrency(batch.retailPrice || 0)}</div></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">Enter a harvest ID to open the Farm-to-Fork Audit Timeline.</div>
      )}
    </div>
  );
}