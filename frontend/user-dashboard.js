// User Dashboard Logic
let currentPage = 'dashboard';
let currentUser = null;
let userProfile = null;

// Locations list (same as trips) - MUST BE DEFINED AT THE TOP
const locations = [
    'BANGAL', 'GARISSA', 'KANYONYO', 'KITHIMANI', 'KITHYOKA', 
    'KITHYOKO', 'MATUU', 'MWINGI', 'NAIROBI', 'NGUNI', 'THIKA', 'UKASI'
];

// Route data cache
let routeData = {};

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
    
    // Check if user is client or admin
    if (userData.role !== 'client' && userData.role !== 'admin') {
        showToast('Access denied. Client privileges required.', 'error');
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
    
    console.log('User authenticated:', userData.name);
    
    // Load dashboard content
    loadPageContent('dashboard');
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
        dashboard: 'Dashboard', booking: 'Book Ticket', tracking: 'Live Tracking',
        parcel: 'Parcel Delivery', tickets: 'My Tickets', rewards: 'Loyalty & Rewards',
        messages: 'Messages', profile: 'My Profile', safety: 'Safety & SOS',
        reviews: 'Rate Your Journey'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
    loadPageContent(page);
}

function loadPageContent(page) {
    const content = document.getElementById('pageContent');
    
    const pages = {
        dashboard: `
            <div class="welcome-banner">
                <div><h2>Welcome back, ${userProfile?.name || 'User'}! 👋</h2><p>You have 2 upcoming trips this week. Safe travels!</p></div>
                <button class="btn-dashboard btn-primary" onclick="navigateTo('booking')"><i class="fas fa-plus"></i> Book New Trip</button>
            </div>
            <div class="stats-grid-dashboard">
                <div class="stat-card-dashboard"><div class="stat-header"><div class="stat-icon-dashboard"><i class="fas fa-ticket-alt"></i></div></div><div class="stat-value-dashboard">24</div><div class="stat-label-dashboard">Total Trips</div><div class="stat-trend"><i class="fas fa-arrow-up"></i> 3 this month</div></div>
                <div class="stat-card-dashboard"><div class="stat-header"><div class="stat-icon-dashboard"><i class="fas fa-star"></i></div></div><div class="stat-value-dashboard">1,240</div><div class="stat-label-dashboard">Reward Points</div><div class="stat-trend" style="color: var(--gold);"><i class="fas fa-plus"></i> +80 earned</div></div>
                <div class="stat-card-dashboard"><div class="stat-header"><div class="stat-icon-dashboard"><i class="fas fa-money-bill-wave"></i></div></div><div class="stat-value-dashboard">KES 720</div><div class="stat-label-dashboard">Money Saved</div><div class="stat-trend" style="color: var(--green);">via rewards</div></div>
                <div class="stat-card-dashboard"><div class="stat-header"><div class="stat-icon-dashboard"><i class="fas fa-box"></i></div></div><div class="stat-value-dashboard">6</div><div class="stat-label-dashboard">Parcels Sent</div><div class="stat-trend" style="color: var(--purple);">2 in transit</div></div>
            </div>
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-clock"></i><span>Recent Trips</span></div>
                <div class="trip-item"><div class="trip-info"><h4>Nairobi → Mombasa</h4><p>Today, 07:00 AM • Bus RC-001</p></div><span class="trip-status status-upcoming">Upcoming</span></div>
                <div class="trip-item"><div class="trip-info"><h4>Mombasa → Nairobi</h4><p>Tomorrow, 14:00 PM • Bus RC-002</p></div><span class="trip-status status-upcoming">Upcoming</span></div>
                <div class="trip-item"><div class="trip-info"><h4>Nairobi → Kisumu</h4><p>Mar 25, 2025 • Bus RC-003</p></div><span class="trip-status status-completed">Completed</span></div>
            </div>
        `,
        booking: `
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
        `,
        tracking: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-map-marker-alt"></i><span>Live Bus Tracking</span></div>
                <div class="map-placeholder" style="background: var(--card2); border-radius: 12px; padding: 40px; text-align: center;"><i class="fas fa-map" style="font-size: 48px; color: var(--gold); margin-bottom: 16px; display: block;"></i><p>Interactive map will appear here</p></div>
                <div class="form-group"><label>Enter Trip ID</label><input type="text" class="input" placeholder="e.g., RC-001" id="trackingInput"></div>
                <button class="btn-dashboard btn-primary" onclick="trackBus()">Track Now</button>
            </div>
        `,
        parcel: `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-box"></i><span>Send a Parcel</span></div>
                <div class="form-group"><label>Pickup Location</label>
                    <select class="input" id="parcelPickupLocation">
                        <option value="">Select Pickup Location</option>
                    </select>
                </div>
                <div class="form-group"><label>Delivery Location</label>
                    <select class="input" id="parcelDeliveryLocation">
                        <option value="">Select Delivery Location</option>
                    </select>
                </div>
                <div class="form-group"><label>Receiver Name</label><input type="text" class="input" id="receiverName" placeholder="Receiver's full name"></div>
                <div class="form-group"><label>Receiver Phone</label><input type="tel" class="input" id="receiverPhone" placeholder="Receiver's phone number"></div>
                <div class="form-group"><label>Weight (kg)</label><input type="number" class="input" id="parcelWeight" placeholder="e.g., 2.5"></div>
                <div class="form-group"><label>Description</label><textarea class="input" rows="3" id="parcelDescription" placeholder="Describe the item"></textarea></div>
                <div id="parcelRouteDetails" style="display: none;"></div>
                <button class="btn-dashboard btn-primary" onclick="sendParcel()">Calculate & Send</button>
            </div>
            <div class="dashboard-card mt-16" id="recentParcels" style="display: none;">
                <div class="card-title"><i class="fas fa-history"></i><span>Recent Parcels</span></div>
                <div id="userParcelsList"></div>
            </div>
        `,
        tickets: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-ticket-alt"></i><span>My Tickets</span></div>
                <div id="userTicketsList"><div class="trip-item"><div><h4>No tickets found</h4></div></div></div>
            </div>
        `,
        rewards: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-gift"></i><span>My Rewards</span></div>
                <div class="stats-grid-dashboard" style="grid-template-columns: 1fr 1fr;">
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">1,240</div><div class="stat-label-dashboard">Total Points</div></div>
                    <div class="stat-card-dashboard"><div class="stat-value-dashboard">3</div><div class="stat-label-dashboard">Available Rewards</div></div>
                </div>
                <div class="trip-item"><div><h4>Free WiFi Voucher</h4><p>100 points • Valid for 1 trip</p></div><button class="btn-dashboard btn-primary" onclick="redeemReward()">Redeem</button></div>
                <div class="trip-item"><div><h4>10% Discount</h4><p>500 points • On next booking</p></div><button class="btn-dashboard btn-primary" onclick="redeemReward()">Redeem</button></div>
                <div class="trip-item"><div><h4>Free Refreshment</h4><p>200 points • On-board snack</p></div><button class="btn-dashboard btn-primary" onclick="redeemReward()">Redeem</button></div>
            </div>
        `,
        messages: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-comment"></i><span>Support Chat</span></div>
                <div class="chat-messages" id="chatMessages" style="height: 300px; overflow-y: auto; background: var(--card2); border-radius: 12px; padding: 16px;">
                    <div class="chat-message"><strong>Support:</strong> Hello! How can we help you today?</div>
                </div>
                <div class="input-group" style="display: flex; gap: 12px; margin-top: 16px;">
                    <input type="text" class="input" placeholder="Type your message..." id="chatInput">
                    <button class="btn-dashboard btn-primary" onclick="sendChatMessage()">Send</button>
                </div>
            </div>
        `,
        profile: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-user"></i><span>My Profile</span></div>
                <div style="text-align: center; margin-bottom: 24px;">
                    <div id="profilePictureContainer">
                        <img id="profilePictureImg" src="${userProfile?.avatar_url || ''}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin: 0 auto; display: block;" onerror="this.style.display='none'">
                        <div class="user-avatar" id="profileAvatarFallback" style="width: 100px; height: 100px; font-size: 48px; margin: 0 auto 16px; display: ${userProfile?.avatar_url ? 'none' : 'flex'}">${userProfile?.name?.charAt(0) || 'U'}</div>
                    </div>
                    <h3 id="profileName">${userProfile?.name || 'Loading...'}</h3>
                    <p style="color: var(--muted);" id="profileEmail">${userProfile?.email || ''}</p>
                </div>
                <div class="form-group"><label>Full Name</label><input type="text" class="input" id="fullName" value="${userProfile?.name || ''}"></div>
                <div class="form-group"><label>Phone</label><input type="tel" class="input" id="phone" value="${userProfile?.phone || ''}"></div>
                <div class="form-group"><label>Profile Picture</label><input type="file" class="input" id="profilePicture" accept="image/*"></div>
                <div id="profilePicPreview" style="margin-top: 10px; text-align: center;"></div>
                <button class="btn-dashboard btn-primary" onclick="updateProfile()">Save Changes</button>
            </div>
        `,
        reviews: `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-star"></i><span>Rate Your Journey</span></div>
                <p style="color: var(--muted); margin-bottom: 20px;">Help us improve by rating your recent trips. Your feedback helps our drivers and service!</p>
                
                <div class="form-group">
                    <label>Select Your Trip</label>
                    <select class="input" id="reviewTripSelect">
                        <option value="">Select a completed trip</option>
                    </select>
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
                    <label>Your Review (Optional)</label>
                    <textarea class="input" id="reviewComment" rows="4" placeholder="Share your experience... What did you like? What could be improved?"></textarea>
                </div>
                
                <button class="btn-dashboard btn-primary" id="submitReviewBtn" onclick="submitReview()">Submit Review</button>
            </div>
            
            <div class="dashboard-card mt-16">
                <div class="card-title"><i class="fas fa-history"></i><span>My Previous Reviews</span></div>
                <div id="userReviewsList">
                    <div class="trip-item"><div><h4>No reviews yet</h4><p>Your reviews will appear here</p></div></div>
                </div>
            </div>
        `,
        safety: `
            <div class="dashboard-card"><div class="card-title"><i class="fas fa-shield-alt"></i><span>Safety & SOS</span></div>
                <div style="text-align: center; padding: 20px;">
                    <button class="btn-dashboard btn-danger" style="background: #F04545; color: white; padding: 16px 32px; font-size: 18px;" onclick="triggerSOS()"><i class="fas fa-exclamation-triangle"></i> SOS EMERGENCY</button>
                    <p style="margin-top: 20px; color: var(--muted);">Press the SOS button in case of emergency. Your location will be shared with our response team.</p>
                </div>
            </div>
        `
    };
    
    content.innerHTML = pages[page] || pages.dashboard;
    if (page === 'booking') initBookingPage();
    if (page === 'parcel') initParcelPage();
    if (page === 'reviews') {
        setTimeout(() => {
            initRatingStars();
            loadCompletedTrips();
            loadUserReviews();
        }, 100);
    }
}

// Initialize Parcel Page with location dropdowns
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

function calculateParcelRoute() {
    const pickup = document.getElementById('parcelPickupLocation')?.value;
    const delivery = document.getElementById('parcelDeliveryLocation')?.value;
    const weight = parseFloat(document.getElementById('parcelWeight')?.value) || 1;
    
    if (!pickup || !delivery) {
        clearParcelRouteDetails();
        return;
    }
    
    if (pickup === delivery) {
        showToast('Pickup and delivery locations cannot be the same', 'error');
        clearParcelRouteDetails();
        return;
    }
    
    const route = routeData[`${pickup}|${delivery}`];
    if (route) {
        const baseParcelRate = 50;
        const distance = route.distance_km;
        const parcelCost = distance * baseParcelRate * weight;
        const estimatedHours = Math.floor(route.duration_minutes / 60);
        const estimatedMinutes = route.duration_minutes % 60;
        
        const parcelDetails = document.getElementById('parcelRouteDetails');
        if (parcelDetails) {
            parcelDetails.style.display = 'block';
            parcelDetails.innerHTML = `
                <div style="background: var(--gold-bg); border-radius: 12px; padding: 16px; margin-top: 16px;">
                    <h4 style="color: var(--gold);">Parcel Delivery Details</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div><strong>Distance:</strong> ${distance} km</div>
                        <div><strong>Est. Delivery:</strong> ${estimatedHours}h ${estimatedMinutes}m</div>
                        <div><strong>Weight:</strong> ${weight} kg</div>
                        <div><strong>Cost:</strong> KES ${parcelCost.toLocaleString()}</div>
                    </div>
                </div>
            `;
        }
    } else {
        clearParcelRouteDetails();
        showToast('No route available between these locations', 'error');
    }
}

function clearParcelRouteDetails() {
    const rd = document.getElementById('parcelRouteDetails');
    if (rd) { rd.style.display = 'none'; rd.innerHTML = ''; }
}

async function sendParcel() {
    const pickup = document.getElementById('parcelPickupLocation')?.value;
    const delivery = document.getElementById('parcelDeliveryLocation')?.value;
    const receiverName = document.getElementById('receiverName')?.value;
    const receiverPhone = document.getElementById('receiverPhone')?.value;
    const weight = parseFloat(document.getElementById('parcelWeight')?.value) || 1;
    const description = document.getElementById('parcelDescription')?.value;
    
    if (!pickup || !delivery || !receiverName) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (pickup === delivery) {
        showToast('Pickup and delivery locations cannot be the same', 'error');
        return;
    }
    
    const route = routeData[`${pickup}|${delivery}`];
    if (!route) {
        showToast('No route available between these locations', 'error');
        return;
    }
    
    const baseParcelRate = 50;
    const parcelCost = route.distance_km * baseParcelRate * weight;
    const trackingNumber = 'RCP' + Date.now() + Math.floor(Math.random() * 1000);
    
    try {
        const { data, error } = await window.supabase
            .from('parcels')
            .insert({
                sender_id: currentUser?.id,
                receiver_name: receiverName,
                receiver_phone: receiverPhone,
                pickup_location: pickup,
                delivery_location: delivery,
                weight_kg: weight,
                description: description,
                tracking_number: trackingNumber,
                amount: parcelCost,
                status: 'pending'
            })
            .select();
        
        if (error) throw error;
        
        showToast(`Parcel booked! Tracking: ${trackingNumber} | Cost: KES ${parcelCost}`, 'success');
        
        document.getElementById('receiverName').value = '';
        document.getElementById('receiverPhone').value = '';
        document.getElementById('parcelWeight').value = '';
        document.getElementById('parcelDescription').value = '';
        clearParcelRouteDetails();
        
        loadUserParcels();
        
    } catch (error) {
        console.error('Parcel booking error:', error);
        showToast('Error booking parcel. Please try again.', 'error');
    }
}

async function loadUserParcels() {
    try {
        const { data, error } = await window.supabase
            .from('parcels')
            .select('*')
            .eq('sender_id', currentUser?.id)
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (error) throw error;
        
        const parcelsList = document.getElementById('userParcelsList');
        const recentParcels = document.getElementById('recentParcels');
        
        if (parcelsList && data && data.length > 0) {
            recentParcels.style.display = 'block';
            parcelsList.innerHTML = data.map(parcel => `
                <div class="trip-item">
                    <div>
                        <h4>Parcel #${parcel.tracking_number}</h4>
                        <p>${parcel.pickup_location} → ${parcel.delivery_location}</p>
                        <p>Weight: ${parcel.weight_kg} kg | Cost: KES ${parcel.amount}</p>
                        <p>Status: <span class="trip-status status-${parcel.status === 'delivered' ? 'completed' : 'upcoming'}">${parcel.status}</span></p>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading parcels:', error);
    }
}

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

