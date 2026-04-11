
// ================= GLOBAL STATE =================
let currentPage = 'dashboard';
let currentUser = null;
let userProfile = null;


// ================= SESSION CHECK =================
(async function() {
    const { data: { user } } = await sb.auth.getUser();

    if (!user) {
        window.location.href = 'auth.html';
        return;
    }

    const { data: profile } = await sb
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        showToast('Access denied. Admin only.', 'error');
        await sb.auth.signOut();
        return;
    }

    currentUser = user;
    userProfile = profile;

    document.getElementById('userName').textContent = profile.name || user.email;
    document.getElementById('userAvatar').textContent =
        (profile.name || user.email).charAt(0);

    loadPageContent('dashboard');
})();

// ================= NAVIGATION =================
function toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('open');
}

function navigateTo(page) {
    currentPage = page;

    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    loadPageContent(page);
}
function navigateAdmin(page) {
  const content = document.getElementById("adminContent");

  if (!content) return;

  const pages = {
    tracking: "<h2>Live Tracking</h2>",
    drivers: "<h2>Drivers</h2>",
    fleet: "<h2>Fleet</h2>",
    dispatch: "<h2>Dispatch</h2>",
    payments: "<h2>Payments</h2>",
    compliance: "<h2>Compliance</h2>",
    analytics: "<h2>Analytics</h2>",
    logs: "<h2>Audit Logs</h2>",
    settings: "<h2>Settings</h2>",
    reviews: "<h2>Reviews</h2>"
  };

  content.innerHTML = pages[page] || "<h2>Dashboard</h2>";
}

window.navigateAdmin = navigateAdmin;

// ================= PAGE LOADER =================
function loadPageContent(page) {
    const content = document.getElementById('pageContent');

    const pages = {
        dashboard: `<h2>Welcome ${userProfile?.name}</h2>`,
        
        drivers: `
            <button onclick="openAddDriverModal()">+ Add Driver</button>
            <div id="driversList">Loading...</div>
        `,
        
        fleet: `
            <h3>Add Bus</h3>
            <input id="busName" placeholder="Bus Name">
            <input id="busCategory" placeholder="Category (VIP, Exclusive)">
            <textarea id="busServices" placeholder="Services"></textarea>
            <input type="file" id="busImage">
            <button onclick="addBus()">Add Bus</button>
        `,

        messages: `
            <h3>Messages</h3>
            <div id="messagesBox"></div>
        `,

        reviews: `<div id="allReviewsList">Loading reviews...</div>`
    };

    content.innerHTML = pages[page] || pages.dashboard;

    if (page === 'drivers') loadDrivers();
    if (page === 'reviews') loadAllReviews();
}


// ================= DRIVER MANAGEMENT =================
function generateDriverCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 8 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join('');
}

function openAddDriverModal() {
    const modal = document.getElementById('addDriverModal');
    const overlay = document.getElementById('modalOverlay');

    if (modal && !document.getElementById('driverSalary')) {
        modal.innerHTML += `
            <input id="driverSalary" placeholder="Salary (KES)">
        `;
    }

    modal.style.display = 'block';
    overlay.style.display = 'block';
}

function closeAddDriverModal() {
    document.getElementById('addDriverModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
}

async function addDriver() {
    const name = document.getElementById('driverName').value;
    const email = document.getElementById('driverEmail').value;
    const salary = document.getElementById('driverSalary')?.value || 0;

    const code = generateDriverCode();

    const { error } = await window.supabase.from('profiles').insert({
        name,
        email,
        role: 'driver',
        driver_code: code,
        salary,
        status: 'active'
    });

    if (!error) {
        showToast(`Driver created. Code: ${code}`, 'success');
        loadDrivers();
    }
}

async function loadDrivers() {
    const { data } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver');

    document.getElementById('driversList').innerHTML = `
        ${data.map(d => `
            <div>
                ${d.name} | ${d.driver_code} | KES ${d.salary}
                <button onclick="suspendDriver('${d.id}')">Suspend</button>
                <button onclick="fireDriver('${d.id}')">Fire</button>
                <button onclick="congratulateDriver('${d.id}')">👏</button>
            </div>
        `).join('')}
    `;
}

async function suspendDriver(id) {
    await updateDriverStatus(id, 'suspended');
}

async function fireDriver(id) {
    await updateDriverStatus(id, 'fired');
}

async function updateDriverStatus(id, status) {
    await window.supabase.from('profiles').update({ status }).eq('id', id);
    loadDrivers();
}

async function congratulateDriver(id) {
    await sendMessage(id, "🎉 Great job!");
}


// ================= MESSAGING =================
async function sendMessage(receiver_id, text, file_url = null) {
    const { error } = await window.supabase.from('messages').insert({
        sender_id: currentUser.id,
        receiver_id,
        message: text,
        file_url
    });

    if (error) {
        console.error(error);
        showToast("Failed to send message", "error");
    }
}

async function loadAllMessages() {
    const { data } = await window.supabase.from('messages').select('*');

    console.log(data);
}
if (!selectedUserId) {
  showToast("Select a user first", "error");
  return;
}
// REALTIME
function initRealtimeMessages() {
    window.supabase.channel('messages')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
        }, payload => {
            console.log('New message', payload.new);
        })
        .subscribe();
}


