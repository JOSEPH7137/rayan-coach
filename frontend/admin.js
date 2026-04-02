// Admin Dashboard Logic
let currentPage = 'dashboard';
let currentUser = null;
let userProfile = null;

// Check session on page load - USING LOCALSTORAGE
(async function() {
    // Get user from localStorage
    const storedUser = localStorage.getItem('rayan_user');
    
    if (!storedUser) {
        console.log('No user found, redirecting to login');
        window.location.href = 'role-selection.html';
        return;
    }
    
    const userData = JSON.parse(storedUser);
    
    // Check if user is admin
    if (userData.role !== 'admin') {
        showToast('Access denied. Admin privileges required.', 'error');
        window.location.href = 'role-selection.html';
        return;
    }
    
    currentUser = userData;
    userProfile = userData;
    
    // Update UI with user info
    const userNameElement = document.getElementById('userName');
    const userAvatarElement = document.getElementById('userAvatar');
    if (userNameElement) userNameElement.textContent = userData.name || userData.email;
    if (userAvatarElement) userAvatarElement.textContent = (userData.name || userData.email).charAt(0);
    
    console.log('Admin authenticated:', userData.name);
    
    // Also verify with Supabase session (optional, for extra security)
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session) {
        // Session expired, but we still have localStorage
        console.log('Supabase session expired, but localStorage valid');
    }
    
    // Load dashboard content
    loadPageContent('dashboard');
})();

// Rest of your admin-dashboard.js functions remain the same...
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

function navigateTo(page) {
    currentPage = page;
    
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        }
    });
    
    const titles = {
        dashboard: 'Admin Dashboard', tracking: 'Live Tracking', 
        drivers: 'Drivers Management', fleet: 'Fleet Management', 
        dispatch: 'Dispatch Center', payments: 'Payments & Finance', 
        compliance: 'Compliance', analytics: 'Analytics & Reports', 
        audit: 'Audit Logs', settings: 'Settings',
        reviews: 'Reviews Management'
    };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[page] || 'Admin Dashboard';
    loadPageContent(page);
}