async function loadRouteData() {
    try {
        const { data, error } = await window.supabase.from('routes').select('*');
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
                        <div><strong>Total (${passengers} passenger${passengers > 1 ? 's' : ''}):</strong> KES ${totalFare.toLocaleString()}</div>
                    </div>
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);">
                        <small>Speed: 80 km/h | Estimated travel time</small>
                    </div>
                </div>
            `;
        }
    } else { clearRouteDetails(); }
}

function clearRouteDetails() {
    const rd = document.getElementById('routeDetails');
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
            <div class="trip-item"><div><h4>7:00 AM - Express</h4><p>KES ${route.base_fare} • ${hours}h ${minutes}m • WiFi, A/C, Charging</p><p>Est. Arrival: ${calculateArrivalTime('07:00', route.duration_minutes)}</p></div><button class="btn-dashboard btn-primary" onclick="selectBus('7:00 AM', ${route.base_fare})">Select</button></div>
            <div class="trip-item"><div><h4>10:30 AM - Luxury</h4><p>KES ${Math.round(route.base_fare * 1.3)} • ${hours}h ${minutes}m • WiFi, A/C, TV, Refreshments</p><p>Est. Arrival: ${calculateArrivalTime('10:30', route.duration_minutes)}</p></div><button class="btn-dashboard btn-primary" onclick="selectBus('10:30 AM', ${Math.round(route.base_fare * 1.3)})">Select</button></div>
            <div class="trip-item"><div><h4>2:00 PM - Economy</h4><p>KES ${Math.round(route.base_fare * 0.8)} • ${hours}h ${minutes}m • A/C, Charging</p><p>Est. Arrival: ${calculateArrivalTime('14:00', route.duration_minutes)}</p></div><button class="btn-dashboard btn-primary" onclick="selectBus('2:00 PM', ${Math.round(route.base_fare * 0.8)})">Select</button></div>
        `;
    }
}

