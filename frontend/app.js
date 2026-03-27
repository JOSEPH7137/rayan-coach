/* ══════════════════════════════════════════════
   GLOBAL STATE
══════════════════════════════════════════════ */
const STATE = {
  role: null,       // 'user' | 'driver' | 'admin'
  user: null,       // logged in user object
  page: 'dashboard',
  lang: 'en',
  chatMessages: {},
  notifications: [],
  darkMode: true,
};

const DEMO_USERS = {
  user:   { name:'John Kamau',   email:'john@rc.co.ke',   initials:'JK', role:'user',   phone:'+254712345678', points:1240, trips:24 },
  driver: { name:'James Mwangi', email:'james@rc.co.ke',  initials:'JM', role:'driver', phone:'+254722000001', psv:'PSV-KE-2024-00821', rating:4.9 },
  admin:  { name:'Admin Rayan',  email:'admin@rc.co.ke',  initials:'AR', role:'admin',  phone:'+254700000000' },
};

const LANG = {
  en: { welcome:'Welcome to Rayan Coach', book:'Book Ticket', track:'Track Bus', logout:'Logout' },
  sw: { welcome:'Karibu Rayan Coach',     book:'Nunua Tiketi', track:'Fuatilia Basi', logout:'Toka' },
};

/* ══════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);

function showToast(msg, type='success', dur=3500){
  const c=$('toast-container');
  const colors={success:'var(--green)',error:'var(--red)',info:'var(--gold)',warning:'var(--gold)'};
  const t=document.createElement('div');
  t.className='toast';
  t.innerHTML=`<div class="toast-dot" style="background:${colors[type]};"></div><span style="flex:1;color:var(--soft);">${msg}</span><span style="color:var(--muted);cursor:pointer;font-size:16px;" onclick="this.parentElement.remove()">×</span>`;
  c.appendChild(t);
  setTimeout(()=>t.style.opacity='0',dur-300);
  setTimeout(()=>t.remove(),dur);
}

function showModal(html){
  const mc=$('modal-container');
  mc.innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()">${html}</div>`;
}
function closeModal(){ $('modal-container').innerHTML=''; }

function setLang(l){ STATE.lang=l; showToast(`Language: ${l.toUpperCase()}`,'info'); }
function togglePw(id){ const i=$(id); i.type=i.type==='password'?'text':'password'; }
function toggleSidebar(){ $('sidebar').classList.toggle('open'); }

function formatKES(n){ return 'KES '+Number(n).toLocaleString(); }
function timeAgo(d){ const s=Math.floor((Date.now()-d)/1000); if(s<60)return s+'s ago'; if(s<3600)return Math.floor(s/60)+'m ago'; return Math.floor(s/3600)+'h ago'; }

function genQR(size=80){
  const cells=9, cellSize=size/cells;
  let s=`<div style="background:#fff;padding:6px;border-radius:6px;display:inline-block;"><table style="border-collapse:collapse;">`;
  for(let r=0;r<cells;r++){
    s+='<tr>';
    for(let c=0;c<cells;c++){
      const fill=(r<3&&c<3)||(r<3&&c>5)||(r>5&&c<3)||Math.random()>0.5?'#000':'#fff';
      s+=`<td style="width:${cellSize}px;height:${cellSize}px;background:${fill};"></td>`;
    }
    s+='</tr>';
  }
  s+='</table></div>';
  return s;
}

function miniChart(data,h=60){
  const max=Math.max(...data);
  const labels=['M','T','W','T','F','S','S'];
  return `<div class="mini-chart">${data.map((v,i)=>`
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;">
      <div class="chart-bar ${i===data.length-1?'last':''}" style="height:${Math.round((v/max)*h)+4}px;" title="${v}"></div>
      <div class="chart-bar-label">${labels[i]||''}</div>
    </div>`).join('')}</div>`;
}

/* ══════════════════════════════════════════════
   ROUTING
══════════════════════════════════════════════ */
function showPage(name){
  $('welcome-page').style.display = name==='welcome' ? 'flex' : 'none';
  $('auth-page').style.display    = name==='auth'    ? 'flex' : 'none';
  $('app-page').style.display     = name==='app'     ? 'flex' : 'none';
}

