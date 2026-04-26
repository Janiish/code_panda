// ============================================
// AgriChain ZK — Feature Tabs & Functional UI
// ============================================

// --- Tab Content Renderers ---
const TabContent = {
  // FARMER TABS
  farmer_batches: () => {
    const batches = getBatchesForFarmer(App.currentUser.id);
    setDashContent('farmer', `<h3 class="section-title">📦 All Batches</h3>
      <div class="tab-bar mb-4"><div class="tab-item active" onclick="filterBatches('all',this)">All</div><div class="tab-item" onclick="filterBatches('HARVESTED',this)">Harvested</div><div class="tab-item" onclick="filterBatches('SOLD',this)">Sold</div></div>
      <div id="filtered-batches" class="batch-list stagger-children">${batches.map(b=>batchCardHTML(b)).join('')}</div>`);
  },
  farmer_analytics: () => {
    const batches = getBatchesForFarmer(App.currentUser.id);
    const rev = batches.reduce((s,b)=>s+b.farmerPrice*b.quantity,0);
    const crops = {};
    batches.forEach(b => { crops[b.crop] = (crops[b.crop]||0) + b.quantity; });
    const maxQ = Math.max(...Object.values(crops), 1);
    setDashContent('farmer', `<h3 class="section-title">📊 Analytics</h3>
      <div class="glass-card p-4 mb-4"><div class="stat-label">Total Revenue</div><div class="stat-value text-green text-2xl">${formatCurrency(rev)}</div></div>
      <div class="glass-card p-4 mb-4"><div class="section-subtitle">Crop Distribution</div>
        ${Object.entries(crops).map(([c,q])=>`<div class="flex items-center gap-3 mb-2"><span style="width:80px" class="text-sm">${getCropEmoji(c)} ${c}</span><div style="flex:1;height:24px;background:var(--glass);border-radius:var(--radius-full);overflow:hidden"><div style="height:100%;width:${(q/maxQ)*100}%;background:var(--accent-green);border-radius:var(--radius-full);transition:width 0.5s"></div></div><span class="text-sm weight-bold">${q}kg</span></div>`).join('')}
      </div>
      <div class="glass-card p-4"><div class="section-subtitle">Price Comparison (₹/kg)</div>
        ${batches.map(b=>`<div class="flex items-center gap-3 mb-2"><span style="width:80px" class="text-xs font-mono">${b.id}</span><div style="flex:1;height:20px;background:var(--glass);border-radius:var(--radius-full);overflow:hidden;display:flex"><div style="height:100%;width:${b.retailPrice?(b.farmerPrice/b.retailPrice)*100:100}%;background:var(--accent-green);border-radius:var(--radius-full)"></div>${b.retailPrice?`<div style="height:100%;width:${((b.retailPrice-b.farmerPrice)/b.retailPrice)*100}%;background:var(--accent-amber)"></div>`:''}</div><span class="text-xs">${formatCurrency(b.farmerPrice)}</span></div>`).join('')}
        <div class="flex gap-4 mt-3"><div class="price-legend-item"><div class="price-legend-dot" style="background:var(--accent-green)"></div><span class="text-xs">Your Price</span></div><div class="price-legend-item"><div class="price-legend-dot" style="background:var(--accent-amber)"></div><span class="text-xs">Markup</span></div></div>
      </div>`);
  },

  // AGGREGATOR TABS
  agg_buy: () => {
    const available = BATCHES.filter(b => b.status === 'HARVESTED' && !b.aggregatorId);
    setDashContent('aggregator', `<h3 class="section-title">📥 Available Batches</h3>
      ${available.length ? `<div class="batch-list stagger-children">${available.map(b=>batchCardHTML(b,true)).join('')}</div>` : '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">No batches available to buy right now</div></div>'}`);
  },
  agg_ship: () => {
    const batches = getBatchesForAggregator(App.currentUser.id).filter(b => !b.retailerId);
    setDashContent('aggregator', `<h3 class="section-title">📤 Ship to Retailer</h3>
      ${batches.length ? `<div class="batch-list stagger-children">${batches.map(b=>`<div class="glass-card batch-card">
        <div class="batch-header"><div><div class="batch-crop">${getCropEmoji(b.crop)} ${b.crop}</div><div class="batch-id">${b.id}</div></div><span class="badge badge-cyan">${b.quantity}${b.unit}</span></div>
        <div class="input-group mt-2"><label>Select Retailer</label><select class="input-field" id="ship-ret-${b.id}">${RETAILERS.map(r=>`<option value="${r.id}">${r.name} (${r.location})</option>`).join('')}</select></div>
        <button class="btn btn-sm btn-primary btn-full mt-2" onclick="shipBatch('${b.id}')">🚛 Ship Now</button>
      </div>`).join('')}</div>` : '<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-text">All batches have been shipped</div></div>'}`);
  },

  // RETAILER TABS
  ret_stock: () => {
    const batches = getBatchesForRetailer(App.currentUser.id);
    setDashContent('retailer', `<h3 class="section-title">📦 Stock Overview</h3>
      <div class="stats-row mb-4"><div class="glass-card stat-card"><div class="stat-value text-green">${batches.filter(b=>b.status!=='SOLD').length}</div><div class="stat-label">In Stock</div></div><div class="glass-card stat-card"><div class="stat-value text-amber">${batches.filter(b=>b.status==='SOLD').length}</div><div class="stat-label">Sold Out</div></div></div>
      <div class="batch-list stagger-children">${batches.map(b=>retailerBatchHTML(b)).join('')}</div>`);
  },
  ret_sales: () => {
    const batches = getBatchesForRetailer(App.currentUser.id);
    const totalRev = batches.reduce((s,b)=>s+(b.retailPrice||0)*b.quantity,0);
    const totalCost = batches.reduce((s,b)=>s+(b.aggregatorPrice||0)*b.quantity,0);
    const profit = totalRev - totalCost;
    setDashContent('retailer', `<h3 class="section-title">📊 Sales Analytics</h3>
      <div class="stats-row stagger-children mb-4">
        <div class="glass-card stat-card"><div class="stat-value text-amber">${formatCurrency(totalRev)}</div><div class="stat-label">Revenue</div></div>
        <div class="glass-card stat-card"><div class="stat-value text-cyan">${formatCurrency(totalCost)}</div><div class="stat-label">Cost</div></div>
        <div class="glass-card stat-card"><div class="stat-value text-green">${formatCurrency(profit)}</div><div class="stat-label">Profit</div></div>
      </div>
      <div class="glass-card p-4"><div class="section-subtitle">Revenue by Product</div>
        ${batches.map(b=>`<div class="flex items-center gap-3 mb-3"><span style="width:70px" class="text-sm">${getCropEmoji(b.crop)} ${b.crop}</span><div style="flex:1;height:24px;background:var(--glass);border-radius:var(--radius-full);overflow:hidden"><div style="height:100%;width:${totalRev?(((b.retailPrice||0)*b.quantity)/totalRev)*100:0}%;background:linear-gradient(90deg,var(--accent-amber),var(--accent-green));border-radius:var(--radius-full)"></div></div><span class="text-sm weight-bold">${formatCurrency((b.retailPrice||0)*b.quantity)}</span></div>`).join('')}
      </div>`);
  },

  // CONSUMER TABS
  con_scan: () => {
    setDashContent('consumer', `<div class="text-center" style="padding:var(--space-6) var(--content-padding)">
      <div style="width:200px;height:200px;margin:0 auto var(--space-4);border:2px dashed var(--accent-cyan);border-radius:var(--radius-xl);display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--accent-cyan-dim)">
        <div style="font-size:48px" class="bounce">📷</div>
        <div class="text-sm text-cyan mt-2">Camera Scanner</div>
      </div>
      <p class="text-secondary text-sm mb-4">Point your camera at a QR code on the product label</p>
      <div class="divider"></div>
      <p class="text-secondary text-xs mb-4">Or enter batch ID manually</p>
      <div class="flex gap-3"><input id="trace-input" class="input-field flex-1" placeholder="BATCH-001"><button class="btn btn-primary" onclick="traceSearch()">Trace</button></div>
    </div><div id="trace-result"></div>`);
  },
  con_history: () => {
    const hist = JSON.parse(localStorage.getItem('agri_trace_history') || '[]');
    setDashContent('consumer', `<h3 class="section-title" style="padding:0 var(--content-padding)">📜 Trace History</h3>
      <div style="padding:0 var(--content-padding)">
      ${hist.length ? `<div class="batch-list stagger-children">${hist.map(h=>{const b=getBatch(h);if(!b)return'';return`<div class="glass-card batch-card" onclick="App.navTo('consumer','home');setTimeout(()=>{document.getElementById('trace-input').value='${b.id}';traceSearch()},100)">
        <div class="batch-header"><div><div class="batch-crop">${getCropEmoji(b.crop)} ${b.crop}</div><div class="batch-id">${b.id}</div></div><span class="badge badge-green">Traced ✓</span></div>
        <div class="batch-details"><div class="batch-detail-item"><span class="batch-detail-label">Farmer</span><span class="batch-detail-value">${getFarmer(b.farmerId)?.name||'—'}</span></div><div class="batch-detail-item"><span class="batch-detail-label">Price</span><span class="batch-detail-value text-amber">${formatCurrency(b.retailPrice||b.farmerPrice)}/kg</span></div></div>
      </div>`;}).join('')}</div>` : '<div class="empty-state"><div class="empty-icon">📜</div><div class="empty-text">No traces yet. Scan a QR code or search for a batch.</div></div>'}
      </div>`);
  },

  // SETTINGS (shared)
  settings: (role) => {
    const u = App.currentUser;
    const colorMap = {farmer:'green',aggregator:'cyan',retailer:'amber',consumer:'purple'};
    const c = colorMap[role]||'green';
    setDashContent(role, `<h3 class="section-title">⚙️ Settings</h3>
      <div class="glass-card p-4 mb-4"><div class="flex items-center gap-3 mb-4"><div class="avatar avatar-${c}" style="width:56px;height:56px;font-size:28px">${u.avatar||'👤'}</div><div><div class="profile-name">${u.name}</div><div class="text-xs text-secondary">${u.location||'Consumer'}</div>${u.wallet?`<div class="font-mono text-xs text-tertiary mt-1">${u.wallet}</div>`:''}</div></div></div>
      <div class="glass-card mb-4"><div class="flex items-center justify-between p-4" style="border-bottom:1px solid var(--glass-border)"><span class="text-sm weight-medium">🌐 Language</span><div class="lang-toggle"><button class="lang-btn active" onclick="setLang('en',this)">EN</button><button class="lang-btn" onclick="setLang('hi',this)">हिं</button><button class="lang-btn" onclick="setLang('od',this)">ଓ</button></div></div>
        <div class="flex items-center justify-between p-4" style="border-bottom:1px solid var(--glass-border)"><span class="text-sm weight-medium">🔔 Notifications</span><label class="toggle-switch"><input type="checkbox" checked onchange="App.showToast(this.checked?'Notifications enabled':'Notifications disabled')"><span class="toggle-slider"></span></label></div>
        <div class="flex items-center justify-between p-4" style="border-bottom:1px solid var(--glass-border)"><span class="text-sm weight-medium">🌙 Dark Mode</span><label class="toggle-switch"><input type="checkbox" checked disabled><span class="toggle-slider"></span></label></div>
        <div class="flex items-center justify-between p-4"><span class="text-sm weight-medium">⛓️ Blockchain</span><span class="badge badge-green">Connected</span></div>
      </div>
      <div class="glass-card p-4 mb-4"><div class="section-subtitle">About AgriChain ZK</div><p class="text-sm text-secondary">Version 1.0.0 • Built for SIH 2025</p><p class="text-sm text-secondary mt-2">Farm-to-fork traceability powered by blockchain. Ensuring fair prices for farmers and trust for consumers.</p><p class="text-xs text-tertiary mt-2">© 2026 Code Panda Team</p></div>
      <button class="btn btn-secondary btn-full" onclick="App.showScreen('login')">🚪 Logout</button>`);
  }
};

