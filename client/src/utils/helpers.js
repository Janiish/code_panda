export const CROP_EMOJI = { Rice: '🌾', Onion: '🧅', Turmeric: '🟡', 'Red Chili': '🌶️', Tomato: '🍅', Potato: '🥔', Groundnut: '🥜', Mustard: '🌻' };
export const getCropEmoji = (c) => CROP_EMOJI[c] || '🌿';

export const BATCH_STATUS = {
  HARVESTED: { label: 'Harvested', color: 'green', icon: '🌱' },
  AGGREGATED: { label: 'Aggregated', color: 'cyan', icon: '📦' },
  IN_TRANSIT: { label: 'In Transit', color: 'amber', icon: '🚛' },
  AT_RETAILER: { label: 'At Retailer', color: 'purple', icon: '🏪' },
  SOLD: { label: 'Sold', color: 'green', icon: '✅' },
};

export const CROPS = ['Rice', 'Onion', 'Turmeric', 'Red Chili', 'Tomato', 'Potato', 'Groundnut', 'Mustard'];
export const QUALITY_GRADES = ['A+', 'A', 'B+', 'B'];

export const formatCurrency = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const shortHash = (h) => h ? h.substring(0, 8) + '...' + h.substring(h.length - 6) : '...';
export const calcFarmerShare = (b) => b.retailPrice ? Math.round((b.farmerPrice / b.retailPrice) * 100) : 100;
