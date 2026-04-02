// Admin Dashboard Logic
let currentPage = 'dashboard';
let currentUser = null;
let userProfile = null;

// Check admin access at start
(async function() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'role-selection.html';
        return;
    }
    if (user.role !== 'admin') {
        showToast('Access denied. Admin privileges required.', 'error');
        window.location.href = 'role-selection.html';
        return;
    }
})();

function toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('open');
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
    document.getElementById('pageTitle').textContent = titles[page] || 'Admin Dashboard';
    loadPageContent(page);
}

function loadPageContent(page) {
    const content = document.getElementById('pageContent');
    
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
        tracking: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-map-marked-alt"></i><span>Live Fleet Tracking</span></div>
                <div class="map-placeholder" style="background: var(--card2); border-radius: 12px; padding: 60px; text-align: center;"><i class="fas fa-map" style="font-size: 64px; color: var(--gold); margin-bottom: 16px; display: block;"></i><p>Live GPS Tracking Map</p><p style="font-size: 12px;">14 active buses on the road</p></div>
                <div class="stats-grid-dashboard" style="grid-template-columns: repeat(3, 1fr); margin-top: 20px;">
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">14</div><div class="stat-label-dashboard">Buses En Route</div></div>
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">8</div><div class="stat-label-dashboard">At Terminals</div></div>
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">2</div><div class="stat-label-dashboard">Maintenance</div></div>
                </div>
            </div>
        `,
        drivers: `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-users"></i><span>Drivers Management</span>
                    <button class="btn-dashboard btn-primary" style="margin-left: auto;" onclick="openAddDriverModal()">+ Add Driver</button>
                </div>
                <div id="driversList">
                    <div class="trip-item"><div><h4>Loading drivers...</h4></div></div>
                </div>
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
        fleet: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-bus"></i><span>Fleet Management</span><button class="btn-dashboard btn-primary" style="margin-left: auto;" onclick="showToast('Add vehicle form opened','info')">+ Add Vehicle</button></div>
                <table class="data-table"><thead><tr><th>Bus No.</th><th>Model</th><th>Capacity</th><th>Status</th><th>Last Service</th><th>Actions</th></tr></thead><tbody>
                    <tr><td>RC-001</td><td>Scania Higer</td><td>52</td><td><span class="trip-status status-upcoming">Active</span></td><td>Mar 15, 2025</td><td><button class="btn-dashboard btn-outline btn-sm" onclick="showToast('View details','info')">View</button></td></tr>
                    <tr><td>RC-002</td><td>Volvo B11R</td><td>50</td><td><span class="trip-status status-upcoming">Active</span></td><td>Mar 10, 2025</td><td><button class="btn-dashboard btn-outline btn-sm" onclick="showToast('View details','info')">View</button></td></tr>
                    <tr><td>RC-003</td><td>Mercedes Benz</td><td>48</td><td><span class="trip-status status-upcoming">Active</span></td><td>Mar 5, 2025</td><td><button class="btn-dashboard btn-outline btn-sm" onclick="showToast('View details','info')">View</button></td></tr>
                    <tr><td>RC-004</td><td>Isuzu</td><td>45</td><td><span class="trip-status status-completed">Maintenance</span></td><td>Feb 28, 2025</td><td><button class="btn-dashboard btn-outline btn-sm" onclick="showToast('View details','info')">View</button></td></tr>
                </tbody>
            </table>
            </div>
        `,
        dispatch: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-tasks"></i><span>Dispatch Center</span></div>
                <div class="form-group"><label>Create New Trip</label><select class="input" id="tripRoute"><option>Nairobi → Mombasa</option><option>Nairobi → Kisumu</option><option>Mombasa → Nairobi</option><option>Kisumu → Nairobi</option></select></div>
                <div class="form-group"><label>Departure Time</label><input type="datetime-local" class="input" id="tripDeparture"></div>
                <div class="form-group"><label>Assign Driver</label><select class="input" id="tripDriver"><option>James Mwangi</option><option>Peter Omondi</option><option>Mary Wanjiku</option></select></div>
                <div class="form-group"><label>Assign Bus</label><select class="input" id="tripBus"><option>RC-001 (52 seats)</option><option>RC-002 (50 seats)</option><option>RC-003 (48 seats)</option></select></div>
                <button class="btn-dashboard btn-primary" onclick="createTrip()">Create Trip</button>
                <div class="divider" style="margin: 20px 0;"></div>
                <div class="card-title"><i class="fas fa-route"></i><span>Scheduled Trips Today</span></div>
                <div class="trip-item"><div><h4>07:00 - Nairobi → Mombasa</h4><p>Driver: James Mwangi • Bus: RC-001</p></div><button class="btn-dashboard btn-outline btn-sm" onclick="showToast('Trip details','info')">Manage</button></div>
                <div class="trip-item"><div><h4>10:30 - Nairobi → Kisumu</h4><p>Driver: Peter Omondi • Bus: RC-002</p></div><button class="btn-dashboard btn-outline btn-sm" onclick="showToast('Trip details','info')">Manage</button></div>
                <div class="trip-item"><div><h4>14:00 - Mombasa → Nairobi</h4><p>Driver: Mary Wanjiku • Bus: RC-003</p></div><button class="btn-dashboard btn-outline btn-sm" onclick="showToast('Trip details','info')">Manage</button></div>
            </div>
        `,
        payments: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-credit-card"></i><span>Payments & Finance</span></div>
                <div class="stats-grid-dashboard" style="grid-template-columns: repeat(4, 1fr);">
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">KES 84K</div><div class="stat-label-dashboard">Today</div></div>
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">KES 520K</div><div class="stat-label-dashboard">This Week</div></div>
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">KES 2.1M</div><div class="stat-label-dashboard">This Month</div></div>
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">KES 8.4M</div><div class="stat-label-dashboard">Year to Date</div></div>
                </div>
                <div class="card-title"><i class="fas fa-clock"></i><span>Recent Transactions</span></div>
                <table class="data-table"><thead><tr><th>Transaction ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead><tbody>
                    <tr><td>TRX-001</td><td>John Kamau</td><td>KES 1,500</td><td><span class="trip-status status-completed">Completed</span></td></tr>
                    <tr><td>TRX-002</td><td>Mary Wanjiku</td><td>KES 2,000</td><td><span class="trip-status status-completed">Completed</span></td></tr>
                    <tr><td>TRX-003</td><td>Peter Omondi</td><td>KES 1,200</td><td><span class="trip-status status-upcoming">Pending</span></td></tr>
                </tbody>
            </table>
                <button class="btn-dashboard btn-primary mt-16" onclick="processPayouts()">Process Driver Payouts</button>
            </div>
        `,
        compliance: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-file-alt"></i><span>Compliance Dashboard</span></div>
                <div class="stats-grid-dashboard" style="grid-template-columns: repeat(3, 1fr);">
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">3</div><div class="stat-label-dashboard">License Expiring Soon</div></div>
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">2</div><div class="stat-label-dashboard">Insurance Due</div></div>
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">100%</div><div class="stat-label-dashboard">Compliance Rate</div></div>
                </div>
                <div class="card-title"><i class="fas fa-clock"></i><span>Upcoming Renewals</span></div>
                <div class="trip-item"><div><h4>PSV License - James Mwangi</h4><p>Expires: May 15, 2025 • 15 days left</p></div><button class="btn-dashboard btn-primary btn-sm" onclick="sendReminder('James Mwangi')">Remind</button></div>
                <div class="trip-item"><div><h4>Insurance - Bus RC-001</h4><p>Expires: May 20, 2025 • 20 days left</p></div><button class="btn-dashboard btn-primary btn-sm" onclick="sendReminder('RC-001')">Remind</button></div>
            </div>
        `,
        analytics: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-chart-pie"></i><span>Analytics & Reports</span></div>
                <div class="stats-grid-dashboard">
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">+23%</div><div class="stat-label-dashboard">Revenue Growth</div></div>
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">94%</div><div class="stat-label-dashboard">Occupancy Rate</div></div>
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">4.8 ★</div><div class="stat-label-dashboard">Avg Customer Rating</div></div>
                </div>
                <div class="card-title"><i class="fas fa-chart-line"></i><span>Monthly Revenue Trend</span></div>
                <div class="mini-chart" style="height: 200px; background: var(--card2); border-radius: 12px; padding: 20px; text-align: center;">
                    <i class="fas fa-chart-line" style="font-size: 48px; color: var(--gold);"></i>
                    <p>Revenue increased by 23% this month</p>
                </div>
                <div class="action-buttons mt-16"><button class="btn-dashboard btn-primary" onclick="downloadReport()"><i class="fas fa-download"></i> Download Report</button><button class="btn-dashboard btn-outline" onclick="exportData()"><i class="fas fa-file-excel"></i> Export CSV</button></div>
            </div>
        `,
        audit: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-history"></i><span>Audit Logs</span></div>
                <table class="data-table"><thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Details</th></tr></thead><tbody>
                    <tr><td>2025-03-28 07:30</td><td>Admin Rayan</td><td>User Login</td><td>Successful login from 192.168.1.1</td></tr>
                    <tr><td>2025-03-28 07:15</td><td>Admin Rayan</td><td>Driver Added</td><td>New driver: John Otieno</td></tr>
                    <tr><td>2025-03-27 18:30</td><td>Admin Rayan</td><td>Vehicle Added</td><td>New bus: RC-025</td></tr>
                    <tr><td>2025-03-27 14:20</td><td>Admin Rayan</td><td>Settings Changed</td><td>Fare rates updated</td></tr>
                </tbody>
            </table>
            </div>
        `,
        settings: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-cog"></i><span>System Settings</span></div>
                <div class="form-group"><label>Company Name</label><input type="text" class="input" id="companyName" value="Rayan Coach Kenya"></div>
                <div class="form-group"><label>Contact Email</label><input type="email" class="input" id="contactEmail" value="info@rayan.co.ke"></div>
                <div class="form-group"><label>Support Phone</label><input type="tel" class="input" id="supportPhone" value="+254 745 129233"></div>
                <div class="form-group"><label>Default Fare Rate (per km)</label><input type="text" class="input" id="fareRate" value="KES 8.50"></div>
                <div class="form-group"><label>Maintenance Alert Threshold (days)</label><input type="number" class="input" id="alertThreshold" value="30"></div>
                <div class="action-buttons"><button class="btn-dashboard btn-primary" onclick="saveSettings()">Save Changes</button><button class="btn-dashboard btn-outline" onclick="resetSettings()">Reset Defaults</button></div>
            </div>
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
                <div id="allReviewsList">
                    <div class="trip-item"><div><h4>Loading reviews...</h4></div></div>
                </div>
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
        setTimeout(() => {
            loadDrivers();
        }, 100);
    }
    
    if (page === 'reviews') {
        setTimeout(() => {
            loadAllReviews();
        }, 100);
    }
}

