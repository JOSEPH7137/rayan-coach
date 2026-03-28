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
      s+=`<td style="width:${cellSize}px;height:${cellSize}px;background:${fill};"><\/td>`;
    }
    s+='<\/tr>';
  }
  s+='<\/table><\/div>';
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

/* ==================== THEME TOGGLE ==================== */
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');
  
  STATE.darkMode = !STATE.darkMode;
  
  if (STATE.darkMode) {
    body.classList.remove('light-mode');
    if (themeIcon) themeIcon.className = 'fas fa-moon';
    if (themeText) themeText.textContent = 'Dark';
  } else {
    body.classList.add('light-mode');
    if (themeIcon) themeIcon.className = 'fas fa-sun';
    if (themeText) themeText.textContent = 'Light';
  }
  
  localStorage.setItem('theme', STATE.darkMode ? 'dark' : 'light');
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    STATE.darkMode = false;
    document.body.classList.add('light-mode');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (themeIcon) themeIcon.className = 'fas fa-sun';
    if (themeText) themeText.textContent = 'Light';
  } else {
    STATE.darkMode = true;
    document.body.classList.remove('light-mode');
  }
}

/* ══════════════════════════════════════════════
   ROUTING
══════════════════════════════════════════════ */
function showPage(name){
  const welcomePage = $('welcome-page');
  const authPage = $('auth-page');
  const appPage = $('app-page');
  const aboutPage = document.getElementById('about-page');
  const contactPage = document.getElementById('contact-page');
  
  if(welcomePage) welcomePage.style.display = name==='welcome' ? 'flex' : 'none';
  if(aboutPage) aboutPage.style.display = name==='about' ? 'flex' : 'none';
  if(contactPage) contactPage.style.display = name==='contact' ? 'flex' : 'none';
  if(authPage) authPage.style.display = name==='auth' ? 'flex' : 'none';
  if(appPage) appPage.style.display = name==='app' ? 'flex' : 'none';
}

function gotoLogin(role){
  STATE.role = role;
  const authDecoIcon = $('auth-deco-icon');
  const authTitle = $('auth-title');
  const authSubtitle = $('auth-subtitle');
  const authRoleIcon = $('auth-role-icon');
  const signupTab = $('signup-tab');
  const adminNote = $('admin-note');
  
  if(authDecoIcon) authDecoIcon.textContent = {user:'🧳',driver:'🚗',admin:'🛡️'}[role];
  if(authTitle) authTitle.textContent = {user:'Traveller Sign In',driver:'Driver Sign In',admin:'Admin Login'}[role];
  if(authSubtitle) authSubtitle.textContent = {user:'Book, track & manage your journeys',driver:'Manage your trips & earnings',admin:'Enterprise control panel'}[role];
  if(authRoleIcon) authRoleIcon.textContent = {user:'🧳',driver:'🚗',admin:'🛡️'}[role];
  if(signupTab) signupTab.style.display = role==='admin' ? 'none' : '';
  if(adminNote) adminNote.style.display = role==='admin' ? 'block' : 'none';
  showPage('auth');
}

function authTab(t){
  const target = event.target;
  document.querySelectorAll('#auth-tabs .tab').forEach(x=>x.classList.remove('active'));
  target.classList.add('active');
  const loginForm = $('auth-login-form');
  const signupForm = $('auth-signup-form');
  if(loginForm) loginForm.style.display = t==='login'?'block':'none';
  if(signupForm) signupForm.style.display = t==='signup'?'block':'none';
}

function doLogin(){
  const btn=$('login-btn');
  if(!btn) return;
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
  const fn=$('su-fname'), ln=$('su-lname'), email=$('su-email');
  if(!fn || !ln || !email){ showToast('Please fill all fields','error'); return; }
  STATE.user = { ...DEMO_USERS[STATE.role], name:`${fn.value} ${ln.value}`, email: email.value, initials: fn.value[0]+ln.value[0] };
  initApp();
  showToast(`Account created! Welcome, ${fn.value} 🎉`,'success');
}

function doLogout(){
  STATE.user=null; STATE.role=null;
  showPage('welcome');
  showToast('Logged out successfully','info');
}

/* ==================== COUNTER ANIMATION ==================== */
const counters = document.querySelectorAll('.counter');
let hasAnimated = false;

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K+';
  }
  return num;
};

