// ============================================
// AgriChain ZK — Main Application
// ============================================

const App = {
  currentScreen: null,
  currentRole: null,
  currentUser: null,
  currentTab: null,
  navTabs: {},

  navTo(role, tab) {
    this.currentTab = tab;
    const navItems = document.querySelectorAll('#bottom-nav .nav-item');
    navItems.forEach((n, i) => {
      n.classList.remove('active');
      if (n.getAttribute('data-tab') === tab) n.classList.add('active');
    });
    const tabMap = {
      farmer: { home: () => Screens.farmer(), batches: TabContent.farmer_batches, analytics: TabContent.farmer_analytics, settings: () => TabContent.settings('farmer') },
      aggregator: { home: () => Screens.aggregator(), buy: TabContent.agg_buy, ship: TabContent.agg_ship, settings: () => TabContent.settings('aggregator') },
      retailer: { home: () => Screens.retailer(), stock: TabContent.ret_stock, sales: TabContent.ret_sales, settings: () => TabContent.settings('retailer') },
      consumer: { home: () => Screens.consumer(), scan: TabContent.con_scan, history: TabContent.con_history, settings: () => TabContent.settings('consumer') },
    };
    if (tabMap[role]?.[tab]) tabMap[role][tab]();
  },

  async init() {
    await window.agriChain.init(SEED_TRANSACTIONS);
    this.showScreen('splash');
    setTimeout(() => this.showScreen('login'), 2500);
  },

  showScreen(name, data) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + name);
    if (el) { el.classList.add('active'); this.currentScreen = name; }
    // Hide nav on splash/login
    if (name === 'splash' || name === 'login') {
      document.getElementById('bottom-nav').style.display = 'none';
    }
    if (Screens[name]) Screens[name](data);
  },

  showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.className = 'toast toast-' + type + ' show';
    t.innerHTML = (type === 'success' ? '✅' : '❌') + ' ' + msg;
    setTimeout(() => t.classList.remove('show'), 3000);
  },

  setRole(role) {
    this.currentRole = role;
    if (role === 'farmer') this.currentUser = FARMERS[0];
    else if (role === 'aggregator') this.currentUser = AGGREGATORS[0];
    else if (role === 'retailer') this.currentUser = RETAILERS[0];
    else this.currentUser = { name: 'Consumer', avatar: '📱' };
  }
};

// ============================================
// Screen Renderers
// ============================================
const Screens = {};

// --- SPLASH ---
Screens.splash = () => {
  const c = document.getElementById('splash-particles');
  c.innerHTML = '';
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'splash-particle';
    p.style.cssText = `left:${Math.random()*100}%;top:${30+Math.random()*60}%;animation-delay:${Math.random()*3}s;animation-duration:${2+Math.random()*2}s;background:${['var(--accent-green)','var(--accent-cyan)','var(--accent-amber)'][i%3]}`;
    c.appendChild(p);
  }
};

// --- LOGIN ---
Screens.login = () => {
  const grid = document.getElementById('role-grid');
  grid.innerHTML = '';
  const roles = [
    { key: 'farmer', icon: '🌾', name: 'Farmer', desc: 'Create & track batches' },
    { key: 'aggregator', icon: '📦', name: 'Aggregator', desc: 'Buy & distribute produce' },
    { key: 'retailer', icon: '🏪', name: 'Retailer', desc: 'Sell & generate QR' },
    { key: 'consumer', icon: '📱', name: 'Consumer', desc: 'Scan & verify origin' },
  ];
  roles.forEach(r => {
    const card = document.createElement('div');
    card.className = 'glass-card role-card ripple';
    card.setAttribute('data-role', r.key);
    card.innerHTML = `<div class="role-icon">${r.icon}</div><div class="role-name">${r.name}</div><div class="role-desc">${r.desc}</div>`;
    card.onclick = () => { App.setRole(r.key); App.showScreen(r.key); };
    grid.appendChild(card);
  });
};