// Admin functions
function createTrip() {
    showToast('Trip created successfully!', 'success');
}

function processPayouts() {
    showToast('Processing driver payouts...', 'info');
}

function sendReminder(name) {
    showToast(`Reminder sent to ${name}`, 'success');
}

function downloadReport() {
    showToast('Downloading report...', 'info');
}

function exportData() {
    showToast('Exporting data to CSV...', 'info');
}

function saveSettings() {
    showToast('Settings saved successfully!', 'success');
}

function resetSettings() {
    showToast('Settings reset to defaults', 'info');
}

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
                        <thead>
                            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Driver Code</th><th>License</th><th>Status</th><th>Actions</th></tr>
                        </thead>
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
    const name = document.getElementById('driverName').value.trim();
    const email = document.getElementById('driverEmail').value.trim();
    const phone = document.getElementById('driverPhone').value.trim();
    const license = document.getElementById('driverLicense').value.trim();
    
    if (!name || !email) {
        showToast('Please fill in name and email', 'error');
        return;
    }
    
    const addBtn = event.target;
    const originalText = addBtn.textContent;
    addBtn.disabled = true;
    addBtn.textContent = 'Adding...';
    
    try {
        // Check if driver already exists
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
        
        // Generate a unique driver code
        const driverCode = generateDriverCode();
        
        // Create driver profile
        const { data, error } = await window.supabase
            .from('profiles')
            .insert({
                name: name,
                email: email,
                phone: phone || null,
                driver_license: license || null,
                role: 'driver',
                driver_code: driverCode,
                is_approved: true
            })
            .select();
        
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
    } else {
        showToast('No driver code to copy', 'error');
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
    
    document.getElementById('driverName').value = '';
    document.getElementById('driverEmail').value = '';
    document.getElementById('driverPhone').value = '';
    document.getElementById('driverLicense').value = '';
}

// Reviews Functions
async function loadAllReviews() {
    try {
        const { data: reviews, error } = await window.supabase
            .from('reviews')
            .select(`
                *,
                profiles:user_id (name, email),
                drivers:driver_id (name)
            `)
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

function filterReviews() {
    loadAllReviews();
}

async function handleAdminLogout() {
    await logoutUser();
}

async function loadUserData() {
    const user = await getCurrentUser();
    if (user) {
        currentUser = user;
        const { data: profile } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        userProfile = profile;
        document.getElementById('userName').textContent = profile?.name || user.email;
        document.getElementById('userAvatar').textContent = profile?.name?.charAt(0) || user.email?.charAt(0);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    loadTheme();
    
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session) {
        window.location.href = 'role-selection.html';
        return;
    }
    
    const { data: profile } = await window.supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
    
    if (profile?.role !== 'admin') {
        showToast('Unauthorized access. Admin privileges required.', 'error');
        window.location.href = 'role-selection.html';
        return;
    }
    
    await loadUserData();
    loadPageContent('dashboard');
    
    document.querySelectorAll('.sidebar-nav-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => { 
            e.preventDefault(); 
            navigateTo(item.getAttribute('data-page')); 
        });
    });
});

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