const animateCounters = () => {
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    if(!target) return;
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    const updateCount = () => {
      current += increment;
      if (current < target) {
        counter.innerText = formatNumber(Math.ceil(current));
        requestAnimationFrame(updateCount);
      } else {
        counter.innerText = formatNumber(target);
      }
    };
    updateCount();
  });
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !hasAnimated) {
      animateCounters();
      hasAnimated = true;
    }
  });
}, { threshold: 0.5 });

setTimeout(() => { 
  const statsDiv = document.querySelector('.stats-container-horizontal'); 
  if(statsDiv) observer.observe(statsDiv); 
}, 500);

/* ══════════════════════════════════════════════
   APP INIT
══════════════════════════════════════════════ */
function initApp(){
  showPage('app');
  const topbarName = $('topbar-name');
  const topbarAvatar = $('topbar-avatar');
  const sidebarRoleLabel = $('sidebar-role-label');
  if(topbarName) topbarName.textContent = STATE.user.name;
  if(topbarAvatar) topbarAvatar.textContent = STATE.user.initials;
  if(sidebarRoleLabel) sidebarRoleLabel.textContent = STATE.role.toUpperCase()+' PORTAL';
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
  const sidebarNav = $('sidebar-nav');
  if(sidebarNav) {
    sidebarNav.innerHTML=nav.map(item=>`
      <div class="nav-item ${STATE.page===item.id?'active':''}" id="nav-${item.id}" onclick="navigateTo('${item.id}')">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
      </div>`).join('');
  }
}

function navigateTo(page){
  STATE.page=page;
  document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
  const el=$('nav-'+page);
  if(el) el.classList.add('active');
  const titles={dashboard:'Dashboard',booking:'Book Ticket',tracking:'Live Tracking',parcel:'Parcel Delivery',tickets:'My Tickets',rewards:'Loyalty & Rewards',chat:'Messages',profile:'My Profile',safety:'Safety & SOS',trips:'My Trips',earnings:'Earnings',incident:'Incident Report',attendance:'Attendance',performance:'Performance',drivers:'Driver Management',vehicles:'Fleet Management',dispatch:'Dispatch Center',payments:'Payments & Finance',compliance:'Compliance',reports:'Analytics & Reports',audit:'Audit Logs',settings:'Settings'};
  const pageTitle = $('page-title');
  if(pageTitle) pageTitle.textContent=titles[page]||page;
  const content=$('page-content');
  if(content){
    content.style.opacity='0';
    content.innerHTML='<div class="skeleton shimmer-line" style="height:200px;"></div>';
    setTimeout(()=>{
      content.innerHTML=renderPage(page);
      content.style.opacity='1';
      content.style.transition='opacity 0.3s';
    },350);
  }
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

// ==================== TYPING ANIMATION ON CAROUSEL IMAGES ====================
const typingText = "WELCOME TO RAYAN COACH";
let typingTimeouts = {};
let currentTypingSlide = 0;

function startTypingForSlide(slideIndex) {
  // Clear existing timeouts for this slide
  if (typingTimeouts[slideIndex]) {
    typingTimeouts[slideIndex].forEach(timeout => clearTimeout(timeout));
  }
  typingTimeouts[slideIndex] = [];
  
  const typingElement = document.getElementById(`typingLine${slideIndex}`);
  if (!typingElement) return;
  
  let currentCharIndex = 0;
  let isDeleting = false;
  
  function typeEffect() {
    if (!typingElement) return;
    
    if (!isDeleting && currentCharIndex <= typingText.length) {
      typingElement.textContent = typingText.substring(0, currentCharIndex);
      currentCharIndex++;
      
      if (currentCharIndex > typingText.length) {
        isDeleting = true;
        const timeout = setTimeout(typeEffect, 3000);
        typingTimeouts[slideIndex].push(timeout);
        return;
      }
    } else if (isDeleting && currentCharIndex >= 0) {
      typingElement.textContent = typingText.substring(0, currentCharIndex);
      currentCharIndex--;
      
      if (currentCharIndex < 0) {
        isDeleting = false;
        currentCharIndex = 0;
        const timeout = setTimeout(typeEffect, 500);
        typingTimeouts[slideIndex].push(timeout);
        return;
      }
    }
    
    const speed = isDeleting ? 50 : 100;
    const timeout = setTimeout(typeEffect, speed);
    typingTimeouts[slideIndex].push(timeout);
  }
  
  typeEffect();
}

// Enhanced Carousel with typing animation
function initCarousel() {
  const slides = document.querySelector('.carousel-slides');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  let currentIndex = 0;
  const totalSlides = 3;
  let autoSlideInterval;

  // Start typing for first slide
  startTypingForSlide(0);
  currentTypingSlide = 0;

  function updateCarousel() {
    if (slides) {
      slides.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add('active');
        dot.style.background = 'var(--gold)';
        dot.style.transform = 'scale(1.2)';
      } else {
        dot.classList.remove('active');
        dot.style.background = 'rgba(255,255,255,0.5)';
        dot.style.transform = 'scale(1)';
      }
    });
    
    // Start typing for new slide when it changes
    if (currentTypingSlide !== currentIndex) {
      // Clear old typing timeouts
      if (typingTimeouts[currentTypingSlide]) {
        typingTimeouts[currentTypingSlide].forEach(timeout => clearTimeout(timeout));
      }
      currentTypingSlide = currentIndex;
      startTypingForSlide(currentIndex);
    }
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateCarousel();
  }

  function startAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoSlide() {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
    }
  }

  if (prevBtn && nextBtn) {
    // Remove existing listeners by cloning
    const newPrevBtn = prevBtn.cloneNode(true);
    const newNextBtn = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    
    newPrevBtn.addEventListener('click', () => {
      stopAutoSlide();
      prevSlide();
      startAutoSlide();
    });

    newNextBtn.addEventListener('click', () => {
      stopAutoSlide();
      nextSlide();
      startAutoSlide();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stopAutoSlide();
      currentIndex = index;
      updateCarousel();
      startAutoSlide();
    });
  });

  startAutoSlide();

  const carouselContainer = document.querySelector('.carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoSlide);
    carouselContainer.addEventListener('mouseleave', startAutoSlide);
  }
}
// ==================== TYPING ANIMATION FOR ROLE SELECTION PAGE ====================
const heroTypingText = "WELCOME TO RAYAN COACH";
let heroTypingTimeout = null;
let heroTypingActive = false;