function calculateArrivalTime(departureTime, durationMinutes) {
    const [hours, minutes] = departureTime.split(':');
    let totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + durationMinutes;
    const arrivalHours = Math.floor(totalMinutes / 60) % 24;
    const arrivalMinutes = totalMinutes % 60;
    const ampm = arrivalHours >= 12 ? 'PM' : 'AM';
    const displayHours = arrivalHours % 12 || 12;
    return `${displayHours}:${arrivalMinutes.toString().padStart(2, '0')} ${ampm}`;
}

function selectBus(time, fare) {
    const passengers = parseInt(document.getElementById('passengers')?.value) || 1;
    const from = document.getElementById('fromLocation')?.value;
    const to = document.getElementById('toLocation')?.value;
    showToast(`Booking confirmed for ${time}! ${from} → ${to} | Total: KES ${fare * passengers}`, 'success');
}

function trackBus() {
    const input = document.getElementById('trackingInput')?.value;
    showToast(input ? `Tracking bus ${input}...` : 'Please enter a Trip ID', input ? 'info' : 'error');
}

function redeemReward() { showToast('Reward redeemed! Check your email for details.', 'success'); }

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (input?.value.trim()) {
        const container = document.getElementById('chatMessages');
        const msg = document.createElement('div');
        msg.className = 'chat-message';
        msg.style.marginBottom = '12px';
        msg.innerHTML = `<strong>You:</strong> ${input.value}`;
        container.appendChild(msg);
        input.value = '';
        container.scrollTop = container.scrollHeight;
        setTimeout(() => {
            const response = document.createElement('div');
            response.className = 'chat-message';
            response.style.marginBottom = '12px';
            response.innerHTML = `<strong>Support:</strong> Thank you for your message. We'll get back to you shortly.`;
            container.appendChild(response);
            container.scrollTop = container.scrollHeight;
        }, 1000);
    }
}

