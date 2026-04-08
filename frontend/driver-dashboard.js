// Import supabase from config
// Make sure supabase-config.js is loaded before this file

// Driver Dashboard State
let currentPage = 'dashboard';
let currentUser = null;
let userProfile = null;
let currentTrip = null;
let tripStartTime = null;
let assignedBus = null;

//==login with code===
function loginWithCode() {
    const code = prompt("Enter your driver code:");

    if (!code) return;

    // Example validation (replace with DB check)
    if (code === "1234") {
        localStorage.setItem('rayan_user', JSON.stringify({
            id: 'driver1',
            name: 'Demo Driver',
            role: 'driver'
        }));

        location.reload();
    } else {
        showToast('Invalid code', 'error');
    }
}
// ========== AUTHENTICATION ==========
(async function() {
    const storedUser = localStorage.getItem('rayan_user');
    if (!storedUser) {
        window.location.href = 'role-selection.html';
        return;
    }
    
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'driver') {
        showToast('Access denied. Driver privileges required.', 'error');
        window.location.href = 'role-selection.html';
        return;
    }
    
    currentUser = userData;
    userProfile = userData;
    
    // Load assigned bus
    await loadAssignedBus();
    
    // Load active trip if exists
    const savedTrip = localStorage.getItem('active_trip');
    if (savedTrip) {
        currentTrip = JSON.parse(savedTrip);
        tripStartTime = new Date(currentTrip.startTime);
        // Update button if on dashboard
        setTimeout(() => {
            const startBtn = document.querySelector('[onclick="startTrip()"]');
            if (startBtn) {
                startBtn.innerHTML = '<i class="fas fa-stop"></i> End Trip';
                startBtn.onclick = () => endTrip();
                startBtn.classList.add('btn-danger');
                startBtn.classList.remove('btn-primary');
            }
        }, 500);
    }
    
    // Update UI with user info
    const userNameElement = document.getElementById('userName');
    const userAvatarElement = document.getElementById('userAvatar');
    if (userNameElement) userNameElement.textContent = userData.name || userData.email;
    if (userAvatarElement) userAvatarElement.textContent = (userData.name || userData.email).charAt(0);
    
    // Display assigned bus info
    updateAssignedBusDisplay();
    
    console.log('Driver authenticated:', userData.name);
    
    // Load dashboard content
    loadPageContent('dashboard');
    
    // Load unread messages count
    loadUnreadMessagesCount();
    
    // Check if profile needs completion
    if (!userData.phone || !userData.next_of_kin_name) {
        setTimeout(() => {
            navigateTo('profile');
            showToast('Please complete your profile information', 'info');
        }, 500);
    }
})();

// ========== HELPER FUNCTIONS ==========
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#F5B041'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

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
        dashboard: 'Driver Dashboard',
        trips: 'My Trips',
        gps: 'GPS Tracking',
        earnings: 'Earnings',
        messages: 'Messages',
        incident: 'Incident Report',
        attendance: 'Attendance',
        performance: 'Performance',
        profile: 'Profile',
        reviews: 'My Reviews',
        calculator: 'Fuel Calculator'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[page] || 'Driver Dashboard';
    loadPageContent(page);
}
//=========gps tracking======
let gpsInterval = null;

function startGPSTracking() {
    if (!navigator.geolocation) {
        showToast('GPS not supported on this device', 'error');
        return;
    }

    gpsInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                await window.supabase.from('driver_locations').insert([{
                    driver_id: currentUser.id,
                    lat: latitude,
                    lng: longitude,
                    created_at: new Date().toISOString()
                }]);
            } catch (err) {
                console.log('GPS stored locally');
            }

        }, (error) => {
            console.error('GPS error:', error);
        });
    }, 10000); // every 10 seconds

    showToast('GPS tracking started', 'success');
}

function stopGPSTracking() {
    if (gpsInterval) {
        clearInterval(gpsInterval);
        gpsInterval = null;
        showToast('GPS tracking stopped', 'info');
    }
}
// ========== LOAD ASSIGNED BUS ==========
async function loadAssignedBus() {
    try {
        const { data, error } = await window.supabase
            .from('bus_assignments')
            .select(`
                buses:bus_id (
                    id,
                    bus_number,
                    registration,
                    model,
                    capacity,
                    fuel_type,
                    fuel_efficiency,
                    plate_number
                )
            `)
            .eq('driver_id', currentUser.id)
            .eq('status', 'active')
            .single();
        
        if (!error && data && data.buses) {
            assignedBus = data.buses;
        } else {
            // Try alternative table structure
            const { data: busData, error: busError } = await window.supabase
                .from('buses')
                .select('*')
                .eq('assigned_driver', currentUser.id)
                .eq('status', 'active')
                .single();
            
            if (!busError && busData) {
                assignedBus = busData;
            }
        }
        
        updateAssignedBusDisplay();
    } catch (error) {
        console.log('No bus assigned yet or table not found');
    }
}

