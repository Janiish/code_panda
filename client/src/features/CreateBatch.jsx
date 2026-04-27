import { useMemo, useState } from 'react';
import { createBatch } from '../services/api';
import { CROPS } from '../utils/helpers';

const emptyForm = {
  cropType: CROPS[0],
  variety: '',
  quantityInQuintals: 0,
  moistureLevel: '',
  farmerAadhaarId: '',
  landCoordinates: { lat: '', lng: '' },
  farmerPrice: 0,
  location: '',
  certifications: '',
};

export default function CreateBatch({ onCreated, onNotify }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [syncingOracle, setSyncingOracle] = useState(false);

  const parsedCertifications = useMemo(
    () => form.certifications.split(',').map((item) => item.trim()).filter(Boolean),
    [form.certifications],
  );

  const syncOracleData = async () => {
    setSyncingOracle(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const moisture = (12 + Math.random() * 2).toFixed(1);
    const quantityInQuintals = (8 + Math.random() * 6).toFixed(2);
    const lat = (19.2 + Math.random() * 1.5).toFixed(6);
    const lng = (84.2 + Math.random() * 2.1).toFixed(6);
    const aadhaarSuffix = Math.floor(1000 + Math.random() * 9000);

    setForm((prev) => ({
      ...prev,
      moistureLevel: moisture,
      quantityInQuintals,
      farmerAadhaarId: `XXXX-XXXX-${aadhaarSuffix}`,
      landCoordinates: { lat, lng },
    }));

    setSyncingOracle(false);
    onNotify?.('AI assessment complete. IoT + oracle feed synced.');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.moistureLevel || !form.quantityInQuintals) {
      onNotify?.('Run AI Assessment & IoT Sync before submitting harvest data.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        cropType: form.cropType,
        quantityInQuintals: Number(form.quantityInQuintals),
        moistureLevel: Number(form.moistureLevel),
        farmerAadhaarId: form.farmerAadhaarId,
        landCoordinates: {
          lat: Number(form.landCoordinates.lat),
          lng: Number(form.landCoordinates.lng),
          source: 'EOSDA Satellite API (Mock)',
        },
        farmerPrice: Number(form.farmerPrice),
        variety: form.variety,
        location: form.location,
        certifications: parsedCertifications,
      };
      const { data } = await createBatch(payload);
      setForm(emptyForm);
      onCreated?.(data);
      onNotify?.('Harvest log submitted to Farmer Node and anchored on-chain.');
    } catch (error) {
      onNotify?.(error.response?.data?.error || 'Unable to log harvest data', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="feature-card stack animate-in" onSubmit={submit}>
      <div className="feature-head">
        <div>
          <h3 className="feature-title">Log Harvest Data</h3>
          <p className="muted">Farmer Node intake with Mandi Oracle verification.</p>
        </div>
        <span className="pill green">Smallholder Farmer</span>
      </div>

      <div className="surface" style={{ padding: 14 }}>
        <div className="button-row" style={{ justifyContent: 'space-between', gap: 12 }}>
          <strong>Mandi Oracle Controls</strong>
          <button className="button-secondary" type="button" onClick={syncOracleData} disabled={syncingOracle || saving}>
            {syncingOracle ? 'Running AI Scan...' : 'Run AI Assessment & IoT Sync'}
          </button>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>
          Bypassing manual data entry to prevent Katni-Chhatni fraud.
        </p>
      </div>

      <div className="field-grid">
        <label>
          Crop Type
          <select className="select" value={form.cropType} onChange={(e) => setForm({ ...form, cropType: e.target.value })}>
            {CROPS.map((crop) => <option key={crop}>{crop}</option>)}
          </select>
        </label>
        <label>
          Variety
          <input className="input" value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} placeholder="Basmati" />
        </label>
        <label>
          Quantity (Quintals) via IoT
          <input className="input" type="number" min="0" step="0.01" value={form.quantityInQuintals} readOnly placeholder="Run AI/IoT sync" />
        </label>
        <label>
          Moisture Level (%) via AI
          <input className="input" type="number" value={form.moistureLevel} readOnly placeholder="Run AI/IoT sync" />
        </label>
        <label>
          Farmer Aadhaar (Mock)
          <input className="input" value={form.farmerAadhaarId} readOnly placeholder="Auto-fetched from Krushak Odisha API" />
        </label>
        <label>
          Land Coordinates (Mock)
          <input className="input" value={form.landCoordinates.lat && form.landCoordinates.lng ? `${form.landCoordinates.lat}, ${form.landCoordinates.lng}` : ''} readOnly placeholder="Auto-fetched from EOSDA API" />
        </label>
        <label>
          Farmer price
          <input className="input" type="number" min="0" value={form.farmerPrice} onChange={(e) => setForm({ ...form, farmerPrice: e.target.value })} />
        </label>
        <label>
          Location
          <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Puri" />
        </label>
      </div>
      <label>
        Certifications
        <textarea className="textarea" value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} placeholder="Organic, Residue-Free" />
      </label>
      <div className="button-row">
        <button className="button" type="submit" disabled={saving || syncingOracle}>{saving ? 'Saving...' : 'Submit Harvest Log'}</button>
        <button className="button-secondary" type="button" onClick={() => setForm(emptyForm)}>Reset</button>
      </div>
    </form>
  );
}