async function updateProfile() {
    const fullName = document.getElementById('fullName')?.value;
    const phone = document.getElementById('phone')?.value;
    const profilePicFile = document.getElementById('profilePicture')?.files[0];
    
    let avatarUrl = userProfile?.avatar_url;
    
    if (profilePicFile) {
        showToast('Uploading profile picture...', 'info');
        
        const fileExt = profilePicFile.name.split('.').pop();
        const fileName = `${currentUser.id}_${Date.now()}.${fileExt}`;
        
        try {
            const { data: uploadData, error: uploadError } = await window.supabase.storage
                .from('avatars')
                .upload(fileName, profilePicFile, {
                    cacheControl: '3600',
                    upsert: true
                });
            
            if (uploadError) {
                console.error('Upload error:', uploadError);
                showToast('Error uploading picture: ' + uploadError.message, 'error');
            } else {
                const { data: { publicUrl } } = window.supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);
                avatarUrl = publicUrl;
                showToast('Profile picture uploaded!', 'success');
            }
        } catch (uploadErr) {
            console.error('Upload exception:', uploadErr);
            showToast('Error uploading picture. Please try again.', 'error');
        }
    }
    
    if (currentUser && fullName) {
        const updates = { name: fullName, phone: phone };
        if (avatarUrl) updates.avatar_url = avatarUrl;
        
        const { error } = await window.supabase.from('profiles').update(updates).eq('id', currentUser.id);
        if (error) {
            showToast('Error updating profile', 'error');
            console.error('Profile update error:', error);
        } else { 
            showToast('Profile updated successfully!', 'success'); 
            userProfile.name = fullName; 
            userProfile.phone = phone;
            if (avatarUrl) userProfile.avatar_url = avatarUrl;
            document.getElementById('userName').textContent = fullName;
            document.getElementById('profileName').textContent = fullName;
            
            const profileImg = document.getElementById('profilePictureImg');
            const fallback = document.getElementById('profileAvatarFallback');
            if (avatarUrl) {
                profileImg.src = avatarUrl;
                profileImg.style.display = 'block';
                if (fallback) fallback.style.display = 'none';
            }
        }
    }
}