function loadPageContent(page) {
    const content = document.getElementById('pageContent');
    if (!content) return;
    
    const pages = {
        dashboard: `
            <div class="welcome-banner"><div><h2>Welcome back, ${userProfile?.name || 'Admin'}! 🛡️</h2><p>System running smoothly. 14 active trips today.</p></div><button class="btn-dashboard btn-primary" onclick="navigateTo('analytics')"><i class="fas fa-chart-line"></i> View Reports</button></div>
            <div class="stats-grid-dashboard">
                <div class="stat-card-dashboard"><div class="stat-header"><div class="stat-icon-dashboard"><i class="fas fa-bus"></i></div></div><div class="stat-value-dashboard">14</div><div class="stat-label-dashboard">Active Trips</div><div class="stat-trend" style="color: var(--gold);">Today</div></div>
                <div class="stat-card-dashboard"><div class="stat-header"><div class="stat-icon-dashboard"><i class="fas fa-money-bill-wave"></i></div></div><div class="stat-value-dashboard">KES 84K</div><div class="stat-label-dashboard">Revenue Today</div><div class="stat-trend" style="color: var(--green);">↑ 15%</div></div>
                <div class="stat-card-dashboard"><div class="stat-header"><div class="stat-icon-dashboard"><i class="fas fa-users"></i></div></div><div class="stat-value-dashboard">31</div><div class="stat-label-dashboard">Active Drivers</div><div class="stat-trend" style="color: var(--green);">All on duty</div></div>
                <div class="stat-card-dashboard"><div class="stat-header"><div class="stat-icon-dashboard"><i class="fas fa-exclamation-triangle"></i></div></div><div class="stat-value-dashboard">3</div><div class="stat-label-dashboard">Active Alerts</div><div class="stat-trend" style="color: var(--red);">Requires attention</div></div>
            </div>
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-clock"></i><span>Recent Activity</span></div>
                <table class="data-table"><thead><tr><th>Time</th><th>Event</th><th>Status</th></tr></thead><tbody>
                    <tr><td>07:30 AM</td><td>Nairobi → Mombasa Trip Started</td><td><span class="trip-status status-upcoming">Active</span></td></tr>
                    <tr><td>06:45 AM</td><td>Driver James Mwangi Clocked In</td><td><span class="trip-status status-completed">Completed</span></td></tr>
                    <tr><td>Yesterday</td><td>New Vehicle Added (RC-025)</td><td><span class="trip-status status-completed">Added</span></td></tr>
                </tbody>
            </table>
            </div>
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-trophy"></i><span>Top Performing Drivers</span></div>
                <table class="data-table"><thead><tr><th>Driver</th><th>Trips</th><th>Rating</th><th>On-time Rate</th></tr></thead><tbody>
                    <tr><td>James Mwangi</td><td>124</td><td>4.9 ★</td><td>98%</td></tr>
                    <tr><td>Peter Omondi</td><td>98</td><td>4.8 ★</td><td>96%</td></tr>
                    <tr><td>Mary Wanjiku</td><td>87</td><td>4.9 ★</td><td>97%</td></tr>
                </tbody>
            </table>
            </div>
        `,
        drivers: `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-users"></i><span>Drivers Management</span>
                    <button class="btn-dashboard btn-primary" style="margin-left: auto;" onclick="openAddDriverModal()">+ Add Driver</button>
                </div>
                <div id="driversList"><div class="trip-item"><div><h4>Loading drivers...</h4></div></div></div>
            </div>
            <div id="addDriverModal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--card); padding: 30px; border-radius: 16px; z-index: 1000; min-width: 400px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                <h3 style="margin-bottom: 20px;">Add New Driver</h3>
                <div class="form-group"><label>Full Name *</label><input type="text" id="driverName" class="input" placeholder="Enter driver's full name"></div>
                <div class="form-group"><label>Email *</label><input type="email" id="driverEmail" class="input" placeholder="driver@example.com"></div>
                <div class="form-group"><label>Phone</label><input type="tel" id="driverPhone" class="input" placeholder="Phone number"></div>
                <div class="form-group"><label>PSV License Number</label><input type="text" id="driverLicense" class="input" placeholder="PSV-KE-2024-XXXXX"></div>
                <div class="action-buttons" style="display: flex; gap: 12px; margin-top: 20px;">
                    <button class="btn-dashboard btn-primary" onclick="addDriver()">Add Driver</button>
                    <button class="btn-dashboard btn-outline" onclick="closeAddDriverModal()">Cancel</button>
                </div>
            </div>
            <div id="modalOverlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999;" onclick="closeAddDriverModal()"></div>
        `,
        reviews: `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-star"></i><span>All Reviews</span></div>
                <div class="form-group">
                    <label>Filter by Type</label>
                    <select class="input" id="reviewFilter" onchange="filterReviews()">
                        <option value="all">All Reviews</option>
                        <option value="journey">Journey Reviews</option>
                        <option value="driver">Driver Reviews</option>
                    </select>
                </div>
                <div id="allReviewsList"><div class="trip-item"><div><h4>Loading reviews...</h4></div></div></div>
            </div>
            <div class="dashboard-card mt-16">
                <div class="card-title"><i class="fas fa-chart-line"></i><span>Review Statistics</span></div>
                <div id="adminReviewStats">
                    <div class="stats-grid-dashboard" style="grid-template-columns: repeat(4, 1fr);">
                        <div class="stat-card-dashboard"><div class="stat-value-dashboard" id="totalAllReviews">0</div><div class="stat-label-dashboard">Total Reviews</div></div>
                        <div class="stat-card-dashboard"><div class="stat-value-dashboard" id="avgAllRating">0.0</div><div class="stat-label-dashboard">Average Rating</div></div>
                        <div class="stat-card-dashboard"><div class="stat-value-dashboard" id="fiveStarTotal">0</div><div class="stat-label-dashboard">5-Star Reviews</div></div>
                        <div class="stat-card-dashboard"><div class="stat-value-dashboard" id="reviewsWithComments">0</div><div class="stat-label-dashboard">With Comments</div></div>
                    </div>
                </div>
            </div>
        `
    };
    
    content.innerHTML = pages[page] || pages.dashboard;
    
    if (page === 'drivers') {
        setTimeout(() => loadDrivers(), 100);
    }
    if (page === 'reviews') {
        setTimeout(() => loadAllReviews(), 100);
    }
}

