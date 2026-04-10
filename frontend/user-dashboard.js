const supabase = window.supabase;

if (!supabase) {
  console.error("Supabase not initialized!");
}
document.addEventListener('DOMContentLoaded', async () => {
  loadTheme();

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      return redirectToLogin();
    }

    const user = data.session.user;
    currentUser = user;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

   if (!profile) {
  console.warn("No profile found, creating one...");

  const { error: insertError } = await supabase.from('profiles').insert({
    id: user.id,
    name: user.user_metadata?.name || '',
    phone: user.user_metadata?.phone || '',
    role: user.user_metadata?.role || 'client'
  });

  if (insertError) {
    console.error(insertError);
    showToast("Failed to create profile", "error");
    return;
  }

  const { data: newProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (fetchError || !newProfile) {
    showToast("Failed to load profile", "error");
    return;
  }

  userProfile = newProfile;

} else {
  userProfile = profile;
}

if (userProfile.role !== "client") {
  showToast("❌ Access denied", "error");
  return;
}

    document.getElementById("userName").textContent = profile.name || user.email;
document.getElementById("userAvatar").textContent =
  (profile.name || "U").substring(0, 2).toUpperCase();


  } catch (err) {
    console.error(err);
    redirectToLogin();
  }
});
function redirectToLogin() {
  window.location.href = "auth.html?role=user";
}

// User Dashboard Logic
let currentPage = 'dashboard';
let currentUser = null;
let userProfile = null;

// Locations list (same as trips)
const locations = [
    'BANGAL', 'GARISSA', 'KANYONYO', 'KITHIMANI', 'KITHYOKA', 
    'KITHYOKO', 'MATUU', 'MWINGI', 'NAIROBI', 'NGUNI', 'THIKA', 'UKASI'
];

// Route data cache
let routeData = {};



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
    dashboard: 'Dashboard',
    booking: 'Book Ticket',
    tracking: 'Live Tracking',
    parcel: 'Parcel Delivery',
    tickets: 'My Tickets',
    rewards: 'Loyalty & Rewards',
    messages: 'Messages',
    profile: 'My Profile',
    safety: 'Safety & SOS',
    reviews: 'Rate Your Journey'
  };

  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) pageTitle.textContent = titles[page] || 'Dashboard';

  loadPageContent(page);
}