function triggerSOS() { showToast('SOS Alert Sent! Emergency services notified. Your location has been shared.', 'error'); }

async function handleLogout() { 
    await logoutUser(); 
}

document.addEventListener('DOMContentLoaded', async () => {
    loadTheme();
});

// ==================== REVIEW SYSTEM ====================

function initRatingStars() {
    const journeyStars = document.querySelectorAll('#ratingStars i');
    const driverStars = document.querySelectorAll('#driverRatingStars i');
    
    function setupStarClickHandler(stars, hiddenInputId) {
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                document.getElementById(hiddenInputId).value = rating;
                
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.className = 'fas fa-star';
                        s.style.color = '#FFD700';
                    } else {
                        s.className = 'far fa-star';
                        s.style.color = 'var(--muted)';
                    }
                });
            });
            
            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.className = 'fas fa-star';
                        s.style.color = '#FFD700';
                    } else {
                        s.className = 'far fa-star';
                        s.style.color = 'var(--muted)';
                    }
                });
            });
            
            star.addEventListener('mouseleave', function() {
                const currentRating = parseInt(document.getElementById(hiddenInputId).value);
                stars.forEach((s, index) => {
                    if (index < currentRating) {
                        s.className = 'fas fa-star';
                        s.style.color = '#FFD700';
                    } else {
                        s.className = 'far fa-star';
                        s.style.color = 'var(--muted)';
                    }
                });
            });
        });
    }
    
    setupStarClickHandler(journeyStars, 'selectedRating');
    setupStarClickHandler(driverStars, 'selectedDriverRating');
}