// Admin functions
function createTrip() { showToast('Trip created successfully!', 'success'); }
function processPayouts() { showToast('Processing driver payouts...', 'info'); }
function sendReminder(name) { showToast(`Reminder sent to ${name}`, 'success'); }
function downloadReport() { showToast('Downloading report...', 'info'); }
function exportData() { showToast('Exporting data to CSV...', 'info'); }
function saveSettings() { showToast('Settings saved successfully!', 'success'); }
function resetSettings() { showToast('Settings reset to defaults', 'info'); }

// Driver Management Functions
async function loadDrivers() {
    try {
        const { data: drivers, error } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('role', 'driver')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const driversList = document.getElementById('driversList');
        if (driversList) {
            if (drivers && drivers.length > 0) {
                driversList.innerHTML = `
                    <table class="data-table">
                        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Driver Code</th><th>License</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            ${drivers.map(driver => `
                                <tr>
                                    <td>${driver.name || '-'}</td>
                                    <td>${driver.email}</td>
                                    <td>${driver.phone || '-'}</td>
                                    <td><strong style="color: var(--gold);">${driver.driver_code || 'N/A'}</strong></td>
                                    <td>${driver.driver_license || '-'}</td>
                                    <td><span class="badge ${driver.is_approved ? 'badge-green' : 'badge-red'}">${driver.is_approved ? 'Active' : 'Pending'}</span></td>
                                    <td><button class="btn-dashboard btn-outline btn-sm" onclick="copyDriverCode('${driver.driver_code}')">Copy Code</button>
                                    <button class="btn-dashboard btn-outline btn-sm" onclick="deleteDriver('${driver.id}')">Delete</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                driversList.innerHTML = '<div class="trip-item"><div><h4>No drivers found</h4><p>Click "Add Driver" to create one</p></div></div>';
            }
        }
    } catch (error) {
        console.error('Error loading drivers:', error);
        showToast('Error loading drivers', 'error');
    }
}

async function addDriver() {
    const name = document.getElementById('driverName')?.value.trim();
    const email = document.getElementById('driverEmail')?.value.trim();
    const phone = document.getElementById('driverPhone')?.value.trim();
    const license = document.getElementById('driverLicense')?.value.trim();
    
    if (!name || !email) {
        showToast('Please fill in name and email', 'error');
        return;
    }
    
    const addBtn = event.target;
    const originalText = addBtn.textContent;
    addBtn.disabled = true;
    addBtn.textContent = 'Adding...';
    
    try {
        const { data: existingDriver } = await window.supabase
            .from('profiles')
            .select('email')
            .eq('email', email)
            .single();
        
        if (existingDriver) {
            showToast('A user with this email already exists', 'error');
            addBtn.disabled = false;
            addBtn.textContent = originalText;
            return;
        }
        
        const driverCode = generateDriverCode();
        
        const { error } = await window.supabase
            .from('profiles')
            .insert({
                name: name,
                email: email,
                phone: phone || null,
                driver_license: license || null,
                role: 'driver',
                driver_code: driverCode,
                is_approved: true
            });
        
        if (error) throw error;
        
        showToast(`Driver added successfully! Driver Code: ${driverCode}`, 'success');
        closeAddDriverModal();
        loadDrivers();
    } catch (error) {
        console.error('Error adding driver:', error);
        showToast(error.message || 'Error adding driver', 'error');
    } finally {
        addBtn.disabled = false;
        addBtn.textContent = originalText;
    }
}

function generateDriverCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function copyDriverCode(code) {
    if (code) {
        navigator.clipboard.writeText(code);
        showToast(`Driver code ${code} copied to clipboard!`, 'success');
    }
}

async function deleteDriver(driverId) {
    if (confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
        const { error } = await window.supabase
            .from('profiles')
            .delete()
            .eq('id', driverId);
        
        if (error) {
            showToast('Error deleting driver', 'error');
        } else {
            showToast('Driver deleted successfully', 'success');
            loadDrivers();
        }
    }
}

function openAddDriverModal() {
    const modal = document.getElementById('addDriverModal');
    const overlay = document.getElementById('modalOverlay');
    if (modal) modal.style.display = 'block';
    if (overlay) overlay.style.display = 'block';
}