function gotoLogin(role){
  STATE.role = role;
  $('auth-deco-icon').textContent = {user:'🧳',driver:'🚗',admin:'🛡️'}[role];
  $('auth-title').textContent = {user:'Traveller Sign In',driver:'Driver Sign In',admin:'Admin Login'}[role];
  $('auth-subtitle').textContent = {user:'Book, track & manage your journeys',driver:'Manage your trips & earnings',admin:'Enterprise control panel'}[role];
  $('auth-role-icon').textContent = {user:'🧳',driver:'🚗',admin:'🛡️'}[role];
  $('signup-tab').style.display = role==='admin' ? 'none' : '';
  $('admin-note').style.display = role==='admin' ? 'block' : 'none';
  showPage('auth');
}

function authTab(t){
  document.querySelectorAll('#auth-tabs .tab').forEach(x=>x.classList.remove('active'));
  event.target.classList.add('active');
  $('auth-login-form').style.display = t==='login'?'block':'none';
  $('auth-signup-form').style.display= t==='signup'?'block':'none';
}

function doLogin(){
  const btn=$('login-btn');
  btn.disabled=true;
  btn.innerHTML='<div class="spin" style="width:16px;height:16px;border:2px solid #0A0A0F;border-top-color:transparent;border-radius:50%;"></div> Signing in...';
  setTimeout(()=>{
    STATE.user = DEMO_USERS[STATE.role];
    initApp();
    showToast(`Welcome, ${STATE.user.name}! 👋`,'success');
    btn.disabled=false;
    btn.innerHTML='Sign In';
  },1400);
}

function doSignup(){
  const fn=$('su-fname').value, ln=$('su-lname').value, email=$('su-email').value;
  if(!fn||!ln||!email){ showToast('Please fill all fields','error'); return; }
  STATE.user = { ...DEMO_USERS[STATE.role], name:`${fn} ${ln}`, email, initials: fn[0]+ln[0] };
  initApp();
  showToast(`Account created! Welcome, ${fn} 🎉`,'success');
}

function doLogout(){
  STATE.user=null; STATE.role=null;
  showPage('welcome');
  showToast('Logged out successfully','info');
}

/* ══════════════════════════════════════════════
   APP INIT
══════════════════════════════════════════════ */
function initApp(){
  showPage('app');
  $('topbar-name').textContent = STATE.user.name;
  $('topbar-avatar').textContent = STATE.user.initials;
  $('sidebar-role-label').textContent = STATE.role.toUpperCase()+' PORTAL';
  buildSidebar();
  navigateTo('dashboard');
}

/* ══════════════════════════════════════════════
   SIDEBAR BUILDER
══════════════════════════════════════════════ */
const NAVS = {
  user: [
    {id:'dashboard',icon:'🏠',label:'Dashboard'},
    {id:'booking',icon:'🎫',label:'Book Ticket'},
    {id:'tracking',icon:'📍',label:'Live Tracking'},
    {id:'parcel',icon:'📦',label:'Parcel Delivery'},
    {id:'tickets',icon:'🗂️',label:'My Tickets'},
    {id:'rewards',icon:'🎁',label:'Rewards'},
    {id:'chat',icon:'💬',label:'Messages'},
    {id:'profile',icon:'👤',label:'Profile'},
    {id:'safety',icon:'🆘',label:'Safety & SOS'},
  ],
  driver: [
    {id:'dashboard',icon:'🏠',label:'Dashboard'},
    {id:'trips',icon:'🚌',label:'My Trips'},
    {id:'tracking',icon:'📍',label:'GPS Tracking'},
    {id:'earnings',icon:'💰',label:'Earnings'},
    {id:'chat',icon:'💬',label:'Messages'},
    {id:'incident',icon:'⚠️',label:'Incident Report'},
    {id:'attendance',icon:'📋',label:'Attendance'},
    {id:'performance',icon:'📊',label:'Performance'},
    {id:'profile',icon:'👤',label:'Profile'},
  ],
  admin: [
    {id:'dashboard',icon:'🏠',label:'Dashboard'},
    {id:'tracking',icon:'🗺️',label:'Live Tracking'},
    {id:'drivers',icon:'👥',label:'Drivers'},
    {id:'vehicles',icon:'🚌',label:'Fleet'},
    {id:'dispatch',icon:'📡',label:'Dispatch'},
    {id:'payments',icon:'💳',label:'Payments'},
    {id:'compliance',icon:'📋',label:'Compliance'},
    {id:'reports',icon:'📊',label:'Analytics'},
    {id:'chat',icon:'💬',label:'Communications'},
    {id:'audit',icon:'🔍',label:'Audit Logs'},
    {id:'settings',icon:'⚙️',label:'Settings'},
  ],
};