function loadPageContent(page) {
    const content = document.getElementById('pageContent');
    if (!content) return;
    
    if (page === 'booking') {
        content.innerHTML = `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-ticket-alt"></i><span>Book a Ticket</span></div>
                <div class="form-group"><label>From (Origin)</label><select class="input" id="fromLocation"><option value="">Select Origin</option></select></div>
                <div class="form-group"><label>To (Destination)</label><select class="input" id="toLocation"><option value="">Select Destination</option></select></div>
                <div class="form-group"><label>Travel Date</label><input type="date" class="input" id="travelDate"></div>
                <div class="form-group"><label>Passengers</label><input type="number" class="input" value="1" min="1" max="10" id="passengers"></div>
                <div id="routeDetails" style="display: none;"></div>
                <button class="btn-dashboard btn-primary" onclick="searchBuses()">Search Buses</button>
            </div>
            <div class="dashboard-card mt-16" id="availableBuses" style="display: none;">
                <div class="card-title"><i class="fas fa-bus"></i><span>Available Buses</span></div>
                <div id="busesList"></div>
            </div>
        `;
        initBookingPage();
        return;
    }
    
    if (page === 'tracking') {
        content.innerHTML = `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-map-marker-alt"></i><span>Live Bus Tracking</span></div>
                <div class="map-placeholder" style="background: var(--card2); border-radius: 12px; padding: 40px; text-align: center;">
                    <i class="fas fa-map" style="font-size: 48px; color: var(--gold); margin-bottom: 16px; display: block;"></i>
                    <p>Interactive map will appear here</p>
                </div>
                <div class="form-group"><label>Enter Trip ID</label><input type="text" class="input" placeholder="e.g., RC-001" id="trackingInput"></div>
                <button class="btn-dashboard btn-primary" onclick="trackBus()">Track Now</button>
            </div>
        `;
        return;
    }
    
    if (page === 'parcel') {
        content.innerHTML = `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-box"></i><span>Send a Parcel</span></div>
                <div class="form-group"><label>Pickup Location</label>
                    <select class="input" id="parcelPickupLocation"><option value="">Select Pickup Location</option></select>
                </div>
                <div class="form-group"><label>Delivery Location</label>
                    <select class="input" id="parcelDeliveryLocation"><option value="">Select Delivery Location</option></select>
                </div>
                <div class="form-group"><label>Receiver Name</label><input type="text" class="input" id="receiverName" placeholder="Receiver's full name"></div>
                <div class="form-group"><label>Receiver Phone</label><input type="tel" class="input" id="receiverPhone" placeholder="Receiver's phone number"></div>
                <div class="form-group"><label>Weight (kg)</label><input type="number" class="input" id="parcelWeight" placeholder="e.g., 2.5"></div>
                <div class="form-group"><label>Description</label><textarea class="input" rows="3" id="parcelDescription" placeholder="Describe the item"></textarea></div>
                <div id="parcelRouteDetails" style="display: none;"></div>
                <button class="btn-dashboard btn-primary" onclick="sendParcel()">Calculate & Send</button>
            </div>
        `;
        initParcelPage();
        return;
    }
    
    if (page === 'tickets') {
        content.innerHTML = `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-ticket-alt"></i><span>My Tickets</span></div>
                <div id="userTicketsList"><div class="trip-item"><div><h4>No tickets found</h4></div></div></div>
            </div>
        `;
        return;
    }
    
    if (page === 'rewards') {
        content.innerHTML = `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-gift"></i><span>My Rewards</span></div>
                <div class="stats-grid-dashboard" style="grid-template-columns: 1fr 1fr;">
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">1,240</div><div class="stat-label-dashboard">Total Points</div></div>
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">3</div><div class="stat-label-dashboard">Available Rewards</div></div>
                </div>
                <div class="trip-item"><div><h4>Free WiFi Voucher</h4><p>100 points</p></div><button class="btn-dashboard btn-primary" onclick="redeemReward()">Redeem</button></div>
                <div class="trip-item"><div><h4>10% Discount</h4><p>500 points</p></div><button class="btn-dashboard btn-primary" onclick="redeemReward()">Redeem</button></div>
            </div>
        `;
        return;
    }
    
    if (page === 'messages') {
        content.innerHTML = `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-comment"></i><span>Support Chat</span></div>
                <div class="chat-messages" id="chatMessages" style="height: 300px; overflow-y: auto; background: var(--card2); border-radius: 12px; padding: 16px;">
                    <div class="chat-message"><strong>Support:</strong> Hello! How can we help you today?</div>
                </div>
                <div class="input-group" style="display: flex; gap: 12px; margin-top: 16px;">
                    <input type="text" class="input" placeholder="Type your message..." id="chatInput">
<input type="file" id="fileInput">
                    <button class="btn-dashboard btn-primary" onclick="sendChatMessage()">Send</button>
                </div>
            </div>
        `;
        setTimeout(() => {
        loadMessages(); 
        initRealtimeChat();
    }, 100);
        return;
    }
    
    if (page === 'profile') {
        content.innerHTML = `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-user"></i><span>My Profile</span></div>
                <div style="text-align: center; margin-bottom: 24px;">
                    <div class="user-avatar" style="width: 80px; height: 80px; font-size: 32px; margin: 0 auto 16px;">${userProfile?.name?.charAt(0) || 'U'}</div>
                    <h3>${userProfile?.name || 'User'}</h3>
                    <p style="color: var(--muted);">${userProfile?.email || ''}</p>
                </div>
                <div class="form-group"><label>Full Name</label><input type="text" class="input" id="fullName" value="${userProfile?.name || ''}"></div>
                <div class="form-group"><label>Phone</label><input type="tel" class="input" id="phone" value="${userProfile?.phone || ''}"></div>
                <button class="btn-dashboard btn-primary" onclick="updateProfile()">Save Changes</button>
            </div>
        `;
        return;
    }
    
    if (page === 'reviews') {
        content.innerHTML = `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-star"></i><span>Rate Your Journey</span></div>
                <p style="color: var(--muted); margin-bottom: 20px;">Help us improve by rating your recent trips.</p>
                <div class="form-group">
                    <label>Select Your Trip</label>
                    <select class="input" id="reviewTripSelect"><option value="">Select a completed trip</option></select>
                </div>
                <div class="form-group">
                    <label>Rate Your Journey</label>
                    <div class="rating-stars" id="ratingStars">
                        <i class="far fa-star" data-rating="1"></i>
                        <i class="far fa-star" data-rating="2"></i>
                        <i class="far fa-star" data-rating="3"></i>
                        <i class="far fa-star" data-rating="4"></i>
                        <i class="far fa-star" data-rating="5"></i>
                    </div>
                    <input type="hidden" id="selectedRating" value="0">
                </div>
                <div class="form-group">
                    <label>Rate the Driver</label>
                    <div class="rating-stars" id="driverRatingStars">
                        <i class="far fa-star" data-rating="1"></i>
                        <i class="far fa-star" data-rating="2"></i>
                        <i class="far fa-star" data-rating="3"></i>
                        <i class="far fa-star" data-rating="4"></i>
                        <i class="far fa-star" data-rating="5"></i>
                    </div>
                    <input type="hidden" id="selectedDriverRating" value="0">
                </div>
                <div class="form-group">
                    <label>Your Review</label>
                    <textarea class="input" id="reviewComment" rows="4" placeholder="Share your experience..."></textarea>
                </div>
                <button class="btn-dashboard btn-primary" id="submitReviewBtn" onclick="submitReview()">Submit Review</button>
            </div>
            <div class="dashboard-card mt-16">
                <div class="card-title"><i class="fas fa-history"></i><span>My Previous Reviews</span></div>
                <div id="userReviewsList"><div class="trip-item"><div><h4>No reviews yet</h4></div></div></div>
            </div>
        `;
        setTimeout(() => {
            initRatingStars();
            loadCompletedTrips();
            loadUserReviews();
        }, 100);
        return;
    }
    
    if (page === 'safety') {
        content.innerHTML = `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-shield-alt"></i><span>Safety & SOS</span></div>
                <div style="text-align: center; padding: 20px;">
                    <button class="btn-dashboard btn-danger" style="background: #F04545; color: white; padding: 16px 32px; font-size: 18px;" onclick="triggerSOS()">
                        <i class="fas fa-exclamation-triangle"></i> SOS EMERGENCY
                    </button>
                    <p style="margin-top: 20px; color: var(--muted);">Press the SOS button in case of emergency.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Default dashboard
    content.innerHTML = `
        <div class="welcome-banner">
            <div><h2>Welcome back, ${userProfile?.name || 'User'}! 👋</h2><p>You have 2 upcoming trips this week. Safe travels!</p></div>
            <button class="btn-dashboard btn-primary" onclick="window.navigateTo('booking')"><i class="fas fa-plus"></i> Book New Trip</button>
        </div>
        <div class="stats-grid-dashboard">
            <div class="stat-card-dashboard"><div class="stat-icon-dashboard"><i class="fas fa-ticket-alt"></i></div><div class="stat-value-dashboard">24</div><div class="stat-label-dashboard">Total Trips</div></div>
            <div class="stat-card-dashboard"><div class="stat-icon-dashboard"><i class="fas fa-star"></i></div><div class="stat-value-dashboard">1,240</div><div class="stat-label-dashboard">Reward Points</div></div>
            <div class="stat-card-dashboard"><div class="stat-icon-dashboard"><i class="fas fa-money-bill-wave"></i></div><div class="stat-value-dashboard">KES 720</div><div class="stat-label-dashboard">Money Saved</div></div>
            <div class="stat-card-dashboard"><div class="stat-icon-dashboard"><i class="fas fa-box"></i></div><div class="stat-value-dashboard">6</div><div class="stat-label-dashboard">Parcels Sent</div></div>
        </div>
        <div class="dashboard-card"><div class="card-title"><i class="fas fa-clock"></i><span>Recent Trips</span></div>
            <div class="trip-item"><div><h4>Nairobi → Mombasa</h4><p>Today, 07:00 AM</p></div><span class="trip-status status-upcoming">Upcoming</span></div>
            <div class="trip-item"><div><h4>Mombasa → Nairobi</h4><p>Tomorrow, 14:00 PM</p></div><span class="trip-status status-upcoming">Upcoming</span></div>
        </div>
    `;
}

// Initialize functions
async function initBookingPage() {
    const fromSelect = document.getElementById('fromLocation');
    const toSelect = document.getElementById('toLocation');
    
    if (fromSelect && toSelect) {
        fromSelect.innerHTML = '<option value="">Select Origin</option>';
        toSelect.innerHTML = '<option value="">Select Destination</option>';
        
        locations.forEach(location => {
            fromSelect.innerHTML += `<option value="${location}">${location}</option>`;
            toSelect.innerHTML += `<option value="${location}">${location}</option>`;
        });
        
        fromSelect.addEventListener('change', updateToOptions);
        toSelect.addEventListener('change', calculateRouteDetails);
        document.getElementById('passengers')?.addEventListener('input', calculateRouteDetails);
    }
    await loadRouteData();
}

function initParcelPage() {
    const pickupSelect = document.getElementById('parcelPickupLocation');
    const deliverySelect = document.getElementById('parcelDeliveryLocation');
    
    if (pickupSelect && deliverySelect) {
        pickupSelect.innerHTML = '<option value="">Select Pickup Location</option>';
        deliverySelect.innerHTML = '<option value="">Select Delivery Location</option>';
        
        locations.forEach(location => {
            pickupSelect.innerHTML += `<option value="${location}">${location}</option>`;
            deliverySelect.innerHTML += `<option value="${location}">${location}</option>`;
        });
        
        pickupSelect.addEventListener('change', updateParcelDeliveryOptions);
        deliverySelect.addEventListener('change', calculateParcelRoute);
    }
}

async function loadRouteData() {
    try {
        const { data, error } = await supabase.from('routes').select('*');
        if (error) throw error;
        routeData = {};
        data.forEach(route => { routeData[`${route.origin}|${route.destination}`] = route; });
    } catch (error) { console.error('Error loading routes:', error); }
}

function updateToOptions() {
    const fromSelect = document.getElementById('fromLocation');
    const toSelect = document.getElementById('toLocation');
    const selectedFrom = fromSelect.value;
    
    toSelect.innerHTML = '<option value="">Select Destination</option>';
    if (!selectedFrom) return;
    
    locations.forEach(location => {
        if (location !== selectedFrom) {
            toSelect.innerHTML += `<option value="${location}">${location}</option>`;
        }
    });
    clearRouteDetails();
}

function updateParcelDeliveryOptions() {
    const pickupSelect = document.getElementById('parcelPickupLocation');
    const deliverySelect = document.getElementById('parcelDeliveryLocation');
    const selectedPickup = pickupSelect.value;
    
    deliverySelect.innerHTML = '<option value="">Select Delivery Location</option>';
    if (!selectedPickup) return;
    
    locations.forEach(location => {
        if (location !== selectedPickup) {
            deliverySelect.innerHTML += `<option value="${location}">${location}</option>`;
        }
    });
    clearParcelRouteDetails();
}

function calculateRouteDetails() {
    const from = document.getElementById('fromLocation')?.value;
    const to = document.getElementById('toLocation')?.value;
    const passengers = parseInt(document.getElementById('passengers')?.value) || 1;
    
    if (!from || !to) { clearRouteDetails(); return; }
    
    const route = routeData[`${from}|${to}`];
    if (route) {
        const totalFare = route.base_fare * passengers;
        const hours = Math.floor(route.duration_minutes / 60);
        const minutes = route.duration_minutes % 60;
        const routeDetails = document.getElementById('routeDetails');
        if (routeDetails) {
            routeDetails.style.display = 'block';
            routeDetails.innerHTML = `
                <div style="background: var(--gold-bg); border-radius: 12px; padding: 16px; margin-top: 16px;">
                    <h4 style="color: var(--gold);">Route Details</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div><strong>Distance:</strong> ${route.distance_km} km</div>
                        <div><strong>Duration:</strong> ${hours}h ${minutes}m</div>
                        <div><strong>Base Fare:</strong> KES ${route.base_fare.toLocaleString()}</div>
                        <div><strong>Total:</strong> KES ${totalFare.toLocaleString()}</div>
                    </div>
                </div>
            `;
        }
    }
}

function calculateParcelRoute() {
    const pickup = document.getElementById('parcelPickupLocation')?.value;
    const delivery = document.getElementById('parcelDeliveryLocation')?.value;
    const weight = parseFloat(document.getElementById('parcelWeight')?.value) || 1;
    
    if (!pickup || !delivery) { clearParcelRouteDetails(); return; }
    if (pickup === delivery) { showToast('Locations cannot be the same', 'error'); return; }
    
    const route = routeData[`${pickup}|${delivery}`];
    if (route) {
        const parcelCost = route.distance_km * 50 * weight;
        const hours = Math.floor(route.duration_minutes / 60);
        const minutes = route.duration_minutes % 60;
        const parcelDetails = document.getElementById('parcelRouteDetails');
        if (parcelDetails) {
            parcelDetails.style.display = 'block';
            parcelDetails.innerHTML = `
                <div style="background: var(--gold-bg); border-radius: 12px; padding: 16px; margin-top: 16px;">
                    <h4 style="color: var(--gold);">Parcel Delivery Details</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div><strong>Distance:</strong> ${route.distance_km} km</div>
                        <div><strong>Est. Delivery:</strong> ${hours}h ${minutes}m</div>
                        <div><strong>Weight:</strong> ${weight} kg</div>
                        <div><strong>Cost:</strong> KES ${parcelCost.toLocaleString()}</div>
                    </div>
                </div>
            `;
        }
    }
}

function clearRouteDetails() {
    const rd = document.getElementById('routeDetails');
    if (rd) { rd.style.display = 'none'; rd.innerHTML = ''; }
}

function clearParcelRouteDetails() {
    const rd = document.getElementById('parcelRouteDetails');
    if (rd) { rd.style.display = 'none'; rd.innerHTML = ''; }
}

async function searchBuses() {
    const from = document.getElementById('fromLocation')?.value;
    const to = document.getElementById('toLocation')?.value;
    if (!from || !to) { showToast('Please select origin and destination', 'error'); return; }
    if (from === to) { showToast('Origin and destination cannot be the same', 'error'); return; }
    
    showToast('Searching for available buses...', 'info');
    const route = routeData[`${from}|${to}`];
    if (route) {
        document.getElementById('availableBuses').style.display = 'block';
        const hours = Math.floor(route.duration_minutes / 60);
        const minutes = route.duration_minutes % 60;
        document.getElementById('busesList').innerHTML = `
            <div class="trip-item"><div><h4>7:00 AM - Express</h4><p>KES ${route.base_fare} • ${hours}h ${minutes}m</p></div><button class="btn-dashboard btn-primary" onclick="selectBus('7:00 AM', ${route.base_fare})">Select</button></div>
            <div class="trip-item"><div><h4>10:30 AM - Luxury</h4><p>KES ${Math.round(route.base_fare * 1.3)} • ${hours}h ${minutes}m</p></div><button class="btn-dashboard btn-primary" onclick="selectBus('10:30 AM', ${Math.round(route.base_fare * 1.3)})">Select</button></div>
            <div class="trip-item"><div><h4>2:00 PM - Economy</h4><p>KES ${Math.round(route.base_fare * 0.8)} • ${hours}h ${minutes}m</p></div><button class="btn-dashboard btn-primary" onclick="selectBus('2:00 PM', ${Math.round(route.base_fare * 0.8)})">Select</button></div>
        `;
    }
}

function selectBus(time, fare) {
    const passengers = parseInt(document.getElementById('passengers')?.value) || 1;
    showToast(`Booking confirmed! Total: KES ${fare * passengers}`, 'success');
}

async function sendParcel() {
    const pickup = document.getElementById('parcelPickupLocation')?.value;
    const delivery = document.getElementById('parcelDeliveryLocation')?.value;
    const receiverName = document.getElementById('receiverName')?.value;
    
    if (!pickup || !delivery || !receiverName) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    showToast('Parcel booked! Tracking number will be sent.', 'success');
    document.getElementById('receiverName').value = '';
    document.getElementById('receiverPhone').value = '';
    document.getElementById('parcelWeight').value = '';
    document.getElementById('parcelDescription').value = '';
    clearParcelRouteDetails();
}

function trackBus() {
    const input = document.getElementById('trackingInput')?.value;
    showToast(input ? `Tracking bus ${input}...` : 'Please enter a Trip ID', input ? 'info' : 'error');
}

function redeemReward() { showToast('Reward redeemed! Check your email.', 'success'); }


async function updateProfile() {
    const fullName = document.getElementById('fullName')?.value;
    const phone = document.getElementById('phone')?.value;
    
    if (fullName) {
        showToast('Profile updated successfully!', 'success');
        if (userProfile) userProfile.name = fullName;
        if (userProfile) userProfile.phone = phone;
        localStorage.setItem('rayan_user', JSON.stringify(userProfile));
        document.getElementById('userName').textContent = fullName;
    }
}

function triggerSOS() { showToast('SOS Alert Sent! Emergency notified.', 'error'); }

async function handleLogout() { await logoutUser(); }

// Review System Functions
function initRatingStars() {
    const journeyStars = document.querySelectorAll('#ratingStars i');
    const driverStars = document.querySelectorAll('#driverRatingStars i');
    
    function setupStars(stars, hiddenId) {
        stars.forEach(star => {
            star.onclick = function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                document.getElementById(hiddenId).value = rating;
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.className = 'fas fa-star';
                        s.style.color = '#FFD700';
                    } else {
                        s.className = 'far fa-star';
                        s.style.color = 'var(--muted)';
                    }
                });
            };
        });
    }
    
    setupStars(journeyStars, 'selectedRating');
    setupStars(driverStars, 'selectedDriverRating');
}

async function loadCompletedTrips() {
    const select = document.getElementById('reviewTripSelect');
    if (select) {
        select.innerHTML = '<option value="">Select a trip</option><option value="1">Nairobi → Mombasa (Today)</option><option value="2">Mombasa → Nairobi (Yesterday)</option>';
    }
}




//=======chat admin===============
let chatChannel = null;

function initRealtimeChat() {
  if (chatChannel) return;

  chatChannel = supabase
    .channel('messages')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      payload => displayMessage(payload.new)
    )
    .subscribe();
}
//=============send message=========
async function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const fileInput = document.getElementById("fileInput");

  

  let fileUrl = null;

  // ✅ Upload file
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];

    const { data, error } = await supabase.storage
      .from('chat-files')
      .upload(`chat/${Date.now()}_${file.name}`, file);

    if (!error) {
      fileUrl = supabase.storage
        .from('chat-files')
        .getPublicUrl(data.path).data.publicUrl;
    }
  }

  // ✅ Save message
  if (!currentUser || !currentUser.id) {
  showToast("User session not ready", "error");
  return;
}

if (!input.value && !fileInput.files.length) {
  return;
}
const { error } = await supabase.from('messages').insert({
  user_id: currentUser.id,
  message: input.value,
  file_url: fileUrl,
  role: "client"
});

if (error) {
  showToast("❌ Failed to send message", "error");
  return;
}

input.value = "";
fileInput.value = "";
}
//=========display messages=========
function displayMessage(msg) {
  const chatBox = document.getElementById("chatMessages");
  if (!chatBox) return; // ✅ prevent crash

  const div = document.createElement("div");
  div.className = "chat-message";

  div.innerHTML = `
    <strong>${msg.role === 'admin' ? 'Admin' : 'You'}:</strong>
    ${msg.message || ''}
    ${msg.file_url ? `<br><a href="${msg.file_url}" target="_blank">📎 File</a>` : ''}
  `;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
//=============load messages========
async function loadMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return console.error(error);

  const chatBox = document.getElementById("chatMessages");
  if (!chatBox) return;

  chatBox.innerHTML = "";

  data.forEach(displayMessage);
}

//============= working with db reviews========
async function submitReview() {
  const rating = document.getElementById('selectedRating').value;
  const comment = document.getElementById('reviewComment').value;

  if (!rating || rating === "0") {
    return showToast("Rate first", "error");
  }

  await supabase.from('reviews').insert({
    user_id: currentUser.id,
    rating,
    comment
  });

  showToast("✅ Review submitted", "success");

  loadUserReviews();
}
//=============load reviews==========
async function loadUserReviews() {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', currentUser.id);

  const container = document.getElementById("userReviewsList");

  container.innerHTML = data.map(r => `
    <div class="trip-item">
      ⭐ ${r.rating} <br>
      ${r.comment}
    </div>
  `).join("");
}
//==========auto refreshing========
supabase.auth.onAuthStateChange((event, session) => {
  if (!session) {
    redirectToLogin();
  } else {
    currentUser = session.user;
  }
});

// Make all functions global
window.toggleSidebar = toggleSidebar;
window.navigateTo = navigateTo;
window.searchBuses = searchBuses;
window.selectBus = selectBus;
window.trackBus = trackBus;
window.sendParcel = sendParcel;
window.redeemReward = redeemReward;
window.sendChatMessage = sendChatMessage;
window.updateProfile = updateProfile;
window.triggerSOS = triggerSOS;
window.handleLogout = handleLogout;
window.submitReview = submitReview;