// --- Helpers ---
function setDashContent(role, html) {
  document.getElementById(role + '-content').innerHTML = html;
}

function filterBatches(status, el) {
  el.parentElement.querySelectorAll('.tab-item').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  const batches = getBatchesForFarmer(App.currentUser.id).filter(b=> status==='all' || b.status===status);
  document.getElementById('filtered-batches').innerHTML = batches.length ? batches.map(b=>batchCardHTML(b)).join('') : '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">No batches with this status</div></div>';
}

async function shipBatch(batchId) {
  const sel = document.getElementById('ship-ret-' + batchId);
  const retId = sel.value;
  const batch = getBatch(batchId);
  const ret = getRetailer(retId);
  batch.retailerId = retId;
  batch.retailPrice = Math.round(batch.aggregatorPrice * 1.4);
  batch.status = 'IN_TRANSIT';
  await window.agriChain.addBlock({ type:'TRANSFER_TO_RETAILER', batchId, actor:ret.name, role:'Retailer', price:batch.retailPrice, location:ret.location });
  App.showToast(batch.crop + ' shipped to ' + ret.name + '!');
  setTimeout(() => { batch.status = 'AT_RETAILER'; }, 2000);
  TabContent.agg_ship();
}

function setLang(lang, el) {
  el.parentElement.querySelectorAll('.lang-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  const names = {en:'English',hi:'Hindi',od:'Odia'};
  App.showToast('Language set to ' + names[lang]);
}

// Save trace to history
const _origTrace = traceSearch;
traceSearch = async function() {
  const id = document.getElementById('trace-input')?.value?.trim().toUpperCase();
  if (id && getBatch(id)) {
    let hist = JSON.parse(localStorage.getItem('agri_trace_history') || '[]');
    if (!hist.includes(id)) { hist.unshift(id); if(hist.length>20) hist.pop(); }
    localStorage.setItem('agri_trace_history', JSON.stringify(hist));
  }
  return _origTrace();
};

// --- Notifications ---
function showNotifications() {
  const modal = document.getElementById('modal-overlay');
  modal.classList.add('active');
  const notifs = [
    { icon:'🌾', text:'New batch BATCH-004 awaiting purchase', time:'2 min ago', color:'green' },
    { icon:'💰', text:'Payment of ₹16,000 received for BATCH-001', time:'1 hour ago', color:'amber' },
    { icon:'🚛', text:'BATCH-006 is in transit to Rourkela', time:'3 hours ago', color:'cyan' },
    { icon:'✅', text:'BATCH-003 marked as sold', time:'Yesterday', color:'green' },
    { icon:'⛓️', text:'Blockchain synced — 24 blocks verified', time:'Yesterday', color:'cyan' },
  ];
  document.getElementById('modal-content').innerHTML = `<div class="modal-handle"></div><h3 class="section-title">🔔 Notifications</h3>
    <div class="flex flex-col gap-2">${notifs.map(n=>`<div class="tx-item"><div class="tx-icon" style="background:var(--accent-${n.color}-dim);color:var(--accent-${n.color})">${n.icon}</div><div class="tx-info"><div class="tx-title">${n.text}</div><div class="tx-time">${n.time}</div></div></div>`).join('')}</div>
    <button class="btn btn-secondary btn-full mt-4" onclick="document.getElementById('modal-overlay').classList.remove('active')">Close</button>`;
}