// --- FARMER DASHBOARD ---
Screens.farmer = () => {
  const u = App.currentUser;
  const batches = getBatchesForFarmer(u.id);
  const totalRevenue = batches.reduce((s, b) => s + (b.farmerPrice * b.quantity), 0);
  const sold = batches.filter(b => b.status === 'SOLD' || b.status === 'AT_RETAILER').length;

  document.getElementById('farmer-content').innerHTML = `
    <div class="welcome-banner fade-slide-up">
      <div class="flex items-center gap-3 mb-2">
        <div class="avatar avatar-green">${u.avatar}</div>
        <div><div class="profile-name">${u.name}</div><div class="profile-wallet font-mono text-xs text-tertiary">${u.wallet}</div></div>
      </div>
      <p class="text-sm text-secondary">📍 ${u.location}, Odisha</p>
    </div>

    <div class="stats-row stagger-children">
      <div class="glass-card stat-card"><div class="stat-icon" style="background:var(--accent-green-dim);color:var(--accent-green)">📦</div><div class="stat-value text-green">${batches.length}</div><div class="stat-label">Batches</div></div>
      <div class="glass-card stat-card"><div class="stat-icon" style="background:var(--accent-amber-dim);color:var(--accent-amber)">💰</div><div class="stat-value text-amber">${sold}</div><div class="stat-label">Sold</div></div>
      <div class="glass-card stat-card"><div class="stat-icon" style="background:var(--accent-cyan-dim);color:var(--accent-cyan)">📊</div><div class="stat-value text-cyan">${formatCurrency(totalRevenue)}</div><div class="stat-label">Revenue</div></div>
    </div>

    <div>
      <div class="flex justify-between items-center mb-3">
        <h3 class="section-title" style="margin:0">My Batches</h3>
        <button class="btn btn-sm btn-primary" onclick="openCreateBatch()">+ New</button>
      </div>
      <div class="batch-list stagger-children">${batches.map(batchCardHTML).join('')}</div>
    </div>
  `;
  setupNav('farmer', [{icon:'🏠',label:'Home',tab:'home'},{icon:'📦',label:'Batches',tab:'batches'},{icon:'📊',label:'Analytics',tab:'analytics'},{icon:'⚙️',label:'Settings',tab:'settings'}]);
};

// --- AGGREGATOR DASHBOARD ---
Screens.aggregator = () => {
  const u = App.currentUser;
  const batches = getBatchesForAggregator(u.id);
  const available = BATCHES.filter(b => b.status === 'HARVESTED' && !b.aggregatorId);

  document.getElementById('aggregator-content').innerHTML = `
    <div class="welcome-banner fade-slide-up" style="background:linear-gradient(135deg,rgba(0,229,255,0.1),rgba(0,230,118,0.05));border-color:rgba(0,229,255,0.15)">
      <div class="flex items-center gap-3 mb-2">
        <div class="avatar avatar-cyan">${u.avatar}</div>
        <div><div class="profile-name">${u.name}</div><div class="text-xs text-secondary">${u.type} • ${u.location}</div></div>
      </div>
    </div>

    <div class="stats-row stagger-children">
      <div class="glass-card stat-card"><div class="stat-value text-cyan">${batches.length}</div><div class="stat-label">Inventory</div></div>
      <div class="glass-card stat-card"><div class="stat-value text-amber">${available.length}</div><div class="stat-label">Available</div></div>
      <div class="glass-card stat-card"><div class="stat-value text-green">${batches.filter(b=>b.retailerId).length}</div><div class="stat-label">Shipped</div></div>
    </div>

    ${available.length > 0 ? `<div><h3 class="section-title">🟢 Available to Buy</h3><div class="batch-list stagger-children">${available.map(b => batchCardHTML(b, true)).join('')}</div></div>` : ''}

    <div>
      <h3 class="section-title">📦 My Inventory</h3>
      <div class="batch-list stagger-children">${batches.map(batchCardHTML).join('')}</div>
    </div>
  `;
  setupNav('aggregator', [{icon:'🏠',label:'Home',tab:'home'},{icon:'📥',label:'Buy',tab:'buy'},{icon:'📤',label:'Ship',tab:'ship'},{icon:'⚙️',label:'Settings',tab:'settings'}]);
};