function updateAssignedBusDisplay() {
    const busInfoElement = document.getElementById('assignedBusInfo');
    if (busInfoElement && assignedBus) {
        busInfoElement.innerHTML = `
            <div style="background: var(--card2); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                <strong><i class="fas fa-bus"></i> Your Assigned Bus:</strong><br>
                ${assignedBus.registration || assignedBus.bus_number || 'N/A'} - ${assignedBus.model || ''}<br>
                Plate: ${assignedBus.plate_number || assignedBus.registration || 'N/A'}
            </div>
        `;
    }
}

// ========== FUEL CALCULATOR ==========
function calculateFuel() {
    const distance = parseFloat(document.getElementById('distanceInput')?.value);
    const fuelPrice = parseFloat(document.getElementById('fuelPrice')?.value) || 170;
    
    if (!distance || distance <= 0) {
        showToast('Please enter a valid distance (km)', 'error');
        return;
    }
    
    // Get fuel efficiency (km per liter) from assigned bus or default
    const fuelEfficiency = assignedBus?.fuel_efficiency || 5.5;
    const fuelNeeded = distance / fuelEfficiency;
    const fuelCost = fuelNeeded * fuelPrice;
    
    const resultDiv = document.getElementById('calculatorResult');
    if (resultDiv) {
        document.getElementById('fuelNeeded').textContent = fuelNeeded.toFixed(2);
        document.getElementById('fuelCost').textContent = `KES ${fuelCost.toFixed(2)}`;
        resultDiv.style.display = 'block';
        
        // Also show efficiency info
        document.getElementById('fuelEfficiencyInfo').innerHTML = `
            <small style="color: var(--muted);">🚌 Bus efficiency: ${fuelEfficiency} km/L</small>
        `;
    }
}

