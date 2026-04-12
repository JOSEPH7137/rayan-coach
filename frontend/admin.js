const sb = window.supabase;
// ================= GLOBAL STATE =================
let currentPage = 'dashboard';
let currentUser = null;
let userProfile = null;

function showLoader() {
  document.getElementById("loader")?.classList.add("active");
}

function hideLoader() {
  document.getElementById("loader")?.classList.remove("active");
}
// ================= SESSION CHECK =================
(async function() {
    showLoader();
    const { data: { user } } = await sb.auth.getUser();

    if (!user) {
        hideLoader();
        window.location.href = 'auth.html';
        return;
    }

const { data: profile, error } = await sb
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

if (error || !profile || profile.role !== 'admin') {
    hideLoader();
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
    hideLoader();
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


// ================= PAGE LOADER =================
function loadPageContent(page) {
    const content = document.getElementById('pageContent');

    const pages = {
        dashboard: `<h2>Welcome ${userProfile?.name}</h2>`,
        
            tracking: `
        <h3>Live Tracking</h3>
        <div id="trackingList">Loading...</div>
    `,

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
  <div id="userList"></div>
  <div id="adminChat"></div>
  <input id="adminInput" placeholder="Type message">
  <button onclick="sendAdminMessage()">Send</button>
`,

        reviews: `<div id="allReviewsList">Loading reviews...</div>`
    };

    content.innerHTML = pages[page] || pages.dashboard;

    if (page === 'drivers') loadDrivers();
    if (page === 'reviews') loadAllReviews();
    if (page === 'tracking') loadLiveLocations();
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
    showLoader();
    const name = document.getElementById('driverName').value;
    const email = document.getElementById('driverEmail').value;
   if (!name || !email) {
    hideLoader(); // ✅ add this
    showToast("Name and email required", "error");
    return;
}
    const salary = document.getElementById('driverSalary')?.value || 0;

    const code = generateDriverCode();

    const { error } = await sb.from('profiles').insert({
        name,
        email,
        role: 'driver',
        driver_code: code,
        salary,
        status: 'active'
    });

 if (error) {
    showToast("Failed to add driver", "error");
} else {
    showToast(`Driver created. Code: ${code}`, 'success');
    loadDrivers();
}
    
    hideLoader();
}

async function loadDrivers() {
    showLoader();
   const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('role', 'driver');

if (error) {
    console.error(error);
    showToast("Failed to load drivers", "error");
    hideLoader();
    return;
}
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
hideLoader();    
}

async function suspendDriver(id) {
    await updateDriverStatus(id, 'suspended');
}

async function fireDriver(id) {
    await updateDriverStatus(id, 'fired');
}

async function updateDriverStatus(id, status) {
    await sb.from('profiles').update({ status }).eq('id', id);
    loadDrivers();
}

async function congratulateDriver(id) {
    await sendMessage(id, "🎉 Great job!");
}


// ================= MESSAGING =================
async function sendMessage(receiver_id, text, file_url = null) {
  const { error } = await sb.from('messages').insert({
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
const { data, error } = await sb.from('messages').select('*');

if (error) {
    console.error(error);
    showToast("Failed to load drivers", "error");
    return;
}
}


// ================= FILE UPLOAD =================
async function uploadFile(file) {
    const name = Date.now() + file.name;

    await sb.storage.from('chat-files').upload(name, file);

    return sb.storage.from('chat-files').getPublicUrl(name).data.publicUrl;
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
  showLoader();

  try {
    const { data } = await sb
      .from('messages')
      .select('sender_id, receiver_id, message, file_url, created_at')
      .or(`
        and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),
        and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})
      `)
      .order('created_at', { ascending: true });

    const chatBox = document.getElementById("adminChat");
    chatBox.innerHTML = "";

   if (!data || data.length === 0) {
    chatBox.innerHTML = "No messages yet";
    return;
}

    data.forEach(msg => {
      const div = document.createElement("div");
      const isAdmin = msg.sender_id === currentUser.id;

      div.textContent = `${isAdmin ? 'Admin' : 'User'}: ${msg.message || ''}`;
      chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (err) {
    console.error(err);
  } finally {
    hideLoader(); // ✅ ONLY here
  }
}
 
//============admin send message=======
async function sendAdminMessage() {
  if (!selectedUserId) {
    showToast("Select a user first", "error");
    return;
  }

  showLoader();

  try {
    const input = document.getElementById("adminInput");
    const fileInput = document.getElementById("adminFile");

    let fileUrl = null;

    if (fileInput && fileInput.files.length > 0) {
      const file = fileInput.files[0];

      const { data } = await sb.storage
        .from('chat-files')
        .upload(`admin/${Date.now()}_${file.name}`, file);

      fileUrl = sb.storage
        .from('chat-files')
        .getPublicUrl(data.path).data.publicUrl;
    }

    if (!input.value && !fileUrl) {
      showToast("Message is empty", "error");
      hideLoader();
      return;
    }

    const { error } = await sb.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: selectedUserId,
      message: input.value,
      file_url: fileUrl
    });

    if (error) throw error;

    input.value = "";
    fileInput.value = "";

    loadAdminChat(selectedUserId);

  } catch (err) {
    console.error(err);
    showToast("Failed to send", "error");
  } finally {
    hideLoader(); // ✅ correct
  }
}
// ================= BUSES =================
async function addBus() {
    showLoader();
    try {
        const name = document.getElementById('busName').value;
        const category = document.getElementById('busCategory').value;
        const services = document.getElementById('busServices').value;
        const file = document.getElementById('busImage').files[0];

        let image_url = null;
        if (file) image_url = await uploadFile(file);

        const { error } = await sb.from('buses').insert({
            name,
            category,
            services,
            image_url
        });

        if (error) throw error;

        showToast('Bus added', 'success');

    } catch (err) {
        console.error(err);
        showToast("Failed to add bus", "error");
    } finally {
        hideLoader(); // ✅ ALWAYS runs
    }
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
    showLoader();
   const { data, error } = await sb.from('driver_earnings').select('*');

if (error) {
    hideLoader(); 
  console.error(error);
  showToast("Failed to load locations", "error");
  return;
}
    const container = document.getElementById('trackingList');

    container.innerHTML = data.map(d => `
        <div class="trip-item">
            <strong>${d.driver_name}</strong><br>
            Lat: ${d.latitude} | Lng: ${d.longitude}<br>
            Updated: ${new Date(d.updated_at).toLocaleTimeString()}
        </div>
    `).join('');
    hideLoader(); 
}


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
    const { data } = await sb
        .from('driver_earnings')
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
sb
.channel('map-tracking')
.on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'driver_earnings'
}, payload => {
    loadDriverLocationsOnMap();
})
.subscribe();
// ================= REVIEWS =================
async function loadAllReviews() {
    const { data } = await sb.from('reviews').select('*');

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

    const { error } = await sb.auth.updateUser({
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
       initLocationRealtime();

});
let locationChannel;

function initLocationRealtime() {
  if (locationChannel) return;

  locationChannel = sb
    .channel('locations')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'driver_earnings'
    }, () => loadLiveLocations())
    .subscribe();
}

let messageChannel;

function initRealtimeMessages() {
  if (messageChannel) return;

  messageChannel = sb
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