// ================= FILE UPLOAD =================
async function uploadFile(file) {
    const name = Date.now() + file.name;

    await window.supabase.storage.from('chat-files').upload(name, file);

    return window.supabase.storage.from('chat-files').getPublicUrl(name).data.publicUrl;
}
//============load users=======
async function loadUsers() {
  const { data } = await sb
    .from('messages')
    .select('*');

  const users = new Set();

  data.forEach(m => {
    if (m.sender_id !== currentUser.id) users.add(m.sender_id);
    if (m.receiver_id !== currentUser.id) users.add(m.receiver_id);
  });

  const list = document.getElementById("userList");
  list.innerHTML = "";

  users.forEach(id => {
    const div = document.createElement("div");
    div.textContent = id;
    div.onclick = () => loadAdminChat(id);
    list.appendChild(div);
  });
}
//===========load messages==========
let selectedUserId = null;

async function loadAdminChat(userId) {
  selectedUserId = userId;

  const { data } = await sb
    .from('messages')
    .select('*')
    .or(`
      and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),
      and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})
    `)
    .order('created_at', { ascending: true });

  const chatBox = document.getElementById("adminChat");
  chatBox.innerHTML = "";

  data.forEach(msg => {
    const div = document.createElement("div");

    const isAdmin = msg.sender_id === currentUser.id;

    div.innerHTML = `
      <strong>${isAdmin ? 'Admin' : 'User'}:</strong>
      ${msg.message || ''}
      ${msg.file_url ? `<br><img src="${msg.file_url}" width="120">` : ''}
    `;

    chatBox.appendChild(div);
  });
}
//============admin send message=======
async function sendAdminMessage() {
  const input = document.getElementById("adminInput");
  const fileInput = document.getElementById("adminFile");

  let fileUrl = null;

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];

    const { data } = await sb.storage
      .from('chat-files')
      .upload(`admin/${Date.now()}_${file.name}`, file);

    fileUrl = sb.storage
      .from('chat-files')
      .getPublicUrl(data.path).data.publicUrl;
  }

await sb.from('messages').insert({
  sender_id: currentUser.id,
  receiver_id: selectedUserId,
  message: input.value,
  file_url: fileUrl
});

  input.value = "";
  fileInput.value = "";

  loadAdminChat(selectedUserId);
}
// ================= BUSES =================
async function addBus() {
    const name = document.getElementById('busName').value;
    const category = document.getElementById('busCategory').value;
    const services = document.getElementById('busServices').value;
    const file = document.getElementById('busImage').files[0];

    let image_url = null;
    if (file) image_url = await uploadFile(file);

    await window.supabase.from('buses').insert({
        name,
        category,
        services,
        image_url
    });

    showToast('Bus added', 'success');
}