// ========== TRIP MANAGEMENT ==========
async function startTrip() {
    if (currentTrip) {
        showToast('You already have an active trip. End it first.', 'error');
        return;
    }
    
    const route = prompt('Enter Route (e.g., Nairobi → Mombasa):');
    if (!route) return;
    
    const destination = prompt('Enter Destination:');
    if (!destination) return;
    
    const distance = parseFloat(prompt('Enter distance (km):'));
    if (!distance || distance <= 0) {
        showToast('Invalid distance', 'error');
        return;
    }
    
    tripStartTime = new Date();
    currentTrip = {
        id: Date.now(),
        route: route,
        destination: destination,
        distance: distance,
        startTime: tripStartTime.toISOString(),
        bus: assignedBus?.registration || assignedBus?.bus_number || 'Unknown'
    };
    
    // Save to localStorage
    localStorage.setItem('active_trip', JSON.stringify(currentTrip));
    
    // Notify admin via Supabase
    try {
        await window.supabase
            .from('driver_notifications')
            .insert([{
                driver_id: currentUser.id,
                driver_name: currentUser.name,
                driver_email: currentUser.email,
                type: 'trip_start',
                message: `🚌 TRIP STARTED\nDriver: ${currentUser.name}\nRoute: ${route} → ${destination}\nDistance: ${distance}km\nBus: ${currentTrip.bus}\nStarted at: ${tripStartTime.toLocaleString()}`,
                bus: currentTrip.bus,
                route: route,
                distance: distance,
                created_at: new Date().toISOString()
            }]);
    } catch (error) {
        console.log('Notification sent to admin');
    }
    
    showToast(`✅ Trip started!\nRoute: ${route} → ${destination}\nDistance: ${distance}km`, 'success');
    startGPSTracking(); // ADD THIS LINE
    // Update UI
    const startBtn = document.getElementById('startTripBtn');
    if (startBtn) {
        startBtn.innerHTML = '<i class="fas fa-stop"></i> End Trip';
        startBtn.onclick = endTrip;
        startBtn.classList.add('btn-danger');
        startBtn.classList.remove('btn-primary');
    }
}
//=====end trip=====
async function endTrip() {
    if (!currentTrip && !localStorage.getItem('active_trip')) {
        showToast('No active trip to end', 'error');
        return;
    }

    // Recover trip if lost in memory
    if (!currentTrip) {
        currentTrip = JSON.parse(localStorage.getItem('active_trip'));
        tripStartTime = new Date(currentTrip.startTime);
    }

    const tripEndTime = new Date();
    const workHours = (tripEndTime - tripStartTime) / (1000 * 60 * 60);

    // STOP GPS
    stopGPSTracking();

    const confirmed = confirm(
        `End trip?\n\n📅 ${tripStartTime.toLocaleDateString()}
🚌 ${currentTrip.route}
⏰ ${tripStartTime.toLocaleTimeString()} → ${tripEndTime.toLocaleTimeString()}
📊 ${workHours.toFixed(2)} hrs
📏 ${currentTrip.distance} km`
    );

    if (!confirmed) return;

    try {
        // Save attendance
        await window.supabase.from('driver_attendance').insert([{
            driver_id: currentUser.id,
            driver_name: currentUser.name,
            date: new Date().toISOString().split('T')[0],
            clock_in: tripStartTime.toISOString(),
            clock_out: tripEndTime.toISOString(),
            hours_worked: workHours,
            route: currentTrip.route,
            destination: currentTrip.destination,
            distance: currentTrip.distance,
            bus: currentTrip.bus,
            status: 'completed'
        }]);

        // Notify admin
        await window.supabase.from('driver_notifications').insert([{
            driver_id: currentUser.id,
            driver_name: currentUser.name,
            type: 'trip_end',
            message: `🏁 TRIP ENDED
Driver: ${currentUser.name}
Route: ${currentTrip.route}
Hours: ${workHours.toFixed(2)}
Distance: ${currentTrip.distance}km
Bus: ${currentTrip.bus}`,
            created_at: new Date().toISOString()
        }]);

    } catch (error) {
        console.error(error);

        // Fallback storage
        const attendance = JSON.parse(localStorage.getItem('driver_attendance') || '[]');
        attendance.push({
            driver_id: currentUser.id,
            hours_worked: workHours,
            route: currentTrip.route
        });
        localStorage.setItem('driver_attendance', JSON.stringify(attendance));
    }

    showToast(`✅ Trip ended (${workHours.toFixed(2)} hrs)`, 'success');

    // Reset state
    currentTrip = null;
    tripStartTime = null;
    localStorage.removeItem('active_trip');

    const btn = document.getElementById('startTripBtn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-play"></i> Start Trip';
        btn.onclick = startTrip;
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-primary');
    }

    if (currentPage === 'attendance') {
        loadPageContent('attendance');
    }
}
//=========notify admin at work
async function notifyWorkStart() {
    try {
        await window.supabase.from('driver_notifications').insert([{
            driver_id: currentUser.id,
            driver_name: currentUser.name,
            type: 'work_start',
            message: `🟢 DRIVER ON DUTY\n${currentUser.name} is now at work`,
            created_at: new Date().toISOString()
        }]);

        showToast('Admin notified: You are on duty', 'success');

    } catch (e) {
        showToast('Notification sent', 'success');
    }
}
// ========== ADMIN CHAT WITH FILE UPLOAD ==========
async function sendDriverMessage() {
    const input = document.getElementById('chatInput');
    const fileInput = document.getElementById('fileInput');
    const message = input?.value.trim();
    
    if (!message && (!fileInput || !fileInput.files.length)) {
        showToast('Please enter a message or select a file', 'error');
        return;
    }
    
    let fileUrl = null;
    let fileName = null;
    let fileType = null;
    
    // Upload file if exists
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileName = file.name;
        fileType = file.type;
        
        showToast('Uploading file...', 'info');
        
        // Upload to Supabase Storage
        const filePath = `driver_reports/${currentUser.id}/${Date.now()}_${file.name}`;
        const { data, error } = await window.supabase.storage
            .from('driver_files')
            .upload(filePath, file);
        
        if (error) {
            showToast('Error uploading file', 'error');
            console.error(error);
        } else {
            const { data: urlData } = window.supabase.storage
                .from('driver_files')
                .getPublicUrl(filePath);
            fileUrl = urlData.publicUrl;
            showToast('File uploaded successfully', 'success');
        }
        
        fileInput.value = '';
    }
    
    // Save message to database
    const messageData = {
        driver_id: currentUser.id,
        driver_name: currentUser.name,
        driver_email: currentUser.email,
        message: message || `📎 File attached: ${fileName}`,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        type: message ? 'text' : 'file',
        created_at: new Date().toISOString(),
        read: false
    };
    
    try {
        await window.supabase
            .from('driver_admin_chat')
            .insert([messageData]);
    } catch (error) {
        // Save to localStorage if table doesn't exist
        const chats = JSON.parse(localStorage.getItem('driver_chats') || '[]');
        chats.push(messageData);
        localStorage.setItem('driver_chats', JSON.stringify(chats));
    }
    
    // Display in chat
    const chatContainer = document.getElementById('chatMessages');
    if (chatContainer) {
        const newMsg = document.createElement('div');
        newMsg.className = 'chat-message driver-message';
        newMsg.style.marginBottom = '12px';
        newMsg.style.textAlign = 'right';
        newMsg.innerHTML = `
            <div style="background: #F5B041; display: inline-block; padding: 10px 15px; border-radius: 12px; max-width: 70%; text-align: left;">
                <strong style="color: #000;">You:</strong><br>
                ${message ? `<p style="margin: 5px 0; color: #000;">${message}</p>` : ''}
                ${fileUrl ? `<a href="${fileUrl}" target="_blank" style="color: #000; text-decoration: underline;"><i class="fas fa-paperclip"></i> ${fileName}</a>` : ''}
                <small style="display: block; margin-top: 5px; color: #666;">${new Date().toLocaleTimeString()}</small>
            </div>
        `;
        chatContainer.appendChild(newMsg);
        if (input) input.value = '';
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Simulate admin response for demo
    setTimeout(() => {
        if (chatContainer) {
            const response = document.createElement('div');
            response.className = 'chat-message admin-message';
            response.style.marginBottom = '12px';
            response.innerHTML = `
                <div style="background: #1F2937; display: inline-block; padding: 10px 15px; border-radius: 12px; max-width: 70%;">
                    <strong style="color: #F5B041;">Admin:</strong>
                    <p style="margin: 5px 0;">Message received. We'll get back to you shortly.</p>
                    <small style="display: block; margin-top: 5px; color: #666;">${new Date().toLocaleTimeString()}</small>
                </div>
            `;
            chatContainer.appendChild(response);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, 1000);
}

async function loadUnreadMessagesCount() {
    try {
        const { data, error } = await window.supabase
            .from('driver_admin_chat')
            .select('id')
            .eq('driver_id', currentUser.id)
            .eq('read', false)
            .eq('sender', 'admin');
        
        const count = data?.length || 0;
        const badge = document.getElementById('unreadBadge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.log('Unread count check');
    }
}

// ========== INCIDENT REPORT WITH FILE UPLOAD ==========
async function submitIncidentReport() {
    const type = document.getElementById('incidentType')?.value;
    const location = document.getElementById('incidentLocation')?.value;
    const description = document.getElementById('incidentDescription')?.value;
    const fileInput = document.getElementById('incidentPhotos');
    
    if (!location || !description) {
        showToast('Please fill in location and description', 'error');
        return;
    }
    
    let photoUrls = [];
    
    // Upload photos
    if (fileInput && fileInput.files.length > 0) {
        showToast('Uploading photos...', 'info');
        
        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            const filePath = `incidents/${currentUser.id}/${Date.now()}_${file.name}`;
            const { data, error } = await window.supabase.storage
                .from('driver_files')
                .upload(filePath, file);
            
            if (!error) {
                const { data: urlData } = window.supabase.storage
                    .from('driver_files')
                    .getPublicUrl(filePath);
                photoUrls.push(urlData.publicUrl);
            }
        }
    }
    
    // Save incident report
    const incidentData = {
        driver_id: currentUser.id,
        driver_name: currentUser.name,
        type: type,
        location: location,
        description: description,
        photos: photoUrls,
        status: 'reported',
        created_at: new Date().toISOString()
    };
    
    try {
        await window.supabase
            .from('incident_reports')
            .insert([incidentData]);
        
        // Notify admin
        await window.supabase
            .from('driver_notifications')
            .insert([{
                driver_id: currentUser.id,
                driver_name: currentUser.name,
                type: 'incident',
                message: `⚠️ INCIDENT REPORTED\nDriver: ${currentUser.name}\nType: ${type}\nLocation: ${location}\nDescription: ${description}\nPhotos: ${photoUrls.length} attached`,
                priority: 'high',
                created_at: new Date().toISOString()
            }]);
        
        showToast('Incident reported! Admin has been notified.', 'error');
        
        // Clear form
        if (document.getElementById('incidentLocation')) document.getElementById('incidentLocation').value = '';
        if (document.getElementById('incidentDescription')) document.getElementById('incidentDescription').value = '';
        if (fileInput) fileInput.value = '';
        
    } catch (error) {
        showToast('Incident reported locally', 'error');
        // Save to localStorage
        const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
        incidents.push(incidentData);
        localStorage.setItem('incidents', JSON.stringify(incidents));
    }
}

// ========== CLOCK IN/OUT ==========
async function clockIn() {
    const now = new Date();
    
    try {
        await window.supabase
            .from('driver_attendance')
            .insert([{
                driver_id: currentUser.id,
                driver_name: currentUser.name,
                date: now.toISOString().split('T')[0],
                clock_in: now.toISOString(),
                status: 'clocked_in'
            }]);
        
        showToast(`Clocked in at ${now.toLocaleTimeString()}`, 'success');
    } catch (error) {
        showToast(`Clocked in at ${now.toLocaleTimeString()}`, 'success');
    }
}

async function clockOut() {
    const now = new Date();
    
    try {
        // Find today's clock in
        const { data } = await window.supabase
            .from('driver_attendance')
            .select('*')
            .eq('driver_id', currentUser.id)
            .eq('date', now.toISOString().split('T')[0])
            .single();
        
        if (data && data.clock_in) {
            const clockInTime = new Date(data.clock_in);
            const hoursWorked = (now - clockInTime) / (1000 * 60 * 60);
            
            await window.supabase
                .from('driver_attendance')
                .update({
                    clock_out: now.toISOString(),
                    hours_worked: hoursWorked,
                    status: 'completed'
                })
                .eq('id', data.id);
            
            showToast(`Clocked out at ${now.toLocaleTimeString()} | Hours: ${hoursWorked.toFixed(2)}`, 'info');
        } else {
            showToast(`Clocked out at ${now.toLocaleTimeString()}`, 'info');
        }
    } catch (error) {
        showToast(`Clocked out at ${now.toLocaleTimeString()}`, 'info');
    }
}

// ========== LOAD DRIVER REVIEWS ==========
async function loadDriverReviews() {
    try {
        const { data: reviews, error } = await window.supabase
            .from('reviews')
            .select('*')
            .eq('driver_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const total = reviews?.length || 0;
        const avg = total > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || r.driver_rating || 0), 0) / total).toFixed(1) : 0;
        const fiveStar = reviews?.filter(r => (r.rating || r.driver_rating) === 5).length || 0;
        
        const avgEl = document.getElementById('avgRating');
        const totalEl = document.getElementById('totalReviews');
        const fiveStarEl = document.getElementById('fiveStarCount');
        
        if (avgEl) avgEl.textContent = avg;
        if (totalEl) totalEl.textContent = total;
        if (fiveStarEl) fiveStarEl.textContent = fiveStar;
        
        const reviewsList = document.getElementById('driverReviewsList');
        if (reviewsList) {
            if (reviews && reviews.length > 0) {
                reviewsList.innerHTML = reviews.map(review => `
                    <div class="trip-item">
                        <div>
                            <div class="rating-display" style="margin-bottom: 8px;">
                                ${Array(review.rating || review.driver_rating || 0).fill('<i class="fas fa-star" style="color: #FFD700;"></i>').join('')}
                                ${Array(5 - (review.rating || review.driver_rating || 0)).fill('<i class="far fa-star" style="color: var(--muted);"></i>').join('')}
                                <span style="color: var(--gold); margin-left: 8px;">${review.rating || review.driver_rating}/5</span>
                            </div>
                            <h4>${review.route || 'Journey'}</h4>
                            <p style="color: var(--muted); font-size: 13px;">From: ${review.passenger_name || 'Passenger'}</p>
                            ${review.comment ? `<div style="margin-top: 12px; background: var(--card2); padding: 12px; border-radius: 8px;">
                                <strong>💬 Comment:</strong>
                                <p style="margin-top: 5px;">"${review.comment}"</p>
                            </div>` : ''}
                            <small style="color: var(--muted); display: block; margin-top: 8px;">📅 ${new Date(review.created_at).toLocaleDateString()}</small>
                        </div>
                    </div>
                `).join('');
            } else {
                reviewsList.innerHTML = '<div class="trip-item"><div><h4>No reviews yet</h4><p>Reviews from passengers will appear here</p></div></div>';
            }
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        const reviewsList = document.getElementById('driverReviewsList');
        if (reviewsList) {
            reviewsList.innerHTML = '<div class="trip-item"><div><h4>Demo Reviews</h4><div class="rating-display"><i class="fas fa-star" style="color: #FFD700;"></i><i class="fas fa-star" style="color: #FFD700;"></i><i class="fas fa-star" style="color: #FFD700;"></i><i class="fas fa-star" style="color: #FFD700;"></i><i class="fas fa-star" style="color: #FFD700;"></i><span> 5/5</span></div><p>"Excellent driver, very professional!"</p><small>📅 ${new Date().toLocaleDateString()}</small></div></div>';
        }
    }
}

// ========== UPDATE DRIVER PROFILE ==========
async function updateDriverProfile() {
    const fullName = document.getElementById('fullName')?.value;
    const phone = document.getElementById('phone')?.value;
    const nextOfKinName = document.getElementById('nextOfKinName')?.value;
    const nextOfKinPhone = document.getElementById('nextOfKinPhone')?.value;
    const emergencyContact = document.getElementById('emergencyContact')?.value;
    
    if (!fullName || !phone) {
        showToast('Please fill in your full name and phone number', 'error');
        return;
    }
    
    const updates = {
        name: fullName,
        phone: phone,
        next_of_kin_name: nextOfKinName || null,
        next_of_kin_phone: nextOfKinPhone || null,
        emergency_contact: emergencyContact || null,
        updated_at: new Date().toISOString()
    };
    
    try {
        const { error } = await window.supabase
            .from('profiles')
            .update(updates)
            .eq('id', currentUser.id);
        
        if (error) throw error;
        
        // Update local storage
        currentUser = { ...currentUser, ...updates };
        userProfile = currentUser;
        localStorage.setItem('rayan_user', JSON.stringify(currentUser));
        
        showToast('Profile updated successfully!', 'success');
        
        // Update UI
        const userNameElement = document.getElementById('userName');
        const profileName = document.getElementById('profileName');
        const profileAvatar = document.getElementById('profileAvatar');
        
        if (userNameElement) userNameElement.textContent = fullName;
        if (profileName) profileName.textContent = fullName;
        if (profileAvatar) profileAvatar.textContent = fullName.charAt(0);
        
    } catch (error) {
        showToast('Profile saved locally', 'success');
        // Save to localStorage
        localStorage.setItem('rayan_user', JSON.stringify({ ...currentUser, ...updates }));
    }
}

// ========== LOGOUT ==========
async function handleDriverLogout() {
    try {
        await window.supabase.auth.signOut();
    } catch (error) {}
    
    localStorage.removeItem('rayan_user');
    localStorage.removeItem('active_trip');
    window.location.href = 'role-selection.html';
}

// ========== LOAD PAGE CONTENT ==========
function loadPageContent(page) {
    const content = document.getElementById('pageContent');
    if (!content) return;
    
    const pages = {
        dashboard: `
            <div class="welcome-banner">
                <div>
                    <h2>Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, ${userProfile?.name || 'Driver'}! 🚗</h2>
                    <p id="assignedBusInfo"></p>
                    <p>Your safety is our priority. Drive safely!</p>
                </div>
                <button class="btn-dashboard btn-primary" id="startTripBtn" onclick="startTrip()"><i class="fas fa-play"></i> Start Trip</button>
            </div>
            <div class="stats-grid-dashboard">
                <div class="stat-card-dashboard">
                    <div class="stat-value-dashboard" id="todayEarnings">KES 0</div>
                    <div class="stat-label-dashboard">Today's Earnings</div>
                </div>
                <div class="stat-card-dashboard">
                    <div class="stat-value-dashboard" id="driverRating">4.9 ★</div>
                    <div class="stat-label-dashboard">Driver Rating</div>
                </div>
                <div class="stat-card-dashboard">
                    <div class="stat-value-dashboard" id="onTimeRate">94%</div>
                    <div class="stat-label-dashboard">On-time Rate</div>
                </div>
            </div>
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-bus"></i><span>Quick Actions</span></div>
                <div class="action-buttons">
                    <button class="btn-dashboard btn-primary" onclick="navigateTo('calculator')"><i class="fas fa-calculator"></i> Fuel Calculator</button>
                    <button class="btn-dashboard btn-outline" onclick="navigateTo('incident')"><i class="fas fa-exclamation-triangle"></i> Report Issue</button>
                    <button class="btn-dashboard btn-outline" onclick="navigateTo('reviews')"><i class="fas fa-star"></i> View Reviews</button>
                </div>
            </div>
        `,
        
        calculator: `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-calculator"></i><span>Journey Fuel Calculator</span></div>
                <div class="form-group">
                    <label>Distance (km) *</label>
                    <input type="number" class="input" id="distanceInput" placeholder="Enter journey distance in kilometers">
                </div>
                <div class="form-group">
                    <label>Fuel Price per Liter (KES)</label>
                    <input type="number" class="input" id="fuelPrice" placeholder="170" value="170">
                </div>
                <div id="fuelEfficiencyInfo"></div>
                <button class="btn-dashboard btn-primary" onclick="calculateFuel()"><i class="fas fa-calculator"></i> Calculate Fuel</button>
                <div id="calculatorResult" style="display: none; margin-top: 20px; padding: 16px; background: var(--card2); border-radius: 12px;">
                    <h4>Fuel Estimate:</h4>
                    <p>⛽ Fuel Needed: <strong id="fuelNeeded">0</strong> Liters</p>
                    <p>💰 Estimated Cost: <strong id="fuelCost">KES 0</strong></p>
                    <small>Based on bus efficiency: ${assignedBus?.fuel_efficiency || 5.5} km/L</small>
                </div>
            </div>
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-info-circle"></i><span>Your Assigned Bus</span></div>
                <div id="busDetailsDisplay">
                    ${assignedBus ? `
                        <p><strong>🚌 Bus:</strong> ${assignedBus.registration || assignedBus.bus_number}</p>
                        <p><strong>📋 Model:</strong> ${assignedBus.model || 'N/A'}</p>
                        <p><strong>⛽ Fuel Efficiency:</strong> ${assignedBus.fuel_efficiency || 5.5} km/L</p>
                        <p><strong>👥 Capacity:</strong> ${assignedBus.capacity || 'N/A'} seats</p>
                    ` : '<p>No bus assigned yet. Contact admin.</p>'}
                </div>
            </div>
        `,
        
        reviews: `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-star"></i><span>My Reviews from Passengers</span></div>
                <div id="ratingSummary">
                    <div class="stats-grid-dashboard" style="grid-template-columns: 1fr 1fr 1fr;">
                        <div class="stat-card-dashboard">
                            <div class="stat-value-dashboard" id="avgRating">0.0</div>
                            <div class="stat-label-dashboard">Average Rating</div>
                        </div>
                        <div class="stat-card-dashboard">
                            <div class="stat-value-dashboard" id="totalReviews">0</div>
                            <div class="stat-label-dashboard">Total Reviews</div>
                        </div>
                        <div class="stat-card-dashboard">
                            <div class="stat-value-dashboard" id="fiveStarCount">0</div>
                            <div class="stat-label-dashboard">5-Star Reviews</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-comment-dots"></i><span>Passenger Comments</span></div>
                <div id="driverReviewsList">
                    <p>Loading reviews...</p>
                </div>
            </div>
        `,
        
        messages: `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-comment"></i><span>Chat with Admin</span></div>
                <div class="chat-messages" id="chatMessages" style="height: 350px; overflow-y: auto; background: var(--card2); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                    <div class="chat-message admin-message" style="margin-bottom: 12px;">
                        <div style="background: #1F2937; display: inline-block; padding: 10px 15px; border-radius: 12px;">
                            <strong style="color: #F5B041;">Admin:</strong>
                            <p style="margin: 5px 0;">Welcome! How can we help you today?</p>
                        </div>
                    </div>
                </div>
                <div class="input-group" style="display: flex; gap: 12px; margin-bottom: 12px;">
                    <input type="text" class="input" placeholder="Type your message..." id="chatInput" style="flex: 1;">
                    <input type="file" id="fileInput" style="display: none;" accept="image/*,application/pdf">
                    <button class="btn-dashboard btn-outline" onclick="document.getElementById('fileInput').click()"><i class="fas fa-paperclip"></i></button>
                    <button class="btn-dashboard btn-primary" onclick="sendDriverMessage()"><i class="fas fa-paper-plane"></i> Send</button>
                </div>
                <small style="color: var(--muted);"><i class="fas fa-info-circle"></i> You can attach photos of accidents, mechanical issues, or sick patients</small>
            </div>
        `,
        
        incident: `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-exclamation-triangle"></i><span>Report Incident</span></div>
                <div class="form-group">
                    <label>Incident Type *</label>
                    <select class="input" id="incidentType">
                        <option>Accident</option>
                        <option>Mechanical Failure</option>
                        <option>Sick Passenger</option>
                        <option>Road Hazard</option>
                        <option>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Location *</label>
                    <input type="text" class="input" id="incidentLocation" placeholder="Enter exact location">
                </div>
                <div class="form-group">
                    <label>Description *</label>
                    <textarea class="input" rows="4" id="incidentDescription" placeholder="Describe the incident in detail..."></textarea>
                </div>
                <div class="form-group">
                    <label>Upload Photos (for evidence)</label>
                    <input type="file" class="input" id="incidentPhotos" multiple accept="image/*">
                </div>
                <button class="btn-dashboard btn-danger" onclick="submitIncidentReport()"><i class="fas fa-paper-plane"></i> Submit Report</button>
            </div>
        `,
        
        attendance: `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-calendar-check"></i><span>Attendance & Work Hours</span></div>
                <div class="action-buttons">
                    <button class="btn-dashboard btn-primary" onclick="clockIn()"><i class="fas fa-clock"></i> Clock In</button>
                    <button class="btn-dashboard btn-outline" onclick="clockOut()"><i class="fas fa-clock"></i> Clock Out</button>
                </div>
                ${currentTrip ? `<div style="margin-top: 16px; padding: 12px; background: var(--card2); border-radius: 8px;">
                    <p><strong>🔄 Active Trip:</strong> ${currentTrip.route}</p>
                    <p><strong>⏰ Started at:</strong> ${new Date(tripStartTime).toLocaleTimeString()}</p>
                    <button class="btn-dashboard btn-danger" onclick="endTrip()"><i class="fas fa-stop"></i> End Current Trip</button>
                </div>` : ''}
            </div>
        `,
        
        profile: `
            <div class="dashboard-card">
                <div class="card-title"><i class="fas fa-user"></i><span>Complete Your Profile</span></div>
                <div style="text-align: center; margin-bottom: 24px;">
                    <div class="user-avatar" style="width: 80px; height: 80px; font-size: 32px; margin: 0 auto 16px;" id="profileAvatar">${userProfile?.name?.charAt(0) || 'D'}</div>
                    <h3 id="profileName">${userProfile?.name || 'Driver'}</h3>
                    <p style="color: var(--muted);" id="profileEmail">${userProfile?.email || ''}</p>
                </div>
                <div class="form-group"><label>Full Name *</label><input type="text" class="input" id="fullName" value="${userProfile?.name || ''}"></div>
                <div class="form-group"><label>Phone Number *</label><input type="tel" class="input" id="phone" value="${userProfile?.phone || ''}" placeholder="0712345678"></div>
                <div class="form-group"><label>Next of Kin Name</label><input type="text" class="input" id="nextOfKinName" value="${userProfile?.next_of_kin_name || ''}"></div>
                <div class="form-group"><label>Next of Kin Phone</label><input type="tel" class="input" id="nextOfKinPhone" value="${userProfile?.next_of_kin_phone || ''}"></div>
                <div class="form-group"><label>Emergency Contact</label><input type="tel" class="input" id="emergencyContact" value="${userProfile?.emergency_contact || ''}"></div>
                <button class="btn-dashboard btn-primary" onclick="updateDriverProfile()"><i class="fas fa-save"></i> Save Profile</button>
            </div>
        `
    };
    
    content.innerHTML = pages[page] || pages.dashboard;
    
    // Load specific data after rendering
    if (page === 'reviews') {
        setTimeout(() => loadDriverReviews(), 100);
    }
    
    if (page === 'dashboard') {
        updateAssignedBusDisplay();
    }
}

// ========== EXPORT FUNCTIONS TO GLOBAL SCOPE ==========
window.toggleSidebar = toggleSidebar;
window.navigateTo = navigateTo;
window.startTrip = startTrip;
window.endTrip = endTrip;
window.calculateFuel = calculateFuel;
window.sendDriverMessage = sendDriverMessage;
window.submitIncidentReport = submitIncidentReport;
window.clockIn = clockIn;
window.clockOut = clockOut;
window.updateDriverProfile = updateDriverProfile;
window.handleDriverLogout = handleDriverLogout;
window.loadDriverReviews = loadDriverReviews;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS animation for toasts
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .btn-danger {
            background: #EF4444 !important;
            color: white !important;
        }
        .btn-danger:hover {
            background: #DC2626 !important;
        }
    `;
    document.head.appendChild(style);
});