// --- RETAILER DASHBOARD ---
Screens.retailer = () => {
  const u = App.currentUser;
  const batches = getBatchesForRetailer(u.id);

  document.getElementById('retailer-content').innerHTML = `
    <div class="welcome-banner fade-slide-up" style="background:linear-gradient(135deg,rgba(255,215,64,0.1),rgba(0,230,118,0.05));border-color:rgba(255,215,64,0.15)">
      <div class="flex items-center gap-3 mb-2">
        <div class="avatar avatar-amber">${u.avatar}</div>
        <div><div class="profile-name">${u.name}</div><div class="text-xs text-secondary">${u.type} • ${u.location}</div></div>
      </div>
    </div>

    <div class="stats-row stagger-children">
      <div class="glass-card stat-card"><div class="stat-value text-amber">${batches.length}</div><div class="stat-label">Products</div></div>
      <div class="glass-card stat-card"><div class="stat-value text-green">${batches.filter(b=>b.status==='SOLD').length}</div><div class="stat-label">Sold</div></div>
      <div class="glass-card stat-card"><div class="stat-value text-cyan">${formatCurrency(batches.reduce((s,b)=>s+(b.retailPrice||0)*b.quantity,0))}</div><div class="stat-label">Revenue</div></div>
    </div>

    <div>
      <h3 class="section-title">🏪 My Products</h3>
      <div class="batch-list stagger-children">${batches.map(b => retailerBatchHTML(b)).join('')}</div>
    </div>
  `;
  setupNav('retailer', [{icon:'🏠',label:'Home',tab:'home'},{icon:'📦',label:'Stock',tab:'stock'},{icon:'📊',label:'Sales',tab:'sales'},{icon:'⚙️',label:'Settings',tab:'settings'}]);
};

// --- CONSUMER TRACE ---
Screens.consumer = () => {
  document.getElementById('consumer-content').innerHTML = `
    <div style="padding:var(--space-8) var(--content-padding);text-align:center" class="fade-slide-up">
      <div style="font-size:48px;margin-bottom:var(--space-4)">🔍</div>
      <h2 style="font-family:var(--font-display);font-size:var(--text-2xl);font-weight:700;margin-bottom:var(--space-2)">Trace Your Food</h2>
      <p class="text-secondary text-sm" style="margin-bottom:var(--space-6)">Enter a Batch ID to see its complete farm-to-fork journey</p>
      <div class="flex gap-3" style="margin-bottom:var(--space-4)">
        <input id="trace-input" class="input-field flex-1" placeholder="e.g. BATCH-001" value="BATCH-001">
        <button class="btn btn-primary" onclick="traceSearch()">Trace</button>
      </div>
      <div class="section-subtitle" style="margin-top:var(--space-6)">Quick Demo</div>
      <div class="flex gap-2 flex-wrap justify-center">${BATCHES.filter(b=>b.retailerId).map(b=>`<button class="btn btn-sm btn-secondary" onclick="document.getElementById('trace-input').value='${b.id}';traceSearch()">${getCropEmoji(b.crop)} ${b.id}</button>`).join('')}</div>
    </div>
    <div id="trace-result"></div>
  `;
  setupNav('consumer', [{icon:'🏠',label:'Home',tab:'home'},{icon:'🔍',label:'Scan',tab:'scan'},{icon:'📜',label:'History',tab:'history'},{icon:'⚙️',label:'Settings',tab:'settings'}]);
};