function buildSidebar(){
  const nav=NAVS[STATE.role]||[];
  $('sidebar-nav').innerHTML=nav.map(item=>`
    <div class="nav-item ${STATE.page===item.id?'active':''}" id="nav-${item.id}" onclick="navigateTo('${item.id}')">
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
    </div>`).join('');
}

function navigateTo(page){
  STATE.page=page;
  document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
  const el=$('nav-'+page);
  if(el) el.classList.add('active');
  const titles={dashboard:'Dashboard',booking:'Book Ticket',tracking:'Live Tracking',parcel:'Parcel Delivery',tickets:'My Tickets',rewards:'Loyalty & Rewards',chat:'Messages',profile:'My Profile',safety:'Safety & SOS',trips:'My Trips',earnings:'Earnings',incident:'Incident Report',attendance:'Attendance',performance:'Performance',drivers:'Driver Management',vehicles:'Fleet Management',dispatch:'Dispatch Center',payments:'Payments & Finance',compliance:'Compliance',reports:'Analytics & Reports',audit:'Audit Logs',settings:'Settings'};
  $('page-title').textContent=titles[page]||page;
  const content=$('page-content');
  content.style.opacity='0';
  content.innerHTML=renderSkeletons();
  setTimeout(()=>{
    content.innerHTML=renderPage(page);
    content.style.opacity='1';
    content.style.transition='opacity 0.3s';
  },350);
}