function startHeroTyping() {
  const typingElement = document.getElementById('typingHeroLine');
  const cursorElement = document.getElementById('cursorHero');
  if (!typingElement) return;
  
  // Clear existing timeout
  if (heroTypingTimeout) {
    clearTimeout(heroTypingTimeout);
  }
  
  let currentCharIndex = 0;
  let isDeleting = false;
  heroTypingActive = true;
  
  function heroTypeEffect() {
    if (!typingElement || !heroTypingActive) return;
    
    if (!isDeleting && currentCharIndex <= heroTypingText.length) {
      typingElement.textContent = heroTypingText.substring(0, currentCharIndex);
      currentCharIndex++;
      
      if (currentCharIndex > heroTypingText.length) {
        isDeleting = true;
        heroTypingTimeout = setTimeout(heroTypeEffect, 3000);
        return;
      }
    } else if (isDeleting && currentCharIndex >= 0) {
      typingElement.textContent = heroTypingText.substring(0, currentCharIndex);
      currentCharIndex--;
      
      if (currentCharIndex < 0) {
        isDeleting = false;
        currentCharIndex = 0;
        heroTypingTimeout = setTimeout(heroTypeEffect, 500);
        return;
      }
    }
    
    const speed = isDeleting ? 50 : 100;
    heroTypingTimeout = setTimeout(heroTypeEffect, speed);
  }
  
  heroTypeEffect();
}

function stopHeroTyping() {
  heroTypingActive = false;
  if (heroTypingTimeout) {
    clearTimeout(heroTypingTimeout);
    heroTypingTimeout = null;
  }
}

// Override showRoleSelectionPage to start typing when page loads
const originalShowRoleSelectionPage = window.showRoleSelectionPage || function() {};
window.showRoleSelectionPage = function() {
  originalShowRoleSelectionPage();
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    stopHeroTyping();
    startHeroTyping();
  }, 100);
};
// ==================== NOTIFICATIONS ====================
function openNotifPanel(){
  showModal(`<div class="modal-box"><div class="modal-header"><h3>Notifications</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div><div class="modal-body"><p>You have 3 new notifications</p></div></div>`);
}

// ==================== INITIALIZE ====================
// Load theme on page load
loadTheme();

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initCarousel();
});

// Show welcome page
showPage('welcome');

console.log('%c RAYAN COACH TRANSPORT SYSTEM ', 'background:#E8A020;color:#08080F;font-weight:bold;font-size:14px;padding:4px 8px;');