// ============================================
// Trace Search (Consumer)
// ============================================
async function traceSearch() {
  const id = document.getElementById('trace-input').value.trim().toUpperCase();
  const batch = getBatch(id);
  const result = document.getElementById('trace-result');
  if (!batch) { result.innerHTML = '<div class="empty-state"><div class="empty-icon">🔎</div><div class="empty-text">Batch not found. Try BATCH-001</div></div>'; return; }

  const farmer = getFarmer(batch.farmerId);
  const agg = getAggregator(batch.aggregatorId);
  const ret = getRetailer(batch.retailerId);
  const txs = await window.agriChain.getTransactionsByBatch(id);
  const farmerShare = calcFarmerShare(batch);

  result.innerHTML = `
    <div style="padding:0 var(--content-padding)" class="stagger-children">
      <!-- Batch Header -->
      <div class="glass-card glow-green" style="padding:var(--space-5)">
        <div class="flex items-center gap-3 mb-4">
          <div style="font-size:36px">${getCropEmoji(batch.crop)}</div>
          <div>
            <div class="font-display weight-bold text-xl">${batch.crop} — ${batch.variety}</div>
            <div class="font-mono text-xs text-tertiary">${batch.id}</div>
          </div>
        </div>
        <div class="grid-2 gap-3">
          <div><span class="text-xs text-secondary">Quantity</span><div class="weight-semibold">${batch.quantity} ${batch.unit}</div></div>
          <div><span class="text-xs text-secondary">Quality</span><div class="weight-semibold"><span class="badge badge-green">${batch.quality}</span></div></div>
          <div><span class="text-xs text-secondary">Harvest</span><div class="weight-semibold">${formatDate(batch.harvestDate)}</div></div>
          <div><span class="text-xs text-secondary">Status</span><div class="weight-semibold"><span class="badge badge-${BATCH_STATUS[batch.status].color}">${BATCH_STATUS[batch.status].icon} ${BATCH_STATUS[batch.status].label}</span></div></div>
        </div>
        ${batch.certifications.length ? `<div class="flex gap-2 flex-wrap" style="margin-top:var(--space-3)">${batch.certifications.map(c=>`<span class="badge badge-cyan">✓ ${c}</span>`).join('')}</div>` : ''}
      </div>

      <!-- Farmer Story -->
      ${farmer ? `<div class="glass-card farmer-story">
        <div class="farmer-story-avatar">${farmer.avatar}</div>
        <div class="farmer-story-info">
          <div class="farmer-story-name">${farmer.name}</div>
          <div class="farmer-story-location">📍 ${farmer.location}, Odisha</div>
          <div class="text-xs text-secondary" style="margin-top:4px">Grows: ${farmer.crops.map(c=>getCropEmoji(c)+' '+c).join(', ')}</div>
        </div>
      </div>` : ''}

      <!-- Supply Chain Timeline -->
      <div class="glass-card" style="padding:var(--space-5)">
        <h3 class="section-title">📍 Supply Chain Journey</h3>
        <div class="timeline">
          <div class="timeline-item">
            <div class="tl-title">🌱 Harvested</div>
            <div class="tl-meta">${farmer?.name} • ${batch.location}</div>
            <div class="tl-detail">${formatDate(batch.harvestDate)} • ${formatCurrency(batch.farmerPrice)}/${batch.unit}</div>
          </div>
          ${agg ? `<div class="timeline-item">
            <div class="tl-title">📦 Aggregated</div>
            <div class="tl-meta">${agg.name} • ${agg.location}</div>
            <div class="tl-detail">Bought at ${formatCurrency(batch.aggregatorPrice)}/${batch.unit}</div>
          </div>` : ''}
          ${ret ? `<div class="timeline-item">
            <div class="tl-title">🏪 Retail</div>
            <div class="tl-meta">${ret.name} • ${ret.location}</div>
            <div class="tl-detail">Retail price: ${formatCurrency(batch.retailPrice)}/${batch.unit}</div>
          </div>` : ''}
          ${batch.status === 'SOLD' ? `<div class="timeline-item"><div class="tl-title">✅ Sold to Consumer</div><div class="tl-meta">Verified on blockchain</div></div>` : ''}
        </div>
      </div>

      <!-- Price Breakdown -->
      ${batch.retailPrice ? `<div class="glass-card" style="padding:var(--space-5)">
        <h3 class="section-title">💰 Price Transparency</h3>
        <div class="price-bar-container">
          <div class="price-bar">
            <div class="segment-farmer" style="width:${farmerShare}%"></div>
            <div class="segment-aggregator" style="width:${batch.aggregatorPrice?Math.round(((batch.aggregatorPrice-batch.farmerPrice)/batch.retailPrice)*100):0}%"></div>
            <div class="segment-retailer" style="width:${100-farmerShare-(batch.aggregatorPrice?Math.round(((batch.aggregatorPrice-batch.farmerPrice)/batch.retailPrice)*100):0)}%"></div>
          </div>
          <div class="price-legend">
            <div class="price-legend-item"><div class="price-legend-dot" style="background:var(--accent-green)"></div>Farmer ${farmerShare}%</div>
            <div class="price-legend-item"><div class="price-legend-dot" style="background:var(--accent-cyan)"></div>Aggregator ${batch.aggregatorPrice?Math.round(((batch.aggregatorPrice-batch.farmerPrice)/batch.retailPrice)*100):0}%</div>
            <div class="price-legend-item"><div class="price-legend-dot" style="background:var(--accent-amber)"></div>Retailer ${100-farmerShare-(batch.aggregatorPrice?Math.round(((batch.aggregatorPrice-batch.farmerPrice)/batch.retailPrice)*100):0)}%</div>
          </div>
        </div>
        <div class="grid-3 gap-3" style="margin-top:var(--space-4)">
          <div class="text-center"><div class="text-xs text-secondary">Farmer</div><div class="weight-bold text-green">${formatCurrency(batch.farmerPrice)}</div></div>
          <div class="text-center"><div class="text-xs text-secondary">Aggregator</div><div class="weight-bold text-cyan">${formatCurrency(batch.aggregatorPrice)}</div></div>
          <div class="text-center"><div class="text-xs text-secondary">Retail</div><div class="weight-bold text-amber">${formatCurrency(batch.retailPrice)}</div></div>
        </div>
      </div>` : ''}

      <!-- Blockchain Proof -->
      <div class="glass-card" style="padding:var(--space-5)">
        <h3 class="section-title">⛓️ Blockchain Verification</h3>
        <div class="verify-badge glow-pulse" style="margin-bottom:var(--space-4)">✅ Verified on AgriChain • ${txs.length} transactions</div>
        <div class="chain-visual" style="margin-bottom:var(--space-4)">${txs.map((tx,i)=>`<div class="chain-block block-confirm" style="animation-delay:${i*100}ms">#${tx.blockIndex}</div>${i<txs.length-1?'<div class="chain-link">→</div>':''}`).join('')}</div>
        <div class="flex flex-col gap-2">${txs.map(tx=>`<div class="flex items-center gap-2"><div class="tx-hash flex-1">${shortHash(tx.hash)}</div><span class="text-xs text-secondary">${tx.data.type}</span></div>`).join('')}</div>
      </div>
      <div style="height:var(--space-8)"></div>
    </div>
  `;
}

// ============================================
// Helpers
// ============================================
function batchCardHTML(batch, showBuy) {
  const status = BATCH_STATUS[batch.status];
  return `<div class="glass-card batch-card" onclick="showBatchDetail('${batch.id}')">
    <div class="batch-header"><div><div class="batch-crop">${getCropEmoji(batch.crop)} ${batch.crop}</div><div class="batch-id">${batch.id}</div></div><span class="badge badge-${status.color}">${status.icon} ${status.label}</span></div>
    <div class="batch-details">
      <div class="batch-detail-item"><span class="batch-detail-label">Quantity</span><span class="batch-detail-value">${batch.quantity} ${batch.unit}</span></div>
      <div class="batch-detail-item"><span class="batch-detail-label">Quality</span><span class="batch-detail-value">${batch.quality}</span></div>
      <div class="batch-detail-item"><span class="batch-detail-label">Price</span><span class="batch-detail-value text-green">${formatCurrency(batch.farmerPrice)}/${batch.unit}</span></div>
      <div class="batch-detail-item"><span class="batch-detail-label">Location</span><span class="batch-detail-value">${batch.location}</span></div>
    </div>
    ${showBuy ? `<button class="btn btn-sm btn-primary btn-full" onclick="event.stopPropagation();buyBatch('${batch.id}')">Buy This Batch</button>` : ''}
  </div>`;
}

function retailerBatchHTML(batch) {
  const status = BATCH_STATUS[batch.status];
  return `<div class="glass-card batch-card">
    <div class="batch-header"><div><div class="batch-crop">${getCropEmoji(batch.crop)} ${batch.crop}</div><div class="batch-id">${batch.id}</div></div><span class="badge badge-${status.color}">${status.icon} ${status.label}</span></div>
    <div class="batch-details">
      <div class="batch-detail-item"><span class="batch-detail-label">Qty</span><span class="batch-detail-value">${batch.quantity} ${batch.unit}</span></div>
      <div class="batch-detail-item"><span class="batch-detail-label">Retail Price</span><span class="batch-detail-value text-amber">${formatCurrency(batch.retailPrice)}/${batch.unit}</span></div>
    </div>
    <div class="flex gap-2">
      <button class="btn btn-sm btn-secondary flex-1" onclick="generateQR('${batch.id}')">📱 QR Label</button>
      <button class="btn btn-sm btn-outline flex-1" onclick="document.getElementById('trace-input')||0;App.setRole('consumer');App.showScreen('consumer');setTimeout(()=>{document.getElementById('trace-input').value='${batch.id}';traceSearch()},100)">🔍 Trace</button>
    </div>
  </div>`;
}

function setupNav(role, items) {
  const nav = document.getElementById('bottom-nav');
  nav.innerHTML = items.map((item, i) => `<div class="nav-item ${i===0?'active':''}" data-tab="${item.tab}" onclick="App.navTo('${role}','${item.tab}')"><span class="nav-icon">${item.icon}</span><span class="nav-label">${item.label}</span></div>`).join('') + `<div class="nav-item" onclick="App.showScreen('login')"><span class="nav-icon">🚪</span><span class="nav-label">Logout</span></div>`;
  nav.style.display = 'flex';
}

// ============================================
// Actions
// ============================================
function openCreateBatch() {
  const modal = document.getElementById('modal-overlay');
  modal.classList.add('active');
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-handle"></div>
    <h3 class="section-title">🌾 Create New Batch</h3>
    <div class="flex flex-col gap-4">
      <div class="input-group"><label>Crop</label><select class="input-field" id="new-crop">${CROPS.map(c=>`<option>${c}</option>`).join('')}</select></div>
      <div class="input-group"><label>Quantity (kg)</label><input class="input-field" type="number" id="new-qty" placeholder="500" value="250"></div>
      <div class="input-group"><label>Quality Grade</label><select class="input-field" id="new-quality">${QUALITY_GRADES.map(g=>`<option>${g}</option>`).join('')}</select></div>
      <div class="input-group"><label>Expected Price (₹/kg)</label><input class="input-field" type="number" id="new-price" placeholder="30" value="35"></div>
      <button class="btn btn-primary btn-full btn-lg" onclick="createBatch()">📦 Create & Record on Chain</button>
    </div>`;
}