// ========== FUEL & TRIP CALCULATOR ==========
function openFuelCalculator() {
    const html = `
        <div class="dashboard-card">
            <h3>⛽ Fuel & Trip Calculator</h3>
            
            <input id="distanceKm" class="input" placeholder="Distance (km)">
            <input id="fuelEfficiency" class="input" placeholder="Fuel Efficiency (km/L)">
            <input id="fuelPrice" class="input" placeholder="Fuel Price (KES/L)">

            <button class="btn-dashboard btn-primary" onclick="calculateTrip()">Calculate</button>

            <div id="calcResults" style="margin-top:15px;"></div>
        </div>
    `;
    document.getElementById('pageContent').innerHTML = html;
}
//=====================fuel calculator======
function calculateTrip() {
    const distance = parseFloat(document.getElementById('distanceKm').value);
    const efficiency = parseFloat(document.getElementById('fuelEfficiency').value);
    const price = parseFloat(document.getElementById('fuelPrice').value);

    if (!distance || !efficiency || !price) {
        showToast("Fill all fields", "error");
        return;
    }

    const fuelNeeded = distance / efficiency;
    const cost = fuelNeeded * price;
    const time = distance / 80;

    document.getElementById('calcResults').innerHTML = `
        <p>⛽ Fuel Needed: <strong>${fuelNeeded.toFixed(2)} L</strong></p>
        <p>💰 Fuel Cost: <strong>KES ${cost.toFixed(2)}</strong></p>
        <p>⏱ Travel Time @80km/h: <strong>${time.toFixed(2)} hrs</strong></p>
    `;
}
//==============live tracking  system======
// ========== LIVE TRACKING ==========
function openLiveTracking() {
    document.getElementById('pageContent').innerHTML = `
        <div class="dashboard-card">
            <h3>📍 Live Driver Tracking</h3>
            <div id="trackingList">Loading...</div>
        </div>
    `;
    loadLiveLocations();
}

async function loadLiveLocations() {
    const { data } = await window.supabase
        .from('driver_locations')
        .select('*');

    const container = document.getElementById('trackingList');

    container.innerHTML = data.map(d => `
        <div class="trip-item">
            <strong>${d.driver_name}</strong><br>
            Lat: ${d.latitude} | Lng: ${d.longitude}<br>
            Updated: ${new Date(d.updated_at).toLocaleTimeString()}
        </div>
    `).join('');
}

// REALTIME
window.supabase
.channel('locations')
.on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'driver_locations'
}, payload => {
    loadLiveLocations();
})
.subscribe();


//==========live maps====
let map;
let markers = {};

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -1.286389, lng: 36.817223 }, // Nairobi
        zoom: 10,
    });

    loadDriverLocationsOnMap();
}

async function loadDriverLocationsOnMap() {
    const { data } = await window.supabase
        .from('driver_locations')
        .select('*');

    data.forEach(driver => {
        const position = {
            lat: driver.latitude,
            lng: driver.longitude
        };

        if (!markers[driver.driver_id]) {
            markers[driver.driver_id] = new google.maps.Marker({
                position,
                map,
                title: driver.driver_name
            });
        } else {
            markers[driver.driver_id].setPosition(position);
        }
    });
}

// REALTIME UPDATE
window.supabase
.channel('map-tracking')
.on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'driver_locations'
}, payload => {
    loadDriverLocationsOnMap();
})
.subscribe();
// ================= REVIEWS =================
async function loadAllReviews() {
    const { data } = await window.supabase.from('reviews').select('*');

    document.getElementById('allReviewsList').innerHTML =
        data.map(r => `<div>${r.comment || 'No comment'}</div>`).join('');
}
//===============admin password change========
async function changeAdminPassword() {
    const newPassword = document.getElementById('newPassword').value;

    if (newPassword.length < 6) {
        showToast("Password must be at least 6 characters", "error");
        return;
    }

    const { error } = await window.supabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
        showToast("❌ Failed to update password", "error");
    } else {
        showToast("✅ Password changed successfully", "success");
    }
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
    initRealtimeMessages();
});

let messageChannel;

function initRealtimeMessages() {
  if (messageChannel) return;

  messageChannel = window.supabase
    .channel('messages')
    .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
    }, payload => {
        if (selectedUserId) {
            loadAdminChat(selectedUserId);
        }
    })
    .subscribe();
}
// ================= GLOBAL EXPORT =================
window.navigateTo = navigateTo;
window.addDriver = addDriver;
window.loadDrivers = loadDrivers;
window.openAddDriverModal = openAddDriverModal;
window.closeAddDriverModal = closeAddDriverModal;
window.suspendDriver = suspendDriver;
window.fireDriver = fireDriver;
window.congratulateDriver = congratulateDriver;
window.addBus = addBus;