function closeAddDriverModal() {
    const modal = document.getElementById('addDriverModal');
    const overlay = document.getElementById('modalOverlay');
    if (modal) modal.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    
    const inputs = ['driverName', 'driverEmail', 'driverPhone', 'driverLicense'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

// Reviews Functions
async function loadAllReviews() {
    try {
        const { data: reviews, error } = await window.supabase
            .from('reviews')
            .select(`*, profiles:user_id (name, email), drivers:driver_id (name)`)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const total = reviews.length;
        const avg = total > 0 ? (reviews.reduce((sum, r) => sum + (r.overall_rating || r.journey_rating), 0) / total).toFixed(1) : 0;
        const fiveStar = reviews.filter(r => (r.overall_rating || r.journey_rating) === 5).length;
        const withComments = reviews.filter(r => r.comment && r.comment.trim().length > 0).length;
        
        const totalEl = document.getElementById('totalAllReviews');
        const avgEl = document.getElementById('avgAllRating');
        const fiveStarEl = document.getElementById('fiveStarTotal');
        const commentsEl = document.getElementById('reviewsWithComments');
        
        if (totalEl) totalEl.textContent = total;
        if (avgEl) avgEl.textContent = avg;
        if (fiveStarEl) fiveStarEl.textContent = fiveStar;
        if (commentsEl) commentsEl.textContent = withComments;
        
        const reviewsList = document.getElementById('allReviewsList');
        if (reviewsList) {
            if (reviews.length > 0) {
                reviewsList.innerHTML = reviews.map(review => `
                    <div class="trip-item">
                        <div>
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                                <div>
                                    <div class="rating-display">
                                        ${Array(review.overall_rating || review.journey_rating).fill('<i class="fas fa-star" style="color: #FFD700;"></i>').join('')}
                                        ${Array(5 - (review.overall_rating || review.journey_rating)).fill('<i class="far fa-star" style="color: var(--muted);"></i>').join('')}
                                    </div>
                                    <span style="color: var(--gold); font-size: 12px;">${review.overall_rating || review.journey_rating}/5</span>
                                </div>
                                <span style="color: var(--muted); font-size: 11px;">${new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4>${review.route || 'Journey'}</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px;">
                                <div><strong>Passenger:</strong> ${review.profiles?.name || 'Unknown'}<br><small>${review.profiles?.email || ''}</small></div>
                                <div><strong>Driver:</strong> ${review.drivers?.name || 'Not assigned'}</div>
                            </div>
                            <div style="display: flex; gap: 16px; margin-top: 12px;">
                                <span>🚗 Journey: ${review.journey_rating}/5</span>
                                <span>👨‍✈️ Driver: ${review.driver_rating}/5</span>
                            </div>
                            ${review.comment ? `<div style="margin-top: 12px; background: var(--card2); padding: 12px; border-radius: 8px;">
                                <strong>💬 Passenger Comment:</strong>
                                <p style="margin-top: 5px; font-style: italic;">"${review.comment}"</p>
                            </div>` : ''}
                        </div>
                    </div>
                `).join('');
            } else {
                reviewsList.innerHTML = '<div class="trip-item"><div><h4>No reviews yet</h4><p>Reviews will appear here when passengers submit them</p></div></div>';
            }
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

function filterReviews() { loadAllReviews(); }

async function handleAdminLogout() { await logoutUser(); }

// Initialize page - FIXED (no duplicate session checks)
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    // Session is already checked in the IIFE at the top
});

// Make functions global
window.toggleSidebar = toggleSidebar;
window.navigateTo = navigateTo;
window.createTrip = createTrip;
window.processPayouts = processPayouts;
window.sendReminder = sendReminder;
window.downloadReport = downloadReport;
window.exportData = exportData;
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.handleAdminLogout = handleAdminLogout;
window.loadAllReviews = loadAllReviews;
window.filterReviews = filterReviews;
window.loadDrivers = loadDrivers;
window.addDriver = addDriver;
window.copyDriverCode = copyDriverCode;
window.deleteDriver = deleteDriver;
window.openAddDriverModal = openAddDriverModal;
window.closeAddDriverModal = closeAddDriverModal;