async function createBatch() {
  const crop = document.getElementById('new-crop').value;
  const qty = parseInt(document.getElementById('new-qty').value);
  const quality = document.getElementById('new-quality').value;
  const price = parseInt(document.getElementById('new-price').value);
  const id = 'BATCH-' + String(BATCHES.length + 1).padStart(3, '0');
  const newBatch = { id, crop, variety: '', quantity: qty, unit: 'kg', quality, farmerId: App.currentUser.id, aggregatorId: null, retailerId: null, status: 'HARVESTED', farmerPrice: price, aggregatorPrice: null, retailPrice: null, harvestDate: new Date().toISOString().split('T')[0], location: App.currentUser.location, certifications: [] };
  BATCHES.push(newBatch);
  await window.agriChain.addBlock({ type: 'CREATE_BATCH', batchId: id, crop, quantity: qty, quality, actor: App.currentUser.name, role: 'Farmer', location: App.currentUser.location, price });
  document.getElementById('modal-overlay').classList.remove('active');
  App.showToast('Batch ' + id + ' recorded on blockchain!');
  Screens.farmer();
}

async function buyBatch(batchId) {
  const batch = getBatch(batchId);
  if (!batch) return;
  batch.aggregatorId = App.currentUser.id;
  batch.aggregatorPrice = Math.round(batch.farmerPrice * 1.35);
  batch.status = 'AGGREGATED';
  await window.agriChain.addBlock({ type: 'TRANSFER_TO_AGGREGATOR', batchId, actor: App.currentUser.name, role: 'Aggregator', from: getFarmer(batch.farmerId)?.name, price: batch.aggregatorPrice, location: App.currentUser.location });
  App.showToast('Batch ' + batchId + ' purchased & recorded on chain!');
  Screens.aggregator();
}

