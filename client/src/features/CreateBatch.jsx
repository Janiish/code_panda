import { useMemo, useState } from 'react';
import { createBatch } from '../services/api';
import { CROPS, QUALITY_GRADES } from '../utils/helpers';

const emptyForm = {
  crop: CROPS[0],
  variety: '',
  quantity: 100,
  quality: QUALITY_GRADES[1],
  farmerPrice: 0,
  location: '',
  certifications: '',
};

export default function CreateBatch({ onCreated, onNotify }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const parsedCertifications = useMemo(
    () => form.certifications.split(',').map((item) => item.trim()).filter(Boolean),
    [form.certifications],
  );

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        farmerPrice: Number(form.farmerPrice),
        certifications: parsedCertifications,
      };
      const { data } = await createBatch(payload);
      setForm(emptyForm);
      onCreated?.(data);
      onNotify?.('Batch created and written to the chain.');
    } catch (error) {
      onNotify?.(error.response?.data?.error || 'Unable to create batch', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="feature-card stack animate-in" onSubmit={submit}>
      <div className="feature-head">
        <div>
          <h3 className="feature-title">Create Batch</h3>
          <p className="muted">Record a harvest and push the first block.</p>
        </div>
        <span className="pill green">Farmer action</span>
      </div>
      <div className="field-grid">
        <label>
          Crop
          <select className="select" value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })}>
            {CROPS.map((crop) => <option key={crop}>{crop}</option>)}
          </select>
        </label>
        <label>
          Variety
          <input className="input" value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} placeholder="Basmati" />
        </label>
        <label>
          Quantity (kg)
          <input className="input" type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
        </label>
        <label>
          Quality
          <select className="select" value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })}>
            {QUALITY_GRADES.map((grade) => <option key={grade}>{grade}</option>)}
          </select>
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
        <button className="button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create batch'}</button>
        <button className="button-secondary" type="button" onClick={() => setForm(emptyForm)}>Reset</button>
      </div>
    </form>
  );
}