function renderSkeletons(){
  return `<div class="flex flex-col gap-16">
    <div class="skeleton shimmer-line" style="height:24px;width:200px;"></div>
    <div class="grid-4">${[1,2,3,4].map(()=>`<div class="skeleton" style="height:100px;"></div>`).join('')}</div>
    <div class="grid-2">
      <div class="skeleton" style="height:200px;"></div>
      <div class="skeleton" style="height:200px;"></div>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════
   PAGE RENDERER (Main entry point)
══════════════════════════════════════════════ */
function renderPage(page){
  const role=STATE.role;
  if(role==='user'){
    if(page==='dashboard') return renderUserDashboard();
    if(page==='booking')   return renderBooking();
    if(page==='tracking')  return renderTracking();
    if(page==='parcel')    return renderParcel();
    if(page==='tickets')   return renderTickets();
    if(page==='rewards')   return renderRewards();
    if(page==='chat')      return renderChat();
    if(page==='profile')   return renderProfile();
    if(page==='safety')    return renderSafety();
  }
  if(role==='driver'){
    if(page==='dashboard')   return renderDriverDashboard();
    if(page==='trips')       return renderDriverTrips();
    if(page==='tracking')    return renderDriverTracking();
    if(page==='earnings')    return renderDriverEarnings();
    if(page==='chat')        return renderChat();
    if(page==='incident')    return renderIncident();
    if(page==='attendance')  return renderAttendance();
    if(page==='performance') return renderPerformance();
    if(page==='profile')     return renderProfile();
  }
  if(role==='admin'){
    if(page==='dashboard')  return renderAdminDashboard();
    if(page==='tracking')   return renderAdminTracking();
    if(page==='drivers')    return renderAdminDrivers();
    if(page==='vehicles')   return renderAdminVehicles();
    if(page==='dispatch')   return renderDispatch();
    if(page==='payments')   return renderAdminPayments();
    if(page==='compliance') return renderCompliance();
    if(page==='reports')    return renderReports();
    if(page==='chat')       return renderChat();
    if(page==='audit')      return renderAudit();
    if(page==='settings')   return renderSettings();
  }
  return `<div style="padding:40px;text-align:center;color:var(--muted);">Page not found</div>`;
}

// ==================== USER PAGES ====================
function renderUserDashboard(){
  return `
  <div class="flex flex-col gap-24 fade-up">
    <div style="background:linear-gradient(135deg,rgba(74,142,245,0.15),rgba(74,142,245,0.03));border:1px solid rgba(74,142,245,0.2);border-radius:16px;padding:24px;display:flex;justify-content:space-between;align-items:center;gap:16px;">
      <div>
        <h2 style="font-size:22px;font-weight:800;margin-bottom:4px;">Good morning, ${STATE.user.name.split(' ')[0]}! 👋</h2>
        <p style="color:var(--muted);font-size:14px;">You have 2 upcoming trips this week. Safe travels!</p>
      </div>
      <button class="btn btn-gold" onclick="navigateTo('booking')">+ Book Trip</button>
    </div>
    <div class="grid-4">
      <div class="stat-card"><div class="stat-icon">🎫</div><div class="stat-value">24</div><div class="stat-label">Total Trips</div><div class="stat-delta" style="color:var(--blue);">↑ 3 this month</div></div>
      <div class="stat-card"><div class="stat-icon">⭐</div><div class="stat-value">1,240</div><div class="stat-label">Reward Pts</div><div class="stat-delta" style="color:var(--gold);">↑ +80 pts earned</div></div>
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-value">KES 720</div><div class="stat-label">Money Saved</div><div class="stat-delta" style="color:var(--green);">via rewards</div></div>
      <div class="stat-card"><div class="stat-icon">📦</div><div class="stat-value">6</div><div class="stat-label">Parcels Sent</div><div class="stat-delta" style="color:var(--purple);">2 in transit</div></div>
    </div>
  </div>`;
}

function renderBooking(){
  return `<div class="card card-pad"><h3>Booking Page</h3><p>Select your route to book a ticket</p><button class="btn btn-gold" onclick="showToast('Booking started','info')">Book Now</button></div>`;
}

function renderTracking(){
  return `<div class="map-wrap" style="height:320px;"><div class="map-grid"></div><div class="bus-pin" style="top:40%;left:60%;">🚌</div><div style="position:absolute;bottom:12px;left:12px;background:rgba(0,0,0,0.6);border-radius:8px;padding:4px 10px;font-size:11px;">📍 Thika Road, Nairobi</div></div>`;
}

function renderParcel(){
  return `<div class="card card-pad"><h3>Send a Parcel</h3><button class="btn btn-gold" onclick="showToast('Parcel booking started','info')">Book Parcel</button></div>`;
}

function renderTickets(){
  return `<div class="card card-pad"><h3>My Tickets</h3><p>Your tickets will appear here</p></div>`;
}

function renderRewards(){
  return `<div class="card card-pad"><h3>Rewards</h3><p>1,240 points earned</p><button class="btn btn-gold">Redeem</button></div>`;
}

function renderChat(){
  return `<div class="card card-pad"><h3>Support Chat</h3><div class="flex gap-8"><input class="input" placeholder="Type message..."/><button class="btn btn-gold">Send</button></div></div>`;
}

function renderProfile(){
  return `<div class="card card-pad"><h3>My Profile</h3><p>Name: ${STATE.user.name}</p><p>Email: ${STATE.user.email}</p><p>Phone: ${STATE.user.phone}</p><button class="btn btn-gold" onclick="showToast('Profile updated','success')">Save Changes</button></div>`;
}

function renderSafety(){
  return `<div class="card card-pad"><button class="btn btn-danger btn-lg" onclick="showToast('SOS Alert sent!','error')">🆘 SOS Emergency</button><button class="btn btn-ghost mt-4" onclick="showToast('Trip shared!','info')">Share Trip</button></div>`;
}

// ==================== DRIVER PAGES ====================
function renderDriverDashboard(){
  return `<div class="card card-pad"><h3>Driver Dashboard</h3><p>Welcome, ${STATE.user.name}</p><div class="stat-card">Today's Earnings: KES 4,200</div><button class="btn btn-gold" onclick="showToast('Trip started','success')">Start Trip</button></div>`;
}

