// Check session on page load
(async function() {
    const loggedIn = sessionStorage.getItem('logged_in');
    const loginTime = sessionStorage.getItem('login_time');
    
    if (!loggedIn) {
        window.location.href = 'role-selection.html';
        return;
    }
    
    // Check if session expired (24 hours)
    if (loginTime && (Date.now() - parseInt(loginTime)) > 24 * 60 * 60 * 1000) {
        sessionStorage.clear();
        window.location.href = 'role-selection.html';
        return;
    }
    
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'role-selection.html';
        return;
    }
})();
// Driver Dashboard Logic
let currentPage = 'dashboard';
let currentUser = null;
let userProfile = null;
let isFirstLogin = false;

// Check driver access at start
(async function() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'role-selection.html';
        return;
    }
    if (user.role !== 'driver') {
        showToast('Access denied. Driver privileges required.', 'error');
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
        dashboard: 'Driver Dashboard', trips: 'My Trips', gps: 'GPS Tracking',
        earnings: 'Earnings', messages: 'Messages', incident: 'Incident Report',
        attendance: 'Attendance', performance: 'Performance', profile: 'Profile',
        reviews: 'My Reviews'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Driver Dashboard';
    loadPageContent(page);
}

function loadPageContent(page) {
    const content = document.getElementById('pageContent');
    
    const pages = {
        dashboard: `
            <div class="welcome-banner">
                <div>
                    <h2>Good morning, ${userProfile?.name || 'Driver'}! 🚗</h2>
                    <p>Your next trip: Nairobi → Mombasa at 07:00 AM</p>
                </div>
                <button class="btn-dashboard btn-primary" onclick="startTrip()"><i class="fas fa-play"></i> Start Trip</button>
            </div>
            <div class="stats-grid-dashboard">
                <div class="stat-card-dashboard"><div class="stat-header"><div class="stat-icon-dashboard"><i class="fas fa-money-bill-wave"></i></div></div><div class="stat-value-dashboard">KES 4,200</div><div class="stat-label-dashboard">Today's Earnings</div><div class="stat-trend" style="color: var(--green);"><i class="fas fa-arrow-up"></i> +12%</div></div>
                <div class="stat-card-dashboard"><div class="stat-header"><div class="stat-icon-dashboard"><i class="fas fa-chart-line"></i></div></div><div class="stat-value-dashboard">KES 48,700</div><div class="stat-label-dashboard">This Month</div><div class="stat-trend" style="color: var(--gold);">Target: KES 60K</div></div>
                <div class="stat-card-dashboard"><div class="stat-header"><div class="stat-icon-dashboard"><i class="fas fa-star"></i></div></div><div class="stat-value-dashboard">4.9 ★</div><div class="stat-label-dashboard">Driver Rating</div><div class="stat-trend" style="color: var(--green);">Excellent</div></div>
                <div class="stat-card-dashboard"><div class="stat-header"><div class="stat-icon-dashboard"><i class="fas fa-clock"></i></div></div><div class="stat-value-dashboard">94%</div><div class="stat-label-dashboard">On-time Rate</div><div class="stat-trend" style="color: var(--green);">Above average</div></div>
            </div>
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-calendar-day"></i><span>Today's Trips</span></div>
                <div class="trip-item"><div class="trip-info"><h4>Nairobi → Mombasa</h4><p>Departure: 07:00 AM • Arrival: 12:30 PM • Bus: RC-001 • Seats: 45/52</p></div><span class="trip-status status-upcoming">Upcoming</span></div>
                <div class="trip-item"><div class="trip-info"><h4>Mombasa → Nairobi</h4><p>Departure: 14:00 PM • Arrival: 19:30 PM • Bus: RC-001 • Seats: 38/52</p></div><span class="trip-status status-upcoming">Upcoming</span></div>
            </div>
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-bolt"></i><span>Quick Actions</span></div>
                <div class="action-buttons"><button class="btn-dashboard btn-primary" onclick="startTrip()"><i class="fas fa-play"></i> Start Trip</button><button class="btn-dashboard btn-outline" onclick="navigateTo('incident')"><i class="fas fa-exclamation-triangle"></i> Report Issue</button><button class="btn-dashboard btn-outline" onclick="navigateTo('earnings')"><i class="fas fa-chart-line"></i> View Earnings</button></div>
            </div>
        `,
        trips: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-bus"></i><span>My Trips</span></div>
                <div class="trip-item"><div><h4>Nairobi → Mombasa</h4><p>Date: Today, 07:00 AM • Bus: RC-001 • Duration: 5h 30m</p><p>Passengers: 45/52 • Status: Scheduled</p></div><button class="btn-dashboard btn-primary" onclick="viewTripDetails('RC-001')">View Details</button></div>
                <div class="trip-item"><div><h4>Mombasa → Nairobi</h4><p>Date: Today, 14:00 PM • Bus: RC-001 • Duration: 5h 30m</p><p>Passengers: 38/52 • Status: Scheduled</p></div><button class="btn-dashboard btn-primary" onclick="viewTripDetails('RC-002')">View Details</button></div>
                <div class="trip-item"><div><h4>Nairobi → Kisumu</h4><p>Date: Mar 25, 2025 • Bus: RC-005 • Duration: 6h</p><p>Passengers: 42/52 • Status: Upcoming</p></div><button class="btn-dashboard btn-primary" onclick="viewTripDetails('RC-005')">View Details</button></div>
            </div>
        `,
        gps: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-map-marked-alt"></i><span>GPS Tracking</span></div>
                <div class="map-placeholder" style="background: var(--card2); border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 20px;"><i class="fas fa-map" style="font-size: 48px; color: var(--gold); margin-bottom: 16px; display: block;"></i><p>Your current location: Thika Road, Nairobi</p><p style="font-size: 12px;">Last updated: 2 mins ago</p></div>
                <div class="stats-grid-dashboard" style="grid-template-columns: 1fr 1fr;"><div class="stat-card-dashboard"><div class="stat-value-dashboard">65 km/h</div><div class="stat-label-dashboard">Current Speed</div></div><div class="stat-card-dashboard"><div class="stat-value-dashboard">320 km</div><div class="stat-label-dashboard">Distance Today</div></div></div>
                <button class="btn-dashboard btn-primary" onclick="shareLocation()"><i class="fas fa-share-alt"></i> Share Location</button>
            </div>
        `,
        earnings: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-money-bill-wave"></i><span>Earnings Overview</span></div>
                <div class="stats-grid-dashboard" style="grid-template-columns: 1fr 1fr 1fr;"><div class="stat-card-dashboard"><div class="stat-value-dashboard">KES 4,200</div><div class="stat-label-dashboard">Today</div></div><div class="stat-card-dashboard"><div class="stat-value-dashboard">KES 24,500</div><div class="stat-label-dashboard">This Week</div></div><div class="stat-card-dashboard"><div class="stat-value-dashboard">KES 48,700</div><div class="stat-label-dashboard">This Month</div></div></div>
                <div class="trip-item"><div><h4>Nairobi → Mombasa</h4><p>Today • 45 passengers • Commission: KES 2,500</p></div><span class="trip-status status-completed">Paid</span></div>
                <div class="trip-item"><div><h4>Mombasa → Nairobi</h4><p>Today • 38 passengers • Commission: KES 2,100</p></div><span class="trip-status status-upcoming">Pending</span></div>
                <div class="trip-item"><div><h4>Nairobi → Kisumu</h4><p>Mar 25 • 42 passengers • Commission: KES 2,300</p></div><span class="trip-status status-upcoming">Scheduled</span></div>
            </div>
        `,
        messages: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-comment"></i><span>Messages & Communications</span></div>
                <div class="chat-messages" id="chatMessages" style="height: 350px; overflow-y: auto; background: var(--card2); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                    <div class="chat-message" style="margin-bottom: 12px;"><strong>Dispatch:</strong> Trip RC-001 is ready for departure at 07:00 AM</div>
                    <div class="chat-message" style="margin-bottom: 12px;"><strong>You:</strong> Roger that, preparing for departure</div>
                    <div class="chat-message" style="margin-bottom: 12px;"><strong>Dispatch:</strong> Weather alert: Light rain expected on Mombasa route</div>
                </div>
                <div class="input-group" style="display: flex; gap: 12px;"><input type="text" class="input" placeholder="Type your message..." id="chatInput"><button class="btn-dashboard btn-primary" onclick="sendDriverMessage()">Send</button></div>
            </div>
        `,
        incident: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-exclamation-triangle"></i><span>Report Incident</span></div>
                <div class="form-group"><label>Incident Type</label><select class="input" id="incidentType"><option>Mechanical Issue</option><option>Accident</option><option>Passenger Issue</option><option>Road Hazard</option><option>Other</option></select></div>
                <div class="form-group"><label>Location</label><input type="text" class="input" id="incidentLocation" placeholder="Enter location"></div>
                <div class="form-group"><label>Description</label><textarea class="input" rows="4" id="incidentDescription" placeholder="Describe the incident in detail..."></textarea></div>
                <div class="form-group"><label>Upload Photos (optional)</label><input type="file" class="input" id="incidentPhotos"></div>
                <button class="btn-dashboard btn-danger" style="background: #F04545; color: white;" onclick="submitIncidentReport()">Submit Report</button>
            </div>
        `,
        attendance: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-calendar-check"></i><span>Attendance</span></div>
                <div class="stats-grid-dashboard" style="grid-template-columns: 1fr 1fr 1fr;"><div class="stat-card-dashboard"><div class="stat-value-dashboard">22</div><div class="stat-label-dashboard">Days Worked</div></div><div class="stat-card-dashboard"><div class="stat-value-dashboard">98%</div><div class="stat-label-dashboard">Attendance Rate</div></div><div class="stat-card-dashboard"><div class="stat-value-dashboard">2</div><div class="stat-label-dashboard">Days Off</div></div></div>
                <div class="action-buttons"><button class="btn-dashboard btn-primary" onclick="clockIn()"><i class="fas fa-clock"></i> Clock In</button><button class="btn-dashboard btn-outline" onclick="clockOut()"><i class="fas fa-clock"></i> Clock Out</button></div>
                <div class="trip-item mt-16"><div><h4>This Week's Attendance</h4><p>Mon: Present | Tue: Present | Wed: Present | Thu: Present | Fri: Present</p></div></div>
            </div>
        `,
        performance: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-chart-line"></i><span>Performance Metrics</span></div>
                <div class="stats-grid-dashboard"><div class="stat-card-dashboard"><div class="stat-value-dashboard">4.9 ★</div><div class="stat-label-dashboard">Rating (125 reviews)</div></div><div class="stat-card-dashboard"><div class="stat-value-dashboard">94%</div><div class="stat-label-dashboard">On-time Rate</div></div><div class="stat-card-dashboard"><div class="stat-value-dashboard">98%</div><div class="stat-label-dashboard">Customer Satisfaction</div></div><div class="stat-card-dashboard"><div class="stat-value-dashboard">124</div><div class="stat-label-dashboard">Trips Completed</div></div></div>
                <div class="trip-item"><div><h4>Recent Feedback</h4><p>"Excellent driver, very professional and safe!" - ★★★★★</p><p>"Great communication and smooth ride" - ★★★★★</p></div></div>
            </div>
        `,
        reviews: `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-star"></i><span>My Reviews</span></div>
                <div id="driverReviewsList">
                    <div class="trip-item"><div><h4>Loading reviews...</h4></div></div>
                </div>
            </div>
            <div class="dashboard-card mt-16">
                <div class="card-title"><i class="fas fa-chart-line"></i><span>Rating Summary</span></div>
                <div id="ratingSummary">
                    <div class="stats-grid-dashboard" style="grid-template-columns: 1fr 1fr 1fr;">
                        <div class="stat-card-dashboard"><div class="stat-value-dashboard" id="avgRating">0.0</div><div class="stat-label-dashboard">Average Rating</div></div>
                        <div class="stat-card-dashboard"><div class="stat-value-dashboard" id="totalReviews">0</div><div class="stat-label-dashboard">Total Reviews</div></div>
                        <div class="stat-card-dashboard"><div class="stat-value-dashboard" id="fiveStarCount">0</div><div class="stat-label-dashboard">5-Star Reviews</div></div>
                    </div>
                </div>
            </div>
        `,
        profile: `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-user"></i><span>Complete Your Profile</span></div>
                <p style="color: var(--muted); margin-bottom: 20px;">Please complete your profile information. Fields marked with * are required.</p>
                <div style="text-align: center; margin-bottom: 24px;">
                    <div class="user-avatar" style="width: 80px; height: 80px; font-size: 32px; margin: 0 auto 16px;" id="profileAvatar">${userProfile?.name?.charAt(0) || 'D'}</div>
                    <h3 id="profileName">${userProfile?.name || 'Driver'}</h3>
                    <p style="color: var(--muted);" id="profileEmail">${userProfile?.email || ''}</p>
                </div>
                <div class="form-group"><label>Full Name *</label><input type="text" class="input" id="fullName" value="${userProfile?.name || ''}"></div>
                <div class="form-group"><label>Phone Number *</label><input type="tel" class="input" id="phone" value="${userProfile?.phone || ''}" placeholder="0712345678"></div>
                <div class="form-group"><label>Date of Birth</label><input type="date" class="input" id="dob"></div>
                <div class="form-group"><label>Next of Kin Name</label><input type="text" class="input" id="nextOfKinName" placeholder="Full name of next of kin"></div>
                <div class="form-group"><label>Next of Kin Phone</label><input type="tel" class="input" id="nextOfKinPhone" placeholder="Phone number of next of kin"></div>
                <div class="form-group"><label>Emergency Contact</label><input type="tel" class="input" id="emergencyContact" placeholder="Emergency contact number"></div>
                <div class="form-group"><label>Home Address</label><textarea class="input" rows="2" id="homeAddress" placeholder="Your residential address"></textarea></div>
                <div class="form-group"><label>PSV License Number</label><input type="text" class="input" id="licenseNumber" value="${userProfile?.driver_license || ''}" readonly disabled style="background: var(--card2);"></div>
                <div class="form-group"><label>Driver Code</label><input type="text" class="input" id="driverCodeDisplay" value="${userProfile?.driver_code || ''}" readonly disabled style="background: var(--card2);"></div>
                <button class="btn-dashboard btn-primary" onclick="updateDriverProfile()">Save Profile</button>
            </div>
        `
    };
    
    content.innerHTML = pages[page] || pages.dashboard;
    
    if (page === 'reviews') {
        setTimeout(() => {
            loadDriverReviews();
        }, 100);
    }
    
    if (page === 'profile') {
        checkProfileCompletion();
    }
}

function checkProfileCompletion() {
    // Check if profile is incomplete (first login)
    if (!userProfile?.phone || !userProfile?.next_of_kin_name) {
        showToast('Please complete your profile information', 'info');
    }
}

// Driver specific functions
function startTrip() {
    showToast('Trip started! Safe driving!', 'success');
}

function viewTripDetails(tripId) {
    showToast(`Viewing details for trip ${tripId}`, 'info');
}

function shareLocation() {
    showToast('Location shared with dispatch', 'success');
}

function sendDriverMessage() {
    const input = document.getElementById('chatInput');
    if(input && input.value.trim()) {
        const chatContainer = document.getElementById('chatMessages');
        if(chatContainer) {
            const newMsg = document.createElement('div');
            newMsg.className = 'chat-message';
            newMsg.style.marginBottom = '12px';
            newMsg.innerHTML = `<strong>You:</strong> ${input.value}`;
            chatContainer.appendChild(newMsg);
            input.value = '';
            setTimeout(() => {
                const response = document.createElement('div');
                response.className = 'chat-message';
                response.style.marginBottom = '12px';
                response.innerHTML = `<strong>Dispatch:</strong> Message received. Thank you.`;
                chatContainer.appendChild(response);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 800);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }
}

function submitIncidentReport() {
    const type = document.getElementById('incidentType')?.value;
    const location = document.getElementById('incidentLocation')?.value;
    const description = document.getElementById('incidentDescription')?.value;
    
    if (!location || !description) {
        showToast('Please fill in location and description', 'error');
        return;
    }
    
    showToast('Incident reported! Emergency team notified.', 'error');
    document.getElementById('incidentLocation').value = '';
    document.getElementById('incidentDescription').value = '';
}

function clockIn() {
    const now = new Date();
    showToast(`Clocked in at ${now.toLocaleTimeString()}`, 'success');
}

function clockOut() {
    const now = new Date();
    showToast(`Clocked out at ${now.toLocaleTimeString()}`, 'info');
}

async function updateDriverProfile() {
    const fullName = document.getElementById('fullName')?.value;
    const phone = document.getElementById('phone')?.value;
    const dob = document.getElementById('dob')?.value;
    const nextOfKinName = document.getElementById('nextOfKinName')?.value;
    const nextOfKinPhone = document.getElementById('nextOfKinPhone')?.value;
    const emergencyContact = document.getElementById('emergencyContact')?.value;
    const homeAddress = document.getElementById('homeAddress')?.value;
    
    if (!fullName || !phone) {
        showToast('Please fill in your full name and phone number', 'error');
        return;
    }
    
    const updates = { 
        name: fullName, 
        phone: phone,
        date_of_birth: dob || null,
        next_of_kin_name: nextOfKinName || null,
        next_of_kin_phone: nextOfKinPhone || null,
        emergency_contact: emergencyContact || null,
        home_address: homeAddress || null
    };
    
    const { error } = await window.supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id);
    
    if (error) {
        showToast('Error updating profile', 'error');
        console.error(error);
    } else {
        showToast('Profile updated successfully!', 'success');
        userProfile = { ...userProfile, ...updates };
        document.getElementById('userName').textContent = fullName;
        document.getElementById('profileName').textContent = fullName;
        document.getElementById('profileAvatar').textContent = fullName.charAt(0);
    }
}

async function handleDriverLogout() {
    await logoutUser();
}

async function loadDriverReviews() {
    const driver = await getCurrentUser();
    if (!driver) return;
    
    try {
        const { data: reviews, error } = await window.supabase
            .from('reviews')
            .select(`
                *,
                profiles:user_id (name, email)
            `)
            .eq('driver_id', driver.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const total = reviews.length;
        const avg = total > 0 ? (reviews.reduce((sum, r) => sum + (r.overall_rating || r.driver_rating), 0) / total).toFixed(1) : 0;
        const fiveStar = reviews.filter(r => (r.overall_rating || r.driver_rating) === 5).length;
        
        const avgEl = document.getElementById('avgRating');
        const totalEl = document.getElementById('totalReviews');
        const fiveStarEl = document.getElementById('fiveStarCount');
        
        if (avgEl) avgEl.textContent = avg;
        if (totalEl) totalEl.textContent = total;
        if (fiveStarEl) fiveStarEl.textContent = fiveStar;
        
        const reviewsList = document.getElementById('driverReviewsList');
        if (reviewsList) {
            if (reviews.length > 0) {
                reviewsList.innerHTML = reviews.map(review => `
                    <div class="trip-item">
                        <div>
                            <div class="rating-display" style="margin-bottom: 8px;">
                                ${Array(review.overall_rating || review.driver_rating).fill('<i class="fas fa-star" style="color: #FFD700;"></i>').join('')}
                                ${Array(5 - (review.overall_rating || review.driver_rating)).fill('<i class="far fa-star" style="color: var(--muted);"></i>').join('')}
                                <span style="color: var(--gold); margin-left: 8px;">${review.overall_rating || review.driver_rating}/5</span>
                            </div>
                            <h4>${review.route || 'Journey'}</h4>
                            <p style="color: var(--muted); font-size: 13px;">Passenger: ${review.profiles?.name || 'Anonymous'}</p>
                            <div style="margin-top: 8px;">
                                <span>🚗 Journey: ${review.journey_rating}/5</span> | 
                                <span>👨‍✈️ Driver: ${review.driver_rating}/5</span>
                            </div>
                            ${review.comment ? `<div style="margin-top: 12px; background: var(--card2); padding: 12px; border-radius: 8px;">
                                <strong>💬 Passenger Comment:</strong>
                                <p style="margin-top: 5px;">"${review.comment}"</p>
                            </div>` : ''}
                            <small style="color: var(--muted); display: block; margin-top: 8px;">📅 ${new Date(review.created_at).toLocaleDateString()}</small>
                        </div>
                    </div>
                `).join('');
            } else {
                reviewsList.innerHTML = '<div class="trip-item"><div><h4>No reviews yet</h4><p>Reviews will appear here when passengers rate you</p></div></div>';
            }
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
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
        
        const profileAvatar = document.getElementById('profileAvatar');
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        
        if (profileAvatar) profileAvatar.textContent = profile?.name?.charAt(0) || 'D';
        if (profileName) profileName.textContent = profile?.name || 'Driver';
        if (profileEmail) profileEmail.textContent = profile?.email || '';
        
        // Check if profile needs completion
        if (!profile?.phone || !profile?.next_of_kin_name) {
            setTimeout(() => {
                navigateTo('profile');
                showToast('Please complete your profile information', 'info');
            }, 500);
        }
    }
}

// Initialize page
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
    
    if (profile?.role !== 'driver') {
        showToast('Unauthorized access. Driver privileges required.', 'error');
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
window.startTrip = startTrip;
window.viewTripDetails = viewTripDetails;
window.shareLocation = shareLocation;
window.sendDriverMessage = sendDriverMessage;
window.submitIncidentReport = submitIncidentReport;
window.clockIn = clockIn;
window.clockOut = clockOut;
window.updateDriverProfile = updateDriverProfile;
window.handleDriverLogout = handleDriverLogout;
window.loadDriverReviews = loadDriverReviews;