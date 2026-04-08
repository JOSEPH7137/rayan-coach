// ================= AUTH CHECK =================
(async () => {
    const user = await getCurrentUser();

    if (!user) {
        showToast("❌ Please log in first", "error");
        window.location.href = "auth.html";
        return;
    }

    if (user.role !== "admin") {
        showToast("❌ Access denied. You are not an admin.", "error");
        await logoutUser();
        return;
    }

    console.log(`✅ Welcome ${user.name}, role: ${user.role}`);
})();


// ================= GLOBAL STATE =================
let currentPage = 'dashboard';
let currentUser = null;
let userProfile = null;


// ================= SESSION CHECK =================
(async function() {
    const storedUser = localStorage.getItem('rayan_user');

    if (!storedUser) {
        window.location.href = 'role-selection.html';
        return;
    }

    const userData = JSON.parse(storedUser);

    if (userData.role !== 'admin') {
        showToast('Access denied. Admin privileges required.', 'error');
        window.location.href = 'role-selection.html';
        return;
    }

    currentUser = userData;
    userProfile = userData;

    document.getElementById('userName').textContent = userData.name || userData.email;
    document.getElementById('userAvatar').textContent = (userData.name || userData.email).charAt(0);

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
    await window.supabase.from('messages').insert({
        sender_id: currentUser.id,
        receiver_id,
        message: text,
        file_url
    });
}

async function loadAllMessages() {
    const { data } = await window.supabase.from('messages').select('*');

    console.log(data);
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


// ================= REVIEWS =================
async function loadAllReviews() {
    const { data } = await window.supabase.from('reviews').select('*');

    document.getElementById('allReviewsList').innerHTML =
        data.map(r => `<div>${r.comment || 'No comment'}</div>`).join('');
}


// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
    initRealtimeMessages();
});


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