function renderDriverTrips(){
  return `<div class="card card-pad"><h3>My Trips</h3><p>Nairobi → Mombasa (07:00 AM)</p><p>Mombasa → Nairobi (14:00 PM)</p></div>`;
}

function renderDriverTracking(){
  return `<div class="map-wrap" style="height:320px;"><div class="map-grid"></div><div class="bus-pin" style="top:40%;left:45%;">🚗</div></div>`;
}

function renderDriverEarnings(){
  return `<div class="card card-pad"><h3>Earnings</h3><p>This Month: KES 48,700</p><p>This Week: KES 14,200</p></div>`;
}

function renderIncident(){
  return `<div class="card card-pad"><h3>Report Incident</h3><textarea class="input" rows="4" placeholder="Describe incident..."></textarea><button class="btn btn-danger" onclick="showToast('Incident reported','success')">Submit Report</button></div>`;
}

function renderAttendance(){
  return `<div class="card card-pad"><button class="btn btn-gold" onclick="showToast('Clocked in','success')">Clock In</button><button class="btn btn-danger" onclick="showToast('Clocked out','info')">Clock Out</button></div>`;
}

function renderPerformance(){
  return `<div class="card card-pad"><h3>Performance</h3><p>Rating: 4.9 ★</p><p>On-time Rate: 94%</p></div>`;
}

// ==================== ADMIN PAGES ====================
function renderAdminDashboard(){
  return `<div class="grid-4"><div class="stat-card">Active Trips: 14</div><div class="stat-card">Revenue: KES 84K</div><div class="stat-card">Drivers: 31</div><div class="stat-card">Alerts: 3</div></div>`;
}

function renderAdminTracking(){
  return `<div class="map-wrap" style="height:400px;"><div class="map-grid"></div><div class="bus-pin" style="top:30%;left:45%;">🚌</div><div class="bus-pin" style="top:60%;left:70%;">🚌</div></div>`;
}

function renderAdminDrivers(){
  return `<div class="card card-pad"><h3>Drivers</h3><button class="btn btn-gold" onclick="showToast('Add driver','info')">+ Add Driver</button></div>`;
}

function renderAdminVehicles(){
  return `<div class="card card-pad"><h3>Fleet</h3><button class="btn btn-gold" onclick="showToast('Add vehicle','info')">+ Add Vehicle</button></div>`;
}

function renderDispatch(){
  return `<div class="card card-pad"><h3>Dispatch</h3><button class="btn btn-gold" onclick="showToast('Trip created','success')">Create Trip</button></div>`;
}

function renderAdminPayments(){
  return `<div class="card card-pad"><h3>Payments</h3><button class="btn btn-gold" onclick="showToast('Processing payouts','info')">Process Payouts</button></div>`;
}

function renderCompliance(){
  return `<div class="card card-pad"><h3>Compliance</h3><p>License expirations: 3 drivers</p></div>`;
}

function renderReports(){
  return `<div class="card card-pad"><h3>Reports</h3><button class="btn btn-gold" onclick="showToast('Downloading report','info')">Download Report</button></div>`;
}

function renderAudit(){
  return `<div class="card card-pad"><h3>Audit Logs</h3><p>Recent activities will appear here</p></div>`;
}

function renderSettings(){
  return `<div class="card card-pad"><h3>Settings</h3><button class="btn btn-gold" onclick="showToast('Settings saved','success')">Save Changes</button></div>`;
}

// ==================== NOTIFICATIONS ====================
function openNotifPanel(){
  showModal(`<div class="modal-box"><div class="modal-header"><h3>Notifications</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div><div class="modal-body"><p>You have 3 new notifications</p></div></div>`);
}

// Initialize
showPage('welcome');
console.log('%c RAYAN COACH TRANSPORT SYSTEM ', 'background:#E8A020;color:#08080F;font-weight:bold;font-size:14px;padding:4px 8px;');