async function loadCompletedTrips() {
    try {
        console.log('Loading completed trips...');
        
        const { data: bookings, error } = await window.supabase
            .from('bookings')
            .select(`
                *,
                trips:trip_id (
                    *,
                    routes:route_id (*),
                    drivers:driver_id (name)
                )
            `)
            .eq('user_id', currentUser?.id)
            .order('booking_date', { ascending: false });
        
        if (error) throw error;
        
        const { data: existingReviews } = await window.supabase
            .from('reviews')
            .select('trip_id')
            .eq('user_id', currentUser?.id);
        
        const reviewedTripIds = existingReviews?.map(r => r.trip_id) || [];
        
        const availableBookings = bookings?.filter(booking => 
            !reviewedTripIds.includes(booking.trip_id)
        ) || [];
        
        const select = document.getElementById('reviewTripSelect');
        if (select) {
            if (availableBookings.length > 0) {
                select.innerHTML = '<option value="">Select a trip to review</option>';
                availableBookings.forEach(booking => {
                    const trip = booking.trips;
                    if (trip) {
                        const route = trip.routes;
                        const driverName = trip.drivers?.name || 'Driver';
                        select.innerHTML += `
                            <option value="${booking.id}" 
                                data-trip-id="${trip.id}" 
                                data-driver-id="${trip.driver_id || ''}" 
                                data-route="${route?.origin || 'Unknown'} → ${route?.destination || 'Unknown'}" 
                                data-date="${booking.booking_date}">
                                ${route?.origin || 'Unknown'} → ${route?.destination || 'Unknown'} - ${new Date(booking.booking_date).toLocaleDateString()} (Driver: ${driverName})
                            </option>
                        `;
                    }
                });
            } else {
                select.innerHTML = '<option value="">No trips available for review</option>';
                if (bookings?.length > 0) {
                    showToast('You have already reviewed all your trips!', 'info');
                } else {
                    showToast('Complete a trip first to leave a review!', 'info');
                }
            }
        }
    } catch (error) {
        console.error('Error loading trips:', error);
        showToast('Error loading trips. Please refresh the page.', 'error');
    }
}