function generateQR(batchId) {
  const batch = getBatch(batchId);
  const modal = document.getElementById('modal-overlay');
  modal.classList.add('active');
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-handle"></div>
    <h3 class="section-title text-center">📱 QR Label</h3>
    <p class="text-center text-secondary text-sm mb-4">${getCropEmoji(batch.crop)} ${batch.crop} — ${batchId}</p>
    <div class="flex justify-center mb-4"><div id="qr-code" class="qr-container"></div></div>
    <p class="text-center text-xs text-tertiary">Scan to trace the complete farm-to-fork journey</p>
    <div class="flex flex-col gap-2 mt-4">
      <div class="verify-badge justify-center">✅ Blockchain Verified</div>
    </div>`;
  if (typeof QRCode !== 'undefined') {
    new QRCode(document.getElementById('qr-code'), { text: 'https://agrichain-zk.app/trace/' + batchId, width: 180, height: 180, colorDark: '#0A0E17', colorLight: '#ffffff' });
  } else {
    document.getElementById('qr-code').innerHTML = `<div style="width:180px;height:180px;display:flex;align-items:center;justify-content:center;background:#fff;color:#000;font-size:12px;text-align:center;border-radius:8px">QR: ${batchId}<br><small>agrichain-zk.app</small></div>`;
  }
}

function showBatchDetail(batchId) {
  // Switch to consumer trace view for this batch
  App.setRole(App.currentRole);
  App.showScreen('consumer');
  setTimeout(() => {
    document.getElementById('trace-input').value = batchId;
    traceSearch();
  }, 100);
}

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => App.init());
document.getElementById('modal-overlay')?.addEventListener('click', e => { if (e.target.id === 'modal-overlay') e.target.classList.remove('active'); });