async function submitReview() {
    const tripSelect = document.getElementById('reviewTripSelect');
    const selectedOption = tripSelect?.options[tripSelect.selectedIndex];
    
    if (!selectedOption || !selectedOption.value) {
        showToast('Please select a trip to review', 'error');
        return;
    }
    
    const tripId = selectedOption?.getAttribute('data-trip-id');
    const driverId = selectedOption?.getAttribute('data-driver-id');
    const route = selectedOption?.getAttribute('data-route');
    const journeyDate = selectedOption?.getAttribute('data-date');
    const journeyRating = parseInt(document.getElementById('selectedRating')?.value) || 0;
    const driverRating = parseInt(document.getElementById('selectedDriverRating')?.value) || 0;
    const comment = document.getElementById('reviewComment')?.value;
    
    if (!tripId) {
        showToast('Please select a valid trip', 'error');
        return;
    }
    
    if (journeyRating === 0 || driverRating === 0) {
        showToast('Please rate both the journey and the driver', 'error');
        return;
    }
    
    const overallRating = Math.round((journeyRating + driverRating) / 2);
    
    const submitBtn = document.getElementById('submitReviewBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    }
    
    try {
        const { data: existingReview } = await window.supabase
            .from('reviews')
            .select('id')
            .eq('user_id', currentUser.id)
            .eq('trip_id', tripId)
            .single();
        
        if (existingReview) {
            showToast('You have already reviewed this trip', 'warning');
            return;
        }
        
        const { data, error } = await window.supabase
            .from('reviews')
            .insert({
                user_id: currentUser.id,
                trip_id: tripId,
                driver_id: driverId,
                journey_rating: journeyRating,
                driver_rating: driverRating,
                overall_rating: overallRating,
                comment: comment || null,
                journey_date: journeyDate,
                route: route,
                created_at: new Date().toISOString()
            })
            .select();
        
        if (error) throw error;
        
        showToast('✅ Thank you for your review!', 'success');
        
        document.getElementById('selectedRating').value = '0';
        document.getElementById('selectedDriverRating').value = '0';
        document.getElementById('reviewComment').value = '';
        
        document.querySelectorAll('#ratingStars i, #driverRatingStars i').forEach(star => {
            star.className = 'far fa-star';
            star.style.color = 'var(--muted)';
        });
        
        if (tripSelect) tripSelect.value = '';
        
        await loadUserReviews();
        await loadCompletedTrips();
        
    } catch (error) {
        console.error('Error submitting review:', error);
        showToast(error.message || 'Error submitting review', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit Review';
        }
    }
}

async function loadUserReviews() {
    try {
        const { data: reviews, error } = await window.supabase
            .from('reviews')
            .select('*')
            .eq('user_id', currentUser?.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const reviewsList = document.getElementById('userReviewsList');
        if (reviewsList) {
            if (reviews && reviews.length > 0) {
                reviewsList.innerHTML = reviews.map(review => `
                    <div class="trip-item">
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <div class="rating-display">
                                    ${Array(review.overall_rating || review.journey_rating).fill('<i class="fas fa-star" style="color: #FFD700;"></i>').join('')}
                                    ${Array(5 - (review.overall_rating || review.journey_rating)).fill('<i class="far fa-star" style="color: var(--muted);"></i>').join('')}
                                </div>
                                <span style="color: var(--gold); font-size: 12px;">${review.overall_rating || review.journey_rating}/5</span>
                            </div>
                            <h4>${review.route || 'Journey'}</h4>
                            <p style="font-size: 13px; color: var(--muted);">Trip: ${new Date(review.journey_date || review.created_at).toLocaleDateString()}</p>
                            <div style="display: flex; gap: 16px; margin-top: 8px;">
                                <span style="font-size: 12px;">🚗 Journey: ${review.journey_rating}/5</span>
                                <span style="font-size: 12px;">👨‍✈️ Driver: ${review.driver_rating}/5</span>
                            </div>
                            ${review.comment ? `<p style="margin-top: 8px; font-style: italic; background: var(--card2); padding: 8px; border-radius: 8px;">💬 "${review.comment}"</p>` : ''}
                            <p style="font-size: 11px; color: var(--muted); margin-top: 8px;">📅 Reviewed on ${new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                reviewsList.innerHTML = '<div class="trip-item"><div><h4>No reviews yet</h4><p>Your reviews will appear here after you submit them</p></div></div>';
            